import fetch from "node-fetch"; // se Node 18+ não precisa, pode usar global fetch

const BASE_URL = "http://localhost:3002/api";

async function runFlow() {
  try {
    // 1️⃣ Orchestrator
    const orchestratorRes = await fetch(`${BASE_URL}/orchestrator`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Flyer de seguro residencial com tom de alerta",
        context: { categoria: "seguros" },
      }),
    });
    const orchestratorData = await orchestratorRes.json();
    console.log("Orchestrator:", orchestratorData);

    // Verifica se a próxima ação é generatePrompt
    if (
      orchestratorData.next_action &&
      orchestratorData.next_action.call === "generatePrompt"
    ) {
      const promptPayload = orchestratorData.next_action.payload || {
        text: "Flyer de seguro residencial com tom de alerta",
        categoria: "seguros",
      };

      // 2️⃣ GeneratePrompt
      const promptRes = await fetch(`${BASE_URL}/generatePrompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promptPayload),
      });
      const promptData = await promptRes.json();
      console.log("GeneratePrompt:", promptData);

      const imagePrompt = promptData.image_prompt;
      if (!imagePrompt) throw new Error("Prompt de imagem ausente");

      // 3️⃣ GenerateImage
      const imageRes = await fetch(`${BASE_URL}/generateImage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });
      const imageData = await imageRes.json();
      console.log("GenerateImage:", imageData);
    } else {
      console.log("Nenhuma ação de geração necessária.");
    }
  } catch (err) {
    console.error("Erro no fluxo:", err);
  }
}

// Executa
runFlow();