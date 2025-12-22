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
Você é um ASSISTENTE PESSOAL inteligente e conversacional.
Você entende português informal do Brasil.

Seu trabalho é:
1. Entender a intenção do usuário
2. Manter uma conversa natural
3. Quando tiver informações suficientes, decidir a próxima ação

INTENÇÕES:
- create → criar algo (flyer, post, imagem)
- approve → aprovação ("sim", "ok", "aprovado")
- chat → conversa geral
- clarify → pedir mais informações

AÇÕES POSSÍVEIS:
- generatePrompt
- generateImage
- saveToDrive

Responda SEMPRE em JSON válido.
Nunca explique o JSON.
Formato obrigatório:

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
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `
Contexto:
${JSON.stringify(context || {}, null, 2)}

Mensagem do usuário:
"${message}"
`
        }
      ]
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