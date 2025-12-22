import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, message, context } = body;

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Mensagem ausente" }),
        { status: 400 }
      );
    }

    const systemPrompt = `
Você é um ORQUESTRADOR DE AUTOMAÇÃO.

Você NÃO conversa por conversar.
Você decide o próximo passo do sistema.

Seu trabalho é:
1. Identificar a INTENÇÃO do usuário
2. Decidir se deve chamar uma função
3. Retornar SEMPRE um JSON estruturado

INTENÇÕES:
- create → criar flyer, vídeo, post, arte
- approve → "sim", "ok", "aprovado"
- chat → conversa genérica
- clarify → falta informação

REGRAS:
- Nunca peça muitos detalhes
- Seja objetiva
- Sempre responda em JSON válido
- Nunca use markdown
- Nunca explique o JSON

FORMATO DE RESPOSTA OBRIGATÓRIO:
{
  "intent": "create | approve | chat | clarify",
  "response": "mensagem curta para o usuário",
  "next_action": null | {
    "call": "generatePrompt | generateImage | saveToDrive",
    "payload": { }
  }
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `
Contexto atual:
${JSON.stringify(context || {}, null, 2)}

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
          error: "Resposta inválida do orquestrador",
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