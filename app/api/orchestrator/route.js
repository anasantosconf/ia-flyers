import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function callInternalAPI(route, payload) {
  const res = await fetch(`${process.env.BASE_URL}/api/${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return res.json();
}

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
Você é um assistente pessoal inteligente e orquestrador de tarefas.
Você entende português informal.
Você decide a INTENÇÃO do usuário e o PRÓXIMO PASSO.

Intenções possíveis:
- create (criar algo)
- approve (aprovar algo)
- chat (conversa)
- clarify (pedir mais informações)

Formato OBRIGATÓRIO da resposta (JSON válido):
{
  "intent": "create | approve | chat | clarify",
  "response": "texto para o usuário",
  "next_action": null | {
    "call": "generatePrompt | generateImage | saveToDrive",
    "payload": { }
  }
}
Nunca explique o JSON.
Nunca use markdown.
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
    const parsed = JSON.parse(raw);

    // 🔁 EXECUÇÃO AUTOMÁTICA
    let executionResult = null;

    if (parsed.next_action) {
      executionResult = await callInternalAPI(
        parsed.next_action.call,
        parsed.next_action.payload
      );
    }

    return new Response(
      JSON.stringify({
        ...parsed,
        executed: parsed.next_action?.call || null,
        result: executionResult
      }),
      { status: 200 }
    );

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