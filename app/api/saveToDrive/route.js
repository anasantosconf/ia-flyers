import { google } from "googleapis";

/**
 * POST /api_temp/saveToDrive
 * Body:
 * {
 *   "content": "texto ou html",
 *   "fileName": "arquivo.txt"
 * }
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { content, fileName } = body;

    if (!content || !fileName) {
      return new Response(
        JSON.stringify({ error: "content e fileName são obrigatórios" }),
        { status: 400 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
      },
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    const drive = google.drive({ version: "v3", auth });

    const file = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: process.env.GOOGLE_DRIVE_FOLDER_ID
          ? [process.env.GOOGLE_DRIVE_FOLDER_ID]
          : undefined,
      },
      media: {
        mimeType: "text/plain",
        body: content,
      },
    });

    return new Response(
      JSON.stringify({
        ok: true,
        fileId: file.data.id,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Erro saveToDrive:", err);

    return new Response(
      JSON.stringify({
        error: "Erro ao salvar no Drive",
        message: err.message,
      }),
      { status: 500 }
    );
  }
}