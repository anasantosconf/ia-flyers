import { google } from "googleapis";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const folderId = process.env.DRIVE_FOLDER_ID;

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const drive = google.drive({ version: "v3", auth });

async function gerarJSONLogos() {
  if (!folderId) {
    throw new Error("DRIVE_FOLDER_ID não definido");
  }

  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id, name, mimeType, webViewLink)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const logos = res.data.files.map(file => ({
    id: file.id,
    nome: file.name,
    tipo: file.mimeType,
    link: file.webViewLink
  }));

  fs.writeFileSync("logos.json", JSON.stringify(logos, null, 2));
  console.log("logos.json gerado com sucesso");
}

gerarJSONLogos().catch(console.error);