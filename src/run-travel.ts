import { processTravelRequest } from "./main.js";
import { getTravelRequest } from "./infra/travel-repository.js";

async function run() {
  console.log("1. Gerando solicitação de viagem...");
  const input = {
    requestId: "TEST-REAL-DB-01",
    requesterName: "Francisco Neto",
    requesterType: "student" as const,
    destination: "Parnaíba",
    departureDate: "2026-12-01",
    returnDate: "2026-12-05",
    reason: "Teste prático de integração com banco Docker",
    transportCostInCents: 15000,
  };

  // Chama o caso de uso (que dispara o save de forma assíncrona)
  const output = processTravelRequest(input);
  console.log("Resultado da análise:", output.status);

  // Aguarda um instante para o fire-and-forget terminar de salvar no banco
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log("2. Buscando no banco de dados real...");
  try {
    const savedRecord = await getTravelRequest("TEST-REAL-DB-01");

    if (savedRecord) {
      console.log("✅ SUCESSO! Registro encontrado no banco de dados:");
      console.log(savedRecord);
    } else {
      console.log("❌ FALHA: Registro não encontrado no banco.");
    }
  } catch (error) {
    console.error("❌ ERRO AO BUSCAR NO BANCO:", error);
  }
  
  process.exit(0);
}

run();