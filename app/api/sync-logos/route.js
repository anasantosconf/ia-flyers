// force-change-sync-logos
import { google } from "googleapis";
import fs from "fs";
import path from "path";

export async function POST() {
  try {
    // 🔐 Variáveis de ambiente
    const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
    const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
    const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID;

    if (!CLIENT_EMAIL || !PRIVATE_KEY || !DRIVE_FOLDER_ID) {
      return new Response(
        JSON.stringify({
          error: "Variáveis de ambiente não definidas",
        }),
        { status: 500 }
      );
    }

    // 🔑 Autenticação Google
    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    // 📁 Busca subpastas dentro da pasta LOGOS
    const foldersRes = await drive.files.list({
      q: `'${DRIVE_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const logos = {};

    for (const folder of foldersRes.data.files) {
      const filesRes = await drive.files.list({
        q: `'${folder.id}' in parents and trashed=false`,
        fields: "files(id, name, mimeType, webViewLink)",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      logos[folder.name] = filesRes.data.files;
    }

    // 💾 Salva JSON local (opcional, mas útil)
    const outputPath = path.join(process.cwd(), "logos.json");
    fs.writeFileSync(outputPath, JSON.stringify(logos, null, 2));

    return new Response(
      JSON.stringify({
        ok: true,
        logos,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        error: "Erro ao sincronizar logos",
        message: error.message,
      }),
      { status: 500 }
    );
  }
}