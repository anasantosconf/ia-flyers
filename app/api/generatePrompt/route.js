import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const userText = body.text || "Criar um flyer genérico";
    const brand = body.brand || {
      name: "Minha Marca",
      colors: ["#FFD100", "#000000"],
      font: "Montserrat"
    };

    const prompt = `
Você é um gerador de prompts profissional. 
Entrada do usuário: "${userText}"

Gere apenas um JSON válido SEM explicações ou texto adicional, com o seguinte formato:

{
  "image_prompt": "...",  
  "video_prompt": "...",
  "chart_spec": { ... } ou null,
  "caption": "...",
  "hashtags": ["..."],
  "variations": ["...", "..."]
}

Siga a identidade visual da marca: 
Nome: ${brand.name}
Cores: ${brand.colors.join(", ")}
Fonte: ${brand.font}

O prompt da imagem deve ser ideal para 1080x1350 (feed do Instagram).  
O prompt do vídeo deve ter cenas, duração e estilo visual.  
O chart_spec deve ser em Vega-Lite caso necessário.
    `;

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000
      })
    });

    const data = await r.json();
    const content = data.choices?.[0]?.message?.content;

    try {
      const json = JSON.parse(content);
      return NextResponse.json(json);
    } catch (e) {
      // Tenta extrair o JSON mesmo que haja texto extra
      const match = content.match(/\{[\s\S]*\}$/);
      if (match) {
        return NextResponse.json(JSON.parse(match[0]));
      }
      return NextResponse.json({ error: "Resposta inválida da IA", raw: content }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}