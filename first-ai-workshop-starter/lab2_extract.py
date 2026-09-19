"""Lab 2 - structured output. Turn messy notes into JSON your code can use.

Run:  python lab2_extract.py
"""
import os
import json

from openai import OpenAI

BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
MODEL = "gemini-3.6-flash"
client = OpenAI(api_key=os.environ["LLM_API_KEY"], base_url=BASE_URL)

SYSTEM = """You extract commitments from meeting notes.
Return ONLY valid JSON matching this shape:
{"action_items":[{"task":str,"owner":str,"due":str|null,
                  "priority":"high"|"medium"|"low"}]}

Rules:
- One entry per commitment; never merge two.
- owner must be a name that appears in the notes, or "unassigned".
  Never invent a person.
- due: ISO date if stated, else null.
- If there are no commitments, return an empty list."""

notes = open("notes/standup.txt", encoding="utf-8").read()

resp = client.chat.completions.create(
    model=MODEL,
    max_tokens=800,
    temperature=0,
    # JSON mode: the provider constrains the output so it MUST parse.
    # Ollama uses format="json" instead; older providers support neither,
    # which is why you still keep the try/except below.
    response_format={"type": "json_object"},
    messages=[
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": f"<notes>\n{notes}\n</notes>"},
    ],
)

raw = resp.choices[0].message.content
try:
    data = json.loads(raw)
except json.JSONDecodeError:
    print("Model returned invalid JSON. Raw output:\n", raw)
    raise

for it in data["action_items"]:
    due = it.get("due") or "-"
    print(f"[{it['priority']:>6}] {it['owner']:<12} {due:<12} {it['task']}")

# TRY THIS
# 1. Point it at a note with NO commitments. Empty list, or hallucination?
# 2. Add "blocked_by" to the schema and rerun. No parser change needed.
# 3. Remove response_format and see how much harder the prompt has to work.
