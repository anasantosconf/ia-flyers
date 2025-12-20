import { NextResponse } from "next/server";

const sessions = new Map();

export async function POST(req) {
  try {
    const { userId, message } = await req.json();

    if (!userId || !message) {
      return NextResponse.json(
        { error: "userId e message são obrigatórios" },
        { status: 400 }
      );
    }

    const session = sessions.get(userId) || {
      step: "conversation",
      task: null
    };

    // APROVAÇÃO
    if (session.step === "approval" && message.toLowerCase() === "approved") {
      session.step = "done";
      sessions.set(userId, session);

      return NextResponse.json({
        step: "done",
        message: "Perfeito 👍 Flyer aprovado e pronto para os próximos passos."
      });
    }

    // PRIMEIRA CONVERSA
    if (session.step === "conversation") {
      session.step = "approval";
      session.task = {
        type: "flyer",
        image_prompt:
          "Professional flyer design, dark gradient overlay, cinematic lighting, modern typography, premium marketing aesthetic"
      };

      sessions.set(userId, session);

      return NextResponse.json({
        step: "approval",
        task: session.task,
        message: "Criei o conceito do flyer. Posso prosseguir?"
      });
    }

    return NextResponse.json({
      step: session.step,
      message: "Estou aguardando sua confirmação."
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro no assistente", details: err.message },
      { status: 500 }
    );
  }
}