// app/api/sync-logos/route.js
export async function POST(req) {
  try {
    // Apenas teste, não faz nada ainda
    const data = { message: "Rota POST funcionando!" };
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}