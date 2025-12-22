import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, message } = body;

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Mensagem ausente" }),
        { status: 400 }
      );
    }

    const systemPrompt = `
Você é um ORQUESTRADOR de tarefas de marketing.

Você entende português informal.
Seu trabalho é decidir ações automaticamente.

REGRAS IMPORTANTES:
- Se o usuário pedir para criar flyer → EXECUTE SEM PERGUNTAR
- Não peça mais detalhes se o pedido já for claro
- Sempre responda em JSON válido
- Nunca explique nada fora do JSON

Formato OBRIGATÓRIO:
{
  "intent": "create | chat",
  "response": "mensagem curta",
  "next_action": null | {
    "call": "generatePrompt",
    "payload": {}
  }
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ]
    });

    const raw = completion.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Resposta inválida do modelo",
          raw
        }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(parsed), { status: 200 });

  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Erro no orchestrator",
        message: err.message
      }),
      { status: 500 }
    );
  }
}