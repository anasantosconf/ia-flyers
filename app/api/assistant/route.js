import { NextResponse } from "next/server";

let lastTask = null;

export async function POST(req) {
  const { command, action } = await req.json();

  // 1️⃣ Novo comando
  if (command) {
    if (command.toLowerCase().includes("flyer")) {
      lastTask = {
        type: "flyer",
        image_prompt: `
Professional flyer design,
dark gradient overlay,
cinematic lighting,
modern typography,
premium marketing aesthetic
        `.trim()
      };

      return NextResponse.json({
        step: "approval",
        task: lastTask,
        message: "Gerei o conceito do flyer. Posso prosseguir?"
      });
    }
  }

  // 2️⃣ Aprovação
  if (action === "approve" && lastTask) {
    return NextResponse.json({
      step: "approved",
      task: lastTask,
      message: "Aprovado. O que deseja fazer agora?",
      options: [
        "Salvar na pasta flyers",
        "Enviar para alguém",
        "Postar automaticamente"
      ]
    });
  }

  // 3️⃣ Fallback
  return NextResponse.json({
    message: "Não entendi o pedido"
  });
}