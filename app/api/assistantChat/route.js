import { NextResponse } from "next/server";
import OpenAI from "openai";
import { google } from "googleapis";

// Configuração OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configuração Google Drive
const auth = new google.auth.GoogleAuth({
  credentials: {
    type: process.env.GOOGLE_TYPE,
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI,
    token_uri: process.env.GOOGLE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL
  },
  scopes: ["https://www.googleapis.com/auth/drive.file"]
});
const drive = google.drive({ version: "v3", auth });

// Histórico em memória
let conversationHistory = {};

// Função para salvar no Drive
async function saveToDrive(fileName, content) {
  const fileMetadata = {
    name: fileName,
    parents: [process.env.GOOGLE_SHARED_DRIVE_ID]
  };
  const media = {
    mimeType: "text/plain",
    body: content
  };

  const file = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: "id"
  });

  return file.data.id;
}

// Endpoint POST
export async function POST(req) {
  try {
    const { userId, message } = await req.json();
    if (!message || !userId) {
      return NextResponse.json(
        { error: "userId ou message ausente" },
        { status: 400 }
      );
    }

    if (!conversationHistory[userId]) conversationHistory[userId] = [];
    conversationHistory[userId].push({ role: "user", content: message });

    // Aprovação do flyer
    if (message.toLowerCase() === "approved") {
      const lastTask = conversationHistory[userId]
        .slice()
        .reverse()
        .find(m => m.role === "assistant" && m.content.task && m.content.task.image_prompt);

      if (lastTask) {
        const imageUrl = "https://via.placeholder.com/1024x1024.png?text=Imagem+Gerada"; // placeholder
        const fileId = await saveToDrive(
          `flyer-${Date.now()}.txt`,
          lastTask.content.task.image_prompt
        );

        const response = {
          step: "completed",
          message: "Imagem gerada e salva no Drive!",
          imageUrl,
          fileId
        };

        conversationHistory[userId].push({ role: "assistant", content: response });
        return NextResponse.json(response);
      } else {
        return NextResponse.json(
          { error: "Nenhuma tarefa anterior encontrada para gerar a imagem" },
          { status: 400 }
        );
      }
    }

    // Se não for aprovação, gera conceito do flyer
    const assistantResponse = {
      step: "approval",
      task: {
        type: "flyer",
        image_prompt:
          "Professional flyer design, dark gradient overlay, cinematic lighting, modern typography, premium marketing aesthetic"
      },
      message: "Gerei o conceito do flyer. Posso prosseguir?"
    };

    conversationHistory[userId].push({ role: "assistant", content: assistantResponse });
    return NextResponse.json(assistantResponse);

  } catch (err) {
    return NextResponse.json(
      { error: "Erro no assistente", message: err.message },
      { status: 500 }
    );
  }
}