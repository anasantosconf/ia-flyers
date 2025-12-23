// force-change-sync-logos
import { google } from "googleapis";
import fs from "fs";
import path from "path";

export async function POST() {
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    const ROOT_FOLDER_ID = process.env.DRIVE_FOLDER_ID;

    // 1. Buscar subpastas (seguros, financeiro, etc)
    const foldersRes = await drive.files.list({
      q: `'${ROOT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const logos = {};

    // 2. Para cada pasta, buscar os arquivos
    for (const folder of foldersRes.data.files) {
      const filesRes = await drive.files.list({
        q: `'${folder.id}' in parents and trashed=false`,
        fields: "files(id, name, mimeType, webViewLink)",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      logos[folder.name] = filesRes.data.files;
    }

    // 3. Salvar JSON local
    const filePath = path.join(process.cwd(), "logos.json");
    fs.writeFileSync(filePath, JSON.stringify(logos, null, 2));

    return Response.json({
      ok: true,
      message: "Logos sincronizadas com sucesso",
      folders: Object.keys(logos),
    });

  } catch (err) {
    return Response.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}