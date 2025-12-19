import { google } from "googleapis";

export async function POST(req) {
  try {
    const body = await req.json();
    const { content, fileName } = body;

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
      },
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: "v3", auth });

    const file = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [process.env.GOOGLE_SHARED_DRIVE_ID],
      },
      media: {
        mimeType: "text/plain",
        body: content,
      },
      supportsAllDrives: true,
    });

    return new Response(
      JSON.stringify({ ok: true, fileId: file.data.id }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Erro ao salvar no Drive",
        message: err.message,
      }),
      { status: 500 }
    );
  }
}