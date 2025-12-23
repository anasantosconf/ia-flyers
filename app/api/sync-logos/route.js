import { google } from "googleapis";

export async function POST(req) {
  try {
    // teste simples primeiro
    const logos = [{ nome: "teste" }];
    return new Response(JSON.stringify({ success: true, logos }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}