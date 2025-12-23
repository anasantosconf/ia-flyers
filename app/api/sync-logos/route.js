export async function POST(req) {
  return new Response(JSON.stringify({ success: true, message: "Rota funcionando!" }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}