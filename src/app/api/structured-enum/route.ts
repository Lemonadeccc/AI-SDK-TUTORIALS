import { generateText, Output } from "ai";
import { deepseek } from "@ai-sdk/deepseek";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const result = await generateText({
      model: deepseek("deepseek-chat"),
      output: Output.choice({ options: ["positive", "negative", "neutral"] }),
      prompt: `Classify the sentiment in this text: "${text}"`,
    });

    return Response.json(result.output);
  } catch (error) {
    console.error("Error generating sentiment:", error);
    return new Response("Failed to generate sentiment", { status: 500 });
  }
}
