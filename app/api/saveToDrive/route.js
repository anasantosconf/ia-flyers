import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(req) {
  try {
    const body = await req.json();

    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/drive.file"]
    );

    const drive = google.drive({ version: "v3", auth });

    const fileMetadata = {
      name: `flyer-${Date.now()}.json`,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
    };

    const media = {
      mimeType: "application/json",
      body: JSON.stringify(body, null, 2)
    };

    await drive.files.create({
      requestBody: fileMetadata,
      media
    });

    return NextResponse.json({
      step: "saved",
      message: "Arquivo salvo no Google Drive com sucesso!"
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao salvar no Drive", details: error.message },
      { status: 500 }
    );
  }
}