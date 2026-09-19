"""Lab 3 - Study Buddy: a complete RAG application in one file.

Load -> chunk -> embed -> retrieve -> generate.

Run:  python rag.py
"""
import os
import glob

import numpy as np
from openai import OpenAI
from sentence_transformers import SentenceTransformer

# ---------------------------------------------------------------- PROVIDER
# Change these TWO lines to switch provider. Nothing else in this file
# (or in the whole workshop) has to change.

# Google AI Studio - free, no credit card:  https://aistudio.google.com/apikey
BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
MODEL = "gemini-3.6-flash"
# BASE_URL = "https://api.groq.com/openai/v1"
# MODEL    = "qwen/qwen3.8-27b"

# Groq - free, no credit card, very fast:   https://console.groq.com/keys
# BASE_URL = "https://api.groq.com/openai/v1"
# MODEL    = "llama-3.3-70b-versatile"

# Ollama - 100% offline, no key at all:     https://ollama.com  (ollama pull llama3.2)
# BASE_URL = "http://localhost:11434/v1"
# MODEL    = "llama3.2"

client = OpenAI(
    api_key=os.environ.get("LLM_API_KEY", "ollama-needs-no-key"),
    base_url=BASE_URL,
)

embedder = SentenceTransformer("all-MiniLM-L6-v2")  # local, free, no API key

NOTES_GLOB = "notes/*.txt"
CACHE = "index.npy"


# --------------------------------------------------------------- 1. LOAD
def load_docs(pattern=NOTES_GLOB):
    docs = []
    for path in sorted(glob.glob(pattern)):
        with open(path, encoding="utf-8") as f:
            docs.append((os.path.basename(path), f.read()))
    if not docs:
        raise SystemExit(
            f"No files matched {pattern!r}. Are you in the right directory, "
            "and does notes/ contain .txt files?"
        )
    return docs


# --------------------------------------------------------------- 2. CHUNK
def chunk(text, size=180, overlap=40):
    """Slide a window of `size` words forward by (size - overlap) each step.

    Overlap stops a fact being guillotined across a boundary. If your answers
    are vague, shrink `size` before you touch anything else.
    """
    words = text.split()
    step = size - overlap
    return [" ".join(words[i:i + size]) for i in range(0, max(len(words), 1), step)]


docs = load_docs()
chunks = [{"source": name, "text": c} for name, text in docs for c in chunk(text)]
print(f"{len(docs)} docs -> {len(chunks)} chunks")


# --------------------------------------------------------------- 3. EMBED
# This NumPy array IS your vector database. It runs on your CPU: no key,
# no quota, no rate limit. Reach for Chroma / FAISS / pgvector at ~100k
# chunks, not before.
vectors = None
if os.path.exists(CACHE):
    cached = np.load(CACHE)
    if len(cached) == len(chunks):          # notes unchanged -> reuse
        vectors = cached

if vectors is None:
    vectors = embedder.encode(
        [c["text"] for c in chunks],
        normalize_embeddings=True,          # length 1 => dot product == cosine
        show_progress_bar=True,
    )
    np.save(CACHE, vectors)

print("index:", vectors.shape)


# --------------------------------------------------------------- 4. RETRIEVE
def retrieve(question, k=3, floor=0.25):
    """Return up to k (chunk, score) pairs above the similarity floor.

    The floor matters: without it, a nonsense question still hands the model
    three irrelevant chunks and invites a hallucination.
    """
    qv = embedder.encode([question], normalize_embeddings=True)[0]
    scores = vectors @ qv                          # cosine against every chunk
    order = np.argsort(scores)[::-1][:k]
    return [(chunks[i], float(scores[i])) for i in order if scores[i] >= floor]


# --------------------------------------------------------------- 5. GENERATE
SYSTEM = """You answer questions about the user's personal study notes.

Rules:
- Use ONLY the text inside <context>. Never use outside knowledge.
- After each claim, cite the source file in square brackets, e.g. [syllabus.txt].
- If <context> does not contain the answer, reply exactly: "Not in my notes."
  Do not guess.
- Be concise: 3 sentences maximum."""


def ask(question):
    hits = retrieve(question)
    if not hits:
        return "Not in my notes.", []

    # The <context> tags draw a hard line between instructions and data.
    # Retrieved text is UNTRUSTED input - this is your prompt-injection guard.
    context = "\n\n".join(f"[{h['source']}] {h['text']}" for h, _ in hits)

    resp = client.chat.completions.create(
        model=MODEL,
        max_tokens=500,
        temperature=0,
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content":
                f"<context>\n{context}\n</context>\n\nQuestion: {question}"},
        ],
    )
    return resp.choices[0].message.content, hits


if __name__ == "__main__":
    print("\nAsk questions about your notes. Type quit to exit.")
    print("Try: (1) something stated almost word-for-word in your notes,")
    print("     (2) the same thing in totally different words,")
    print("     (3) something the model knows but your notes do NOT contain.\n")
    while True:
        q = input("Ask: ").strip()
        if q.lower() in {"quit", "exit"}:
            break
        if not q:
            continue
        answer, hits = ask(q)
        print("\n" + answer)
        print("  sources:", ", ".join(f"{h['source']} ({s:.2f})" for h, s in hits) or "none", "\n")
