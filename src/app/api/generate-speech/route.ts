import { openai } from "@ai-sdk/openai";
import { experimental_generateSpeech as generateSpeech } from "ai";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const { audio } = await generateSpeech({
      model: openai.speech("tts-1"),
      text: text,
    });

    const audioBuffer = audio.uint8Array.buffer.slice(
      audio.uint8Array.byteOffset,
      audio.uint8Array.byteOffset + audio.uint8Array.byteLength
    );

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": audio.mediaType || "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("Error generating speech:", error);
    return new Response("Failed to generate speech", { status: 500 });
  }
}
