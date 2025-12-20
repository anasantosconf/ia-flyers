import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, message, context } = body;

    if (!userId || !message) {
      return Response.json(
        { error: "userId ou message ausente" },
        { status: 400 }
      );
    }

    const normalized = message.toLowerCase().trim();

    /**
     * ===============================
     * 1️⃣ INTERCEPTAÇÃO MANUAL (CRÍTICO)
     * ===============================
     */
    if (
      ["sim", "ok", "pode", "aprovado", "aprovar"].includes(normalized) &&
      context?.lastStep === "approval" &&
      context?.image_prompt
    ) {
      return Response.json({
        intent: "approve",
        response: "Perfeito! Vou gerar o material agora.",
        next_action: {
          call: "generateImage",
          payload: {
            image_prompt: context.image_prompt
          }
        }
      });
    }

    if (normalized.includes("salvar") && context?.fileContent) {
      return Response.json({
        intent: "save",
        response: "Certo, vou salvar no Drive.",
        next_action: {
          call: "saveToDrive",
          payload: {
            content: context.fileContent,
            fileName: context.fileName || "arquivo.txt"
          }
        }
      });
    }

    /**
     * ===============================
     * 2️⃣ IA PARA INTENÇÕES NÃO ÓBVIAS
     * ===============================
     */
    const systemPrompt = `
Você é um assistente controlador de fluxo.
Você NÃO é um chatbot.

Seu trabalho é:
- Identificar a intenção do usuário
- Decidir o próximo passo

Regras obrigatórias:
- Sempre responda em JSON válido
- Nunca explique o JSON
- Nunca use markdown
- Nunca responda sem intenção

Intenções possíveis:
- create
- approve
- clarify
- chat

Formato OBRIGATÓRIO:
{
  "intent": "create | approve | clarify | chat",
  "response": "mensagem curta ao usuário",
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
      return Response.json(
        {
          error: "Resposta inválida da IA",
          raw
        },
        { status: 500 }
      );
    }

    return Response.json(parsed);

  } catch (err) {
    return Response.json(
      {
        error: "Erro no assistant",
        message: err.message
      },
      { status: 500 }
    );
  }
}