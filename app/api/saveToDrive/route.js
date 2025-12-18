// Força Node runtime, evita erro de build Turbopack
export const runtime = "nodejs";

export async function POST(request) {
  try {
    // 1️⃣ Ler body
    const body = await request.json();
    const { fileName, contentBase64 } = body;

    if (!fileName || !contentBase64) {
      return new Response(
        JSON.stringify({
          error: "Parâmetros obrigatórios ausentes",
          expected: ["fileName", "contentBase64"]
        }),
        { status: 400 }
      );
    }

    // 2️⃣ Verifica variável de ambiente
    const rawCreds = process.env.GOOGLE_SERVICE_ACCOUNT;

    if (!rawCreds) {
      return new Response(
        JSON.stringify({
          error: "GOOGLE_SERVICE_ACCOUNT não configurado no Vercel"
        }),
        { status: 500 }
      );
    }

    // 3️⃣ Parse seguro do JSON
    let credentials;
    try {
      credentials = JSON.parse(rawCreds);
    } catch (e) {
      return new Response(
        JSON.stringify({
          error: "GOOGLE_SERVICE_ACCOUNT não é JSON válido"
        }),
        { status: 500 }
      );
    }

    // 4️⃣ Import dinâmico do googleapis
    const { google } = await import("googleapis");

    // 5️⃣ Autenticação
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ["https://www.googleapis.com/auth/drive.file"]
    );

    const drive = google.drive({ version: "v3", auth });

    // 6️⃣ Converter base64 para Buffer
    const buffer = Buffer.from(contentBase64, "base64");

    // 7️⃣ Upload
    const uploadResponse = await drive.files.create({
      requestBody: { name: fileName },
      media: { mimeType: "image/png", body: buffer }
    });

    return new Response(
      JSON.stringify({
        success: true,
        fileId: uploadResponse.data.id
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Erro inesperado ao salvar no Drive",
        message: err?.message || "Erro desconhecido",
        stack: err?.stack
      }),
      { status: 500 }
    );
  }
}