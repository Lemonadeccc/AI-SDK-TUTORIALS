import { streamObject } from "ai";
import { deepseek } from "@ai-sdk/deepseek";
import { recipeSchema } from "./schema";

export async function POST(req: Request) {
  try {
    const { dish } = await req.json();

    const result = streamObject({
      model: deepseek("deepseek-chat"),
      schema: recipeSchema,
      prompt: `Create a recipe for ${dish}`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error streaming object:", error);
    return Response.json({ error: "Failed to stream object" }, { status: 500 });
  }
}
