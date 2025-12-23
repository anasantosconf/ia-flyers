export async function POST(req) {
  try {
    // Teste simples: retorna um JSON de confirmação
    const logos = [
      { id: "1", nome: "teste", link: "https://example.com/logo.png" }
    ];

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