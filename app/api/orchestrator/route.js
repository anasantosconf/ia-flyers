import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { userId, message, context } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Mensagem ausente" }),
        { status: 400 }
      );
    }

    const systemPrompt = `
Você é um ORQUESTRADOR DE IA.

Seu papel é:
- Entender a intenção do usuário em português informal
- Decidir automaticamente o próximo passo
- NÃO pedir confirmação desnecessária
- NÃO fazer perguntas se já for possível agir

Regras:
- Se o usuário pedir para criar algo visual → gerar flyer automaticamente
- Se disser "sim", "ok", "aprovado" → continuar o fluxo
- Sempre responder em JSON válido
- Nunca usar markdown
- Nunca explicar o JSON

Formato obrigatório:
{
  "intent": "create | approve | chat",
  "response": "texto curto para o usuário",
  "next_action": null | {
    "call": "generatePrompt | generateImage | saveToDrive",
    "payload": {}
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
Contexto:
${JSON.stringify(context || {}, null, 2)}

Mensagem do usuário:
"${message}"
`,
        },
      ],
    });

    const raw = completion.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return new Response(
        JSON.stringify({
          error: "Resposta inválida do modelo",
          raw,
        }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(parsed), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Erro no orchestrator",
        message: err.message,
      }),
      { status: 500 }
    );
  }
}