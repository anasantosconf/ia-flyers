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
Você é um ORQUESTRADOR DE IA.

Objetivo:
- Entender a intenção do usuário
- Executar automaticamente o próximo passo
- NÃO fazer perguntas desnecessárias

Regras:
- Se o usuário pedir criação de flyer → EXECUTE generatePrompt
- Não peça mais detalhes
- Responda sempre em JSON válido
- Nunca use markdown
- Nunca explique o JSON

Formato obrigatório:
{
  "intent": "create | approve | chat",
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

    const content = completion.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return new Response(
        JSON.stringify({
          error: "Resposta inválida do orquestrador",
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