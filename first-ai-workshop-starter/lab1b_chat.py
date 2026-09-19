"""Lab 1b - multi-turn chat. The API is stateless; YOU are the memory.

Run:  python lab1b_chat.py
"""
import os
from openai import OpenAI

BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
MODEL    = "gemini-3.6-flash"
client   = OpenAI(api_key=os.environ["LLM_API_KEY"], base_url=BASE_URL)

SYSTEM = {"role": "system",
          "content": "You are a patient study buddy. Use short paragraphs "
                     "and concrete examples."}

history = []                                   # <- this list IS the memory

print("Chat started. Type quit to exit.")
while True:
    q = input("\nYou: ").strip()
    if q.lower() in {"quit", "exit"}:
        break
    if not q:
        continue

    history.append({"role": "user", "content": q})

    resp = client.chat.completions.create(
        model=MODEL,
        max_tokens=1000,
        messages=[SYSTEM] + history,           # the WHOLE conversation, every time
    )
    answer = resp.choices[0].message.content
    history.append({"role": "assistant", "content": answer})
    print("\nBot:", answer)

# TRY THIS
# Ask "What is a stack?" then just "Give me an example." -> it works.
# Now comment out the two history.append lines and ask the follow-up again.
# That is statelessness, felt.
