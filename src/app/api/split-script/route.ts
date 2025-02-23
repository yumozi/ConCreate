import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { script } = await req.json();

    const prompt = `Split the following video script into parts, each part should be 10-30 words, have a somewhat clear semantic focus so that a stock video can be used as the background. Make sure parts don't cut any sentences mid-sentence. After the part, suggest a concise search query for a stock video fitting for that part. (i.e. "man in suit"). You should return in the format of 
    """
    Part 1 content.... (QUERY)Query for part 1
    ===
    Part 2 content.... (QUERY)Query for part 2
    ===
    ...
    ===
    Part n content.... (QUERY)Query for part n
    """

    Do not include any other text in your response, just the parts and queries in the format above.
    
    The script is: ${script}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { "role": "user", "content": prompt }
      ],
      max_tokens: 3000,
    });

    let responseContent = response.choices[0].message.content?.trim() || "";

    // Remove everything before the first ``` if present
    const firstCodeBlockIndex = responseContent.indexOf("```");
    if (firstCodeBlockIndex !== -1) {
        responseContent = responseContent.slice(firstCodeBlockIndex + 3).trim();
    }

    // Remove ```plaintext and ``` markers
    responseContent = responseContent.replace(/```plaintext/g, "").replace(/```markdown/g, "").replace(/```/g, "").replace(/"""/g, "").trim();

    console.log(responseContent);

    const parts = responseContent.split('===').map(part => {
      const [text, query] = part.split('(QUERY)');
      return { text: text.trim(), query: query.trim() };
    }) || [];

    return NextResponse.json({ parts });
  } catch (error) {
    console.error("Error in split-script:", error);
    return NextResponse.error();
  }
}