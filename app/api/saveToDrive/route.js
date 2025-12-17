export const runtime = "nodejs";
import crypto from "crypto";

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getAccessToken() {
  const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/drive.file",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  const unsignedToken =
    base64url(JSON.stringify(header)) +
    "." +
    base64url(JSON.stringify(payload));

  const sign = crypto.createSign("RSA-SHA256");
  sign.update(unsignedToken);
  sign.end();

  const signature = sign.sign(serviceAccount.private_key);
  const jwt = unsignedToken + "." + base64url(signature);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });

  const data = await res.json();
  return data.access_token;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const token = await getAccessToken();

    const content = `
Tipo: ${body.type}
Status: ${body.status}
Prompt:
${body.image_prompt}
Data: ${new Date().toISOString()}
`;

    const upload = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: new FormData([
          [
            "metadata",
            new Blob(
              [
                JSON.stringify({
                  name: `flyer-${Date.now()}.txt`,
                  parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
                })
              ],
              { type: "application/json" }
            )
          ],
          [
            "file",
            new Blob([content], { type: "text/plain" })
          ]
        ])
      }
    );

    const result = await upload.json();

    return new Response(
      JSON.stringify({
        step: "saved",
        fileId: result.id
      }),
      { headers: { "Content-Type": "application/json" } }
    );
} catch (err) {
  return new Response(
    JSON.stringify({
      error: "Erro ao salvar no Drive",
      message: err.message,
      stack: err.stack
    }),
    { status: 500 }
  );
}