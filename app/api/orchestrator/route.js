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
Você é um ORQUESTRADOR de tarefas de marketing.

Você conversa naturalmente em português informal.
Seu trabalho é entender a intenção do usuário e decidir o próximo passo.

INTENÇÕES:
- create → criar algo (flyer, post, imagem)
- approve → quando o usuário diz "sim", "ok", "aprovado"
- chat → conversa normal
- clarify → quando falta informação

REGRAS IMPORTANTES:
- Sempre responda APENAS JSON válido
- Nunca explique o JSON
- Nunca use markdown
- Seja direto e objetivo

FORMATO OBRIGATÓRIO:
{
  "intent": "create | approve | chat | clarify",
  "response": "mensagem para o usuário",
  "next_action": null | {
    "call": "generatePrompt | generateImage | saveToDrive",
    "payload": { }
  }
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.3,
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
    } catch {
      return new Response(
        JSON.stringify({
          error: "Resposta do modelo não é JSON válido",
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