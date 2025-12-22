import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, message, context = {} } = body;

    if (!message) {
      return Response.json({ error: "Mensagem ausente" }, { status: 400 });
    }

    const systemPrompt = `
Você é um ORQUESTRADOR DE AÇÕES.
Você entende português informal.
Seu trabalho é decidir ações automaticamente.

REGRAS IMPORTANTES:
- Se o usuário pedir criação de flyer → EXECUTE automaticamente
- Não peça detalhes óbvios
- Use padrões inteligentes quando faltar info
- Só peça confirmação se for publicar ou gastar dinheiro
- Sempre responda em JSON válido
- Nunca explique nada fora do JSON

AÇÕES DISPONÍVEIS:
- generatePrompt
- generateImage
- saveToDrive

FORMATO OBRIGATÓRIO:
{
  "intent": "create | approve | chat",
  "response": "texto para o usuário",
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
Contexto atual:
${JSON.stringify(context, null, 2)}

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
    } catch (e) {
      return Response.json(
        { error: "Resposta inválida da IA", raw: content },
        { status: 500 }
      );
    }

    return Response.json(parsed, { status: 200 });

  } catch (err) {
    return Response.json(
      {
        error: "Erro no orquestrador",
        message: err.message
      },
      { status: 500 }
    );
  }
}