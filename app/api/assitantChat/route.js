import { NextResponse } from "next/server";

// Aqui você pode usar um banco de dados simples ou memória temporária
// Para este exemplo, vamos usar memória (não persistirá entre deploys)
let conversationHistory = [];

export async function POST(req) {
  try {
    const { message, userId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Mensagem ausente" }, { status: 400 });
    }

    // Adiciona mensagem do usuário ao histórico
    conversationHistory.push({ role: "user", content: message, userId });

    // Aqui você chamaria a IA (OpenAI ou Gemini)
    // Para exemplo, vamos simular uma resposta
    let assistantResponse = {
      step: "approval",
      task: {
        type: "flyer",
        image_prompt:
          "Professional flyer design, dark gradient overlay, cinematic lighting, modern typography, premium marketing aesthetic"
      },
      message: "Gerei o conceito do flyer. Posso prosseguir?"
    };

    // Adiciona resposta da IA ao histórico
    conversationHistory.push({ role: "assistant", content: assistantResponse, userId });

    return NextResponse.json(assistantResponse);
  } catch (err) {
    return NextResponse.json(
      { error: "Erro no assistente", message: err.message },
      { status: 500 }
    );
  }
}