import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// memória simples (por enquanto)
const sessions = new Map();

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, message } = body;

    if (!userId || !message) {
      return new Response(
        JSON.stringify({ error: "userId e message são obrigatórios" }),
        { status: 400 }
      );
    }

    const session = sessions.get(userId) || {
      step: "conversation",
      task: null
    };

    // Se o usuário aprovou
    if (message.toLowerCase() === "approved" && session.task) {
      session.step = "approved";
      sessions.set(userId, session);

      return new Response(
        JSON.stringify({
          step: "approved",
          task: session.task,
          message: "Perfeito! Tarefa aprovada. Posso continuar."
        }),
        { status: 200 }
      );
    }

    // IA interpreta a intenção
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Você é um assistente pessoal.
Identifique se o usuário quer criar algo (flyer, post, tarefa)
ou apenas conversar.
Responda de forma objetiva.
          `
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    const aiText = completion.choices[0].message.content;

    // Exemplo simples: detectar flyer
    if (aiText.toLowerCase().includes("flyer")) {
      session.step = "approval";
      session.task = {
        type: "flyer",
        image_prompt:
          "Professional flyer design, dark gradient overlay, cinematic lighting, modern typography, premium marketing aesthetic"
      };

      sessions.set(userId, session);

      return new Response(
        JSON.stringify({
          step: "approval",
          task: session.task,
          message: "Gerei o conceito do flyer. Posso prosseguir?"
        }),
        { status: 200 }
      );
    }

    // Conversa normal
    sessions.set(userId, session);

    return new Response(
      JSON.stringify({
        step: "conversation",
        message: aiText
      }),
      { status: 200 }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Erro no assistente",
        message: err.message
      }),
      { status: 500 }
    );
  }
}