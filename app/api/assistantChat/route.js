import { NextResponse } from "next/server";
import OpenAI from "openai";
import { google } from "googleapis";

// =======================
// Configuração OpenAI
// =======================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// =======================
// Configuração Google Drive
// =======================
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

// =======================
// Histórico em memória (substituir por DB real)
// =======================
let conversationHistory = {};

// =======================
// Função para salvar no Drive
// =======================
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

// =======================
// Endpoint
// =======================
export async function POST(req) {
  try {
    const { userId, message } = await req.json();
    if (!message || !userId) {
      return NextResponse.json(
        { error: "userId ou message ausente" },
        { status: 400 }
      );
    }

    // Inicializa histórico se não existir
    if (!conversationHistory[userId]) conversationHistory[userId] = [];

    // Adiciona mensagem do usuário
    conversationHistory[userId].push({ role: "user", content: message });

    // Se o usuário respondeu "approved", gera a imagem e salva no Drive
    if (message.toLowerCase() === "approved") {
      const lastTask = conversationHistory[userId].reverse().find(m => m.role === "assistant");
      if (lastTask && lastTask.content.task && lastTask.content.task.image_prompt) {
        // Aqui você chamaria a OpenAI para gerar a imagem (simulado)
        // const imageUrl = await openai.images.generate({ prompt: lastTask.content.task.image_prompt, size: "1024x1024" });
        const imageUrl = "https://via.placeholder.com/1024x1024.png?text=Imagem+Gerada"; // placeholder

        // Salvar no Drive
        const fileId = await saveToDrive("flyer.txt", lastTask.content.task.image_prompt);

        const response = {
          step: "completed",
          message: "Imagem gerada e salva no Drive!",
          imageUrl,
          fileId
        };

        // Adiciona no histórico
        conversationHistory[userId].push({ role: "assistant", content: response });
        return NextResponse.json(response);
      }
    }

    // Se não é aprovação, gerar conceito do flyer
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