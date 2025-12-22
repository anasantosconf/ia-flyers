import { NextResponse } from "next/server";

async function callAPI(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, message, context = {} } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Mensagem ausente" },
        { status: 400 }
      );
    }

    // 1️⃣ CHAMA O ASSISTENTE
    const assistantResponse = await callAPI(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/assistant`,
      { userId, message, context }
    );

    let updatedContext = { ...context };

    // 2️⃣ SE NÃO TEM PRÓXIMA AÇÃO → RESPONDE NORMAL
    if (!assistantResponse.next_action) {
      return NextResponse.json({
        message: assistantResponse.response,
        context: updatedContext
      });
    }

    const { call, payload } = assistantResponse.next_action;

    // 3️⃣ EXECUTA A AÇÃO
    let actionResult;

    if (call === "generatePrompt") {
      actionResult = await callAPI(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/generatePrompt`,
        payload
      );
      updatedContext.prompt = actionResult;
    }

    if (call === "generateImage") {
      actionResult = await callAPI(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/generateImage`,
        payload
      );
      updatedContext.image = actionResult;
    }

    if (call === "saveToDrive") {
      actionResult = await callAPI(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/saveToDrive`,
        payload
      );
      updatedContext.drive = actionResult;
    }

    // 4️⃣ RESPONDE AO USUÁRIO
    return NextResponse.json({
      message: assistantResponse.response,
      context: updatedContext
    });

  } catch (err) {
    return NextResponse.json(
      {
        error: "Erro no orquestrador",
        message: err.message
      },
      { status: 500 }
    );
  }
}