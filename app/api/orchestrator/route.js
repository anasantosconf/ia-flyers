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
Você é um ORQUESTRADOR DE TAREFAS.
Você conversa em português informal e entende respostas curtas como:
- "sim", "ok", "aprovado", "opção A" → aprovação
- pedidos de criação → criação

Seu papel:
1. Entender a intenção do usuário
2. Decidir a PRÓXIMA AÇÃO
3. Sempre responder em JSON válido
4. Nunca explique o JSON
5. Nunca use markdown

Formato OBRIGATÓRIO:
{
  "intent": "create | approve | chat | clarify",
  "response": "texto curto para o usuário",
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

    const content = completion.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return new Response(
        JSON.stringify({
          error: "Resposta do modelo não é JSON válido",
          raw: content
        }),
        { status: 500 }
      );
    }

    // 🔥 EXECUÇÃO AUTOMÁTICA
    if (parsed.next_action) {
      const res = await fetch(
        `${process.env.BASE_URL}/api/${parsed.next_action.call}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.next_action.payload)
        }
      );

      const data = await res.json();

      return new Response(
        JSON.stringify({
          ...parsed,
          executed: parsed.next_action.call,
          result: data
        }),
        { status: 200 }
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