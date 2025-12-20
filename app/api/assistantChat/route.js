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
Você é um assistente pessoal inteligente, conversacional e proativo.
Você entende linguagem natural em português informal.
Seu trabalho é identificar a INTENÇÃO do usuário e decidir o próximo passo.

Regras:
- Se o usuário disser "sim", "ok", "pode", "aprovado" → intenção = approve
- Se pedir criação → intenção = create
- Se estiver confuso → peça esclarecimento
- Sempre responda em JSON válido
- Nunca explique o JSON
- Nunca use markdown

Formato de resposta OBRIGATÓRIO:

{
  "intent": "create | approve | clarify | chat",
  "response": "texto para o usuário",
  "next_action": null | {
    "call": "generatePrompt | generateImage | saveToDrive",
    "payload": { }
  }
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
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
      ],
      temperature: 0.4
    });

    const content = completion.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return new Response(
        JSON.stringify({
          error: "Resposta inválida do assistente",
          raw: content
        }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(parsed), { status: 200 });

  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Erro no assistantChat",
        message: err.message
      }),
      { status: 500 }
    );
  }
}