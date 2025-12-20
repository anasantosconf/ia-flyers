import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
    const body = await req.json();
    const userMessage = body.message;

    if (!userMessage) {
      return NextResponse.json({
        error: "Mensagem não enviada"
      }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Você é um assistente pessoal inteligente.
Converse de forma natural, em português.
Ajude o usuário a se organizar, responder dúvidas
e orientar tarefas do dia a dia.
`
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    return NextResponse.json({
      reply: completion.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({
      error: "Erro no assistente",
      details: error.message
    }, { status: 500 });
  }
}