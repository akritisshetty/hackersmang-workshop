"""Lab 1 - your first API call.

Run:  python lab1_hello.py
"""
import os
from openai import OpenAI

# ---- Google AI Studio: free, no credit card. https://aistudio.google.com/apikey
BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
MODEL    = "gemini-3.6-flash"
# BASE_URL = "https://api.groq.com/openai/v1"
# MODEL    = "qwen/qwen3.8-27b"
# ---- or Ollama (local): BASE_URL = "http://localhost:11434/v1"
#                         MODEL    = "llama3.2"

client = OpenAI(api_key=os.environ["LLM_API_KEY"], base_url=BASE_URL)

resp = client.chat.completions.create(
    model=MODEL,
    max_tokens=1000,          # hard cap on the ANSWER - it truncates, it does not summarise
    temperature=0.2,         # 0 = repeatable, 1 = creative
    messages=[
        {"role": "system", "content":
        "" "You are a concise teaching assistant. "
                                      "Answer in under 60 words. No preamble."},
        {"role": "user",   "content": "Explain recursion to a first-year student."},
    ],
)

print(resp.choices[0].message.content)
print("\n--- tokens  in:", resp.usage.prompt_tokens,
      " out:", resp.usage.completion_tokens)

# TRY THIS
# 1. Delete the system message. How does the answer change?
# 2. temperature=1.0, run 3x. Then temperature=0, run 3x.
# 3. max_tokens=20. Notice it is CUT OFF, not shortened.
