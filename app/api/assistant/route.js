import OpenAI from "openai";

export async function POST(req) {
  try {
    // ⚠️ Inicializa AQUI, não fora
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "OPENAI_API_KEY não configurada" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const body = await req.json();
    const { message } = body;

    if (!message) {
      return Response.json(
        { message: "Mensagem ausente" },
        { status: 400 }
      );
    }

    // Exemplo simples de uso
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Você é um assistente pessoal." },
        { role: "user", content: message }
      ]
    });

    return Response.json({
      reply: completion.choices[0].message.content
    });

  } catch (err) {
    return Response.json(
      {
        error: "Erro no assistant",
        details: err.message
      },
      { status: 500 }
    );
  }
}