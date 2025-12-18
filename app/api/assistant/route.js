import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req) {
  const { command, action, task, choice } = await req.json();

  // Novo comando
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

  // Aprovação
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

  // Escolha
  if (choice === "save" && task) {
    const folder = path.join(process.cwd(), "data", "flyers");
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const filename = `flyer-${Date.now()}.json`;
    fs.writeFileSync(
      path.join(folder, filename),
      JSON.stringify(task, null, 2)
    );

    return NextResponse.json({
      step: "saved",
      message: "Flyer salvo com sucesso!",
      file: filename
    });
  }

  return NextResponse.json({ message: "Não entendi o pedido" });
}