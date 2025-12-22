export async function POST() {
  return new Response(
    JSON.stringify({ ok: true, from: "orchestrator" }),
    { status: 200 }
  );
}