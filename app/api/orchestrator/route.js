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
Você entende português informal.
Seu papel é identificar a intenção do usuário e decidir o próximo passo.

Regras:
- Se o usuário disser "sim", "ok", "pode", "aprovado" → intent = approve
- Se pedir criação → intent = create
- Se estiver confuso → intent = clarify
- Conversa normal → intent = chat

Sempre responda APENAS JSON válido neste formato:

{
  "intent": "create | approve | clarify | chat",
  "response": "texto para o usuário",
  "next_action": null | {
    "call": "generatePrompt | generateImage | saveToDrive",
    "payload": {}
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
          error: "Resposta inválida do modelo",
          raw: content
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