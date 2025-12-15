import { NextResponse } from "next/server";

export async function POST(req) {
  const { command } = await req.json();

  if (!command) {
    return NextResponse.json(
      { error: "Comando não enviado" },
      { status: 400 }
    );
  }

  // Simulação inteligente (sem IA paga)
  let response = {
    type: "unknown",
    message: "Não entendi o pedido"
  };

  if (command.toLowerCase().includes("flyer")) {
    response = {
      type: "flyer",
      image_prompt: `
Professional flyer design,
dark gradient overlay,
cinematic lighting,
modern typography,
high contrast,
premium marketing aesthetic,
clear visual hierarchy
      `.trim(),
      approval_question: "Posso gerar esse flyer?"
    };
  }

  if (command.toLowerCase().includes("vídeo")) {
    response = {
      type: "video",
      video_prompt: `
Cinematic promotional video,
smooth transitions,
corporate mood,
soft lighting,
professional color grading,
subtle motion graphics
      `.trim(),
      approval_question: "Posso montar esse vídeo?"
    };
  }

  return NextResponse.json(response);
}