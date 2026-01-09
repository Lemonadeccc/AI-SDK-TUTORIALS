import { OpenRouter } from "@openrouter/sdk";

export const runtime = "nodejs";

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

type ChatStreamChunk = {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
};

const isAsyncIterable = <T,>(value: unknown): value is AsyncIterable<T> =>
  !!value &&
  typeof (value as AsyncIterable<T>)[Symbol.asyncIterator] === "function";

const getTextFromResponse = (response: unknown): string | null => {
  if (!response || typeof response !== "object") {
    return null;
  }

  const content = (
    response as { choices?: Array<{ message?: { content?: unknown } }> }
  ).choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    const text = content
      .map((part) => {
        if (!part || typeof part !== "object") {
          return "";
        }
        const typed = part as { type?: string; text?: string };
        return typed.type === "text" ? typed.text ?? "" : "";
      })
      .join("")
      .trim();

    return text || null;
  }

  return null;
};

const getAudioFormat = (file: File) => {
  const type = file.type.toLowerCase();
  const typeMap: Record<string, string> = {
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/wave": "wav",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/ogg": "ogg",
    "audio/webm": "webm",
    "audio/mp4": "mp4",
    "audio/aac": "aac",
    "audio/flac": "flac",
    "audio/x-flac": "flac",
    "audio/m4a": "m4a",
    "audio/x-m4a": "m4a",
  };

  if (typeMap[type]) {
    return typeMap[type];
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext) {
    const allowed = ["wav", "mp3", "ogg", "webm", "mp4", "m4a", "aac", "flac"];
    if (allowed.includes(ext)) {
      return ext;
    }
  }

  return "wav";
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof File)) {
      return Response.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return Response.json(
        { error: "Missing OPENROUTER_API_KEY" },
        { status: 500 }
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");
    const format = getAudioFormat(audioFile);

    const streamResult = await openrouter.chat.send({
      model: "openai/gpt-4o-audio-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "What is in this audio?",
            },
            {
              type: "input_audio",
              inputAudio: {
                data: base64Audio,
                format,
              },
            },
          ],
        },
      ],
      stream: true,
    } as unknown as Parameters<typeof openrouter.chat.send>[0]);

    if (!isAsyncIterable<ChatStreamChunk>(streamResult)) {
      const fallbackText = getTextFromResponse(streamResult);
      if (fallbackText) {
        return new Response(fallbackText, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
          },
        });
      }

      return Response.json(
        { error: "No streaming response from model" },
        { status: 502 }
      );
    }

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (streamError) {
          console.error("Error streaming transcription:", streamError);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to transcribe audio",
      },
      { status: 500 }
    );
  }
}
