import { UIMessage, streamText, convertToModelMessages } from "ai";
import { deepseek } from "@ai-sdk/deepseek";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    const result = streamText({
      model: deepseek("deepseek-chat"),
      messages: await convertToModelMessages(messages),
    });

    result.usage.then((usage) => {
      console.log({
        messageCount: messages.length,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      });
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming text:", error);
    return Response.json({ error: "Failed to stream text" }, { status: 500 });
  }
}
