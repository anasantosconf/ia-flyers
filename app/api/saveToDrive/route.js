import { google } from "googleapis";

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

    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/drive"]
    );

    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.create({
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      requestBody: {
        name: fileName,
        parents: [process.env.GOOGLE_SHARED_DRIVE_ID], // ✅ AQUI
      },
      media: {
        mimeType: "text/plain",
        body: content,
      },
    });

    return new Response(
      JSON.stringify({ ok: true, fileId: response.data.id }),
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