import { GROQ_KEY } from "../keys";

export async function askAI(prompt, tokens = 1000) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: tokens,
    }),
  });

  const d = await res.json();

  if (!res.ok) {
    throw new Error(d.error?.message || "Groq API Error");
  }

  return d.choices?.[0]?.message?.content || "";
}

export function parseJSON(raw) {
  try {
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    return null;
  }
}