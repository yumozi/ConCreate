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

    const prompt = `Generate a natural-sounding script for a YouTube video that is around ${wordCount} words. The script should purely be what the narrator should say, exactly as they would say it, without any other formatting or instructions. Assume there will be stock videos in the background playing, their content will be relevant to but not exactly the same as the script. The description is: ${description}`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {"role": "user", "content": prompt}
        ],
        max_tokens: 2048,
    })
    
    let script = response.choices[0].message.content?.trim() || "";

    // Remove everything before the first ``` if present
    const firstCodeBlockIndex = script.indexOf("```");
    if (firstCodeBlockIndex !== -1) {
        script = script.slice(firstCodeBlockIndex + 3).trim();
    }

    // Remove ```plaintext and ``` markers
    script = script.replace(/```plaintext/g, "").replace(/```markdown/g, "").replace(/```/g, "").replace(/"""/g, "").trim();

    console.log("Generated script: ", script);

    return NextResponse.json({ script });
  } catch (error) {
    console.error("Error in generate-script:", error);
    return NextResponse.error();
  }
}