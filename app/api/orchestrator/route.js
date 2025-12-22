import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, message, context = {} } = body;

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Mensagem ausente" }),
        { status: 400 }
      );
    }

    const systemPrompt = `
Você é um ASSISTENTE ORQUESTRADOR.
Você conversa em português informal e entende intenção humana.

Sua função:
- Entender o que o usuário quer
- Decidir o próximo passo do sistema

INTENÇÕES:
- create → usuário quer criar algo
- approve → usuário aprovou algo
- chat → conversa normal
- clarify → falta informação

REGRAS:
- Sempre responder APENAS JSON
- Nunca explicar nada fora do JSON
- Nunca usar markdown

FORMATO OBRIGATÓRIO:
{
  "intent": "create | approve | chat | clarify",
  "response": "texto para o usuário",
  "next_action": null | {
    "call": "generatePrompt | generateImage | saveToDrive",
    "payload": {}
  }
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `
Contexto atual:
${JSON.stringify(context, null, 2)}

Mensagem do usuário:
"${message}"
`
        }
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