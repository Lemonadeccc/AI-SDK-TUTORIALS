import { OpenRouter } from "@openrouter/sdk";
import type { UserMessageContent } from "@openrouter/sdk/models";
import { Buffer } from "node:buffer";

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const normalizeAudioFormat = (mimeType: string, filename: string) => {
  const fromMime = mimeType.split("/")[1] ?? "";
  const fromName = filename.split(".").pop() ?? "";
  const raw = (fromMime || fromName || "wav").toLowerCase();

  if (raw === "x-wav" || raw === "wave") {
    return "wav";
  }

  if (raw === "mpeg") {
    return "mp3";
  }

  return raw;
};

export async function POST(req: Request) {
  const formData = await req.formData();
  const audio = formData.get("audio");

  if (!(audio instanceof File)) {
    return Response.json({ error: "Audio file is required" }, { status: 400 });
  }

  const audioBuffer = Buffer.from(await audio.arrayBuffer());
  const audioBase64 = audioBuffer.toString("base64");
  const audioFormat = normalizeAudioFormat(audio.type, audio.name);

  const messageContent: UserMessageContent = [
    {
      type: "input_audio",
      inputAudio: {
        data: audioBase64,
        format: audioFormat,
      },
    },
    {
      type: "text",
      text: "Transcribe the audio.",
    },
  ];

  const stream = await openrouter.chat.send({
    model: "google/gemini-3-flash-preview",
    messages: [
      {
        role: "user",
        content: messageContent,
      },
    ],
    stream: true,
    streamOptions: {
      includeUsage: true,
    },
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          controller.enqueue(encoder.encode(content));
        }

        const usage = chunk.usage as
          | {
              reasoningTokens?: number;
              completionTokensDetails?: { reasoningTokens?: number };
            }
          | undefined;
        const reasoningTokens =
          usage?.reasoningTokens ??
          usage?.completionTokensDetails?.reasoningTokens;

        if (typeof reasoningTokens === "number") {
          console.log("\nReasoning tokens:", reasoningTokens);
        }
      }
      controller.close();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
