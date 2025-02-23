import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Add type for the request body
interface GenerateScriptRequest {
  description: string;
  videoLength: "15s" | "1m" | "5min";
}

export async function POST(req: Request) {
  try {
    const { description, videoLength }: GenerateScriptRequest = await req.json();

    // Convert videoLength to word count (15s=50, 1m=200, 5min=1000)
    const mapping: Record<string, number> = { "15s": 50, "1m": 200, "5min": 1000 };
    const wordCount = mapping[videoLength] || 50;

    const prompt = `Generate a natural-sounding script for a YouTube video that is around ${wordCount} words, the description is: ${description}`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {"role": "user", "content": prompt}
        ],
        max_tokens: 2048,
    })
    
    const script = response.choices[0].message.content?.trim() || "";

    return NextResponse.json({ script });
  } catch (error) {
    console.error("Error in generate-script:", error);
    return NextResponse.error();
  }
}