import { google } from "googleapis";

export async function POST(req) {
  try {
    const body = await req.json();

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
      scopes: ["https://www.googleapis.com/auth/drive.file"]
    });

    const drive = google.drive({ version: "v3", auth });

    const content = `
Tipo: ${body.type}
Status: ${body.status}
Prompt:
${body.image_prompt}
Data: ${new Date().toISOString()}
`;

    const file = await drive.files.create({
      requestBody: {
        name: `flyer-${Date.now()}.txt`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
      },
      media: {
        mimeType: "text/plain",
        body: content
      }
    });

    return new Response(
      JSON.stringify({
        step: "saved",
        fileId: file.data.id
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Erro ao salvar no Drive",
        details: error.message
      }),
      { status: 500 }
    );
  }
}