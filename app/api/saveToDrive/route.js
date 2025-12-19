import { google } from "googleapis";

export async function POST(req) {
  try {
    const { content, fileName } = await req.json();

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
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: "v3", auth });

    const file = await drive.files.create({
      supportsAllDrives: true,
      requestBody: {
        name: fileName,
        driveId: process.env.GOOGLE_SHARED_DRIVE_ID,
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
    console.error("Drive error:", err);

    return new Response(
      JSON.stringify({
        error: "Erro ao salvar no Drive",
        message: err.message,
      }),
      { status: 500 }
    );
  }
}