# Build Your First AI-Powered Application — starter kit

Everything from the 60-minute workshop, ready to run. **Total cost: zero.**

## Setup (do this before the session)

```bash
python --version                       # need 3.10+
python -m venv .venv
source .venv/bin/activate              # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Get a free API key — no credit card, no expiry — at
**https://aistudio.google.com/apikey**, then:

```bash
export LLM_API_KEY="AIza..."           # Windows: setx LLM_API_KEY "AIza..."
```

Pre-download the local embedding model (~90 MB) on your own wifi, not when the
whole room hits the network at once:

```bash
python -c "from sentence_transformers import SentenceTransformer; \
SentenceTransformer('all-MiniLM-L6-v2')"
```

## Wait — why does it say `pip install openai`?

Because the OpenAI request format became the de-facto standard, and nearly every
provider now speaks it. The `openai` package here is just a **universal HTTP
client**. We are not using OpenAI and not paying anyone.

To switch provider, change **two lines** at the top of each file:

| Provider | `BASE_URL` | `MODEL` | Free tier |
|---|---|---|---|
| **Google AI Studio** (default) | `https://generativelanguage.googleapis.com/v1beta/openai/` | `gemini-3.6-flash` | No card, ~15 req/min, ~1,500/day |
| **Groq** | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` | No card, ~30 req/min |
| **Ollama** (offline) | `http://localhost:11434/v1` | `llama3.2` | Unlimited, no key, no internet |

Model names change every few months. If you get a 404, check your provider's
current model list and update the `MODEL` constant.

For Ollama: install from ollama.com, run `ollama pull llama3.2`, and set
`LLM_API_KEY` to any non-empty string — it's ignored.

## What's here

| File | What it is | Run it with |
|---|---|---|
| `lab1_hello.py` | Your first API call | `python lab1_hello.py` |
| `lab1b_chat.py` | Multi-turn chat — you build the memory | `python lab1b_chat.py` |
| `lab2_extract.py` | Messy notes → validated JSON | `python lab2_extract.py` |
| `rag.py` | **The main project.** Full RAG app in one file | `python rag.py` |
| `app.py` | Streamlit UI on top of `rag.py` | `streamlit run app.py` |
| `eval_runner.py` | Scores the app against `evals.csv` | `python eval_runner.py` |
| `notes/` | Sample documents — **replace these with your own** | |
| `evals.csv` | 13 test questions, 3 of which must be refused | |

## How to use this during the workshop

Type the code yourself. You'll learn far more from fixing your own typo than from
running a finished file. These files exist so that if you fall behind, you can
copy one in and rejoin the group rather than debugging alone.

## Three tests that matter

Once `rag.py` runs, try:

1. **The easy hit** — something stated almost word-for-word in your notes.
   It should answer and cite the right file.
2. **The paraphrase** — the same question in completely different words.
   This is the test keyword search fails; it's why you used embeddings.
3. **The trap** — "Who won the 2011 Cricket World Cup?" The model definitely
   knows this. Your notes don't contain it. It must say **"Not in my notes."**

Test 3 is the one that separates a toy from a product.

## Then measure

```bash
python eval_runner.py
```

Change **one** thing — chunk size, `k`, the similarity floor, the system prompt —
re-run, and see whether the score moved. Most people never do this, which is
exactly why doing it makes your project stand out.

## Notes on the free tier

- **Embeddings cost nothing and hit no quota.** They run on your CPU, so you can
  iterate on chunking and retrieval as much as you like. Only the final generate
  step uses your daily request allowance.
- `429 RESOURCE_EXHAUSTED` means you hit the rate limit (~15 requests/minute on
  Gemini's free tier). Wait a minute, or add retry with exponential backoff.
- **Free tiers are usually free because your prompts may be used for training.**
  Don't put anyone's personal data, medical information or confidential documents
  through one. If you need privacy, switch `BASE_URL` to Ollama and run offline.
- `index.npy` caches your vectors and rebuilds when the number of chunks changes.
  Delete it to force a rebuild.
- Never commit your API key. `.gitignore` already covers `.env`.
