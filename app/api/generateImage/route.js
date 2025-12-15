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

    const openaiResponse = await fetch(
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

    const result = await openaiResponse.json();

    if (!openaiResponse.ok) {
      return NextResponse.json(
        {
          error: "Erro da OpenAI",
          details: result
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      image_url: result.data?.[0]?.url
    });

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