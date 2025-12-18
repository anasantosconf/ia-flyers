import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt ausente" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt,
          size: "1024x1024"
        })
      }
    );

    const result = await response.json();

    // 👉 Se a OpenAI devolver erro explícito
    if (!response.ok) {
      return NextResponse.json(
        { error: "Erro da OpenAI", details: result },
        { status: 500 }
      );
    }

    // 👉 Caso venha URL
    if (result.data && result.data[0]?.url) {
      return NextResponse.json({
        type: "url",
        image: result.data[0].url
      });
    }

    // 👉 Caso venha base64
    if (result.data && result.data[0]?.b64_json) {
      return NextResponse.json({
        type: "base64",
        image: result.data[0].b64_json
      });
    }

    // 👉 Caso inesperado
    return NextResponse.json(
      {
        error: "Formato de resposta inesperado",
        raw: result
      },
      { status: 500 }
    );

  } catch (err) {
    return NextResponse.json(
      {
        error: "Erro interno",
        details: err.message
      },
      { status: 500 }
    );
  }
}