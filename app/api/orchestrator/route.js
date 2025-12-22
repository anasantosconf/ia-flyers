export async function POST(req) {
  return new Response(
    JSON.stringify({
      ok: true,
      route: "orchestrator",
      method: "POST"
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
}