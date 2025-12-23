import 'dotenv/config'; // lê o .env automaticamente
import { google } from 'googleapis';
import fs from 'fs';

const privateKey = process.env.GOOGLE_PRIVATE_KEY
  ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : null;

if (!process.env.GOOGLE_CLIENT_EMAIL || !privateKey || !process.env.DRIVE_FOLDER_ID) {
  console.error('Erro: alguma variável do .env não foi definida corretamente.');
  process.exit(1);
}

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: privateKey,
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

async function gerarJSONLogos() {
  try {
    const res = await drive.files.list({
      q: `'${process.env.DRIVE_FOLDER_ID}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, webViewLink)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const arquivos = res.data.files.map(f => ({
      id: f.id,
      nome: f.name,
      tipo: f.mimeType,
      link: f.webViewLink,
    }));

    fs.writeFileSync('logos.json', JSON.stringify(arquivos, null, 2));
    console.log('Arquivo logos.json gerado com sucesso!');
  } catch (err) {
    console.error('Erro ao gerar JSON:', err);
  }
}

gerarJSONLogos();