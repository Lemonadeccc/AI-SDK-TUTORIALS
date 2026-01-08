const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const IMAGE_MODEL = "bytedance-seed/seedream-4.5";

type OpenRouterImage = {
  image_url?: {
    url?: string;
  };
};

type OpenRouterMessage = {
  images?: OpenRouterImage[];
  content?: unknown;
};

type OpenRouterChatResponse = {
  choices?: Array<{
    message?: OpenRouterMessage;
  }>;
  error?: {
    message?: string;
  };
};

const getImageUrlFromContent = (content: unknown): string | null => {
  if (!Array.isArray(content)) {
    return null;
  }

  for (const item of content) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const typed = item as {
      type?: string;
      image_url?: { url?: string };
      imageUrl?: { url?: string };
    };

    if (typed.type === "image_url") {
      return typed.image_url?.url ?? typed.imageUrl?.url ?? null;
    }
  }

  return null;
};

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Missing OPENROUTER_API_KEY" },
        { status: 500 }
      );
    }

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    const data = (await response.json()) as OpenRouterChatResponse;

    if (!response.ok) {
      return Response.json(
        { error: data?.error?.message || "Failed to generate image" },
        { status: response.status }
      );
    }

    const message = data.choices?.[0]?.message;
    const imageUrl =
      message?.images?.[0]?.image_url?.url ??
      getImageUrlFromContent(message?.content);

    if (!imageUrl) {
      return Response.json(
        { error: "No image returned from model" },
        { status: 502 }
      );
    }

    return Response.json({ dataUrl: imageUrl });
  } catch (error) {
    console.error("Error generating image:", error);
    return Response.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
