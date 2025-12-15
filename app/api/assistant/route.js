import { NextResponse } from "next/server";

export async function POST(req) {
  const { command, action, task } = await req.json();

  // 1️⃣ Novo comando
  if (command) {
    if (command.toLowerCase().includes("flyer")) {
      const newTask = {
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
        task: newTask,
        message: "Gerei o conceito do flyer. Posso prosseguir?"
      });
    }
  }

  // 2️⃣ Aprovação COM CONTEXTO
  if (action === "approve" && task) {
    return NextResponse.json({
      step: "approved",
      task,
      message: "Aprovado. O que deseja fazer agora?",
      options: [
        "Salvar na pasta flyers",
        "Enviar para alguém",
        "Postar automaticamente"
      ]
    });
  }

  return NextResponse.json({
    message: "Não entendi o pedido"
  });
}