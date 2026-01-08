import { streamText, Output } from "ai";
import { deepseek } from "@ai-sdk/deepseek";
import { pokemonSchema } from "./schema";

export async function POST(req: Request) {
  try {
    const { type } = await req.json();

    const result = streamText({
      model: deepseek("deepseek-chat"),
      output: Output.array({ element: pokemonSchema }),
      prompt: `Generate a list of 5 ${type} type pokemon`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error generating pokemon:", error);
    return new Response("Failed to generate pokemon", { status: 500 });
  }
}
