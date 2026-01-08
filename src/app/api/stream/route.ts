import { streamText } from "ai";
import { deepseek } from "@ai-sdk/deepseek";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const result = streamText({
      model: deepseek("deepseek-chat"),
      prompt,
    });
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming text:", error);
    return Response.json({ error: "Failed to stream text" }, { status: 500 });
  }
}
