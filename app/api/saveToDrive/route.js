export const runtime = "nodejs";

export async function POST() {
  return new Response(
    JSON.stringify({ status: "ok" }),
    {
      headers: { "Content-Type": "application/json" }
    }
  );
}