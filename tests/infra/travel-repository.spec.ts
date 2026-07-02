import { beforeEach, describe, expect, it, vi } from "vitest";

const input = {
  requestId: "TR-900",
  requesterName: "Alice Johnson",
  requesterType: "employee" as const,
  destination: "Teresina",
  departureDate: "2026-07-01",
  returnDate: "2026-07-03",
  reason: "Business travel",
  transportCostInCents: 5000,
};

const output = {
  requestId: "TR-900",
  status: "approved" as const,
  travelDays: 3,
  dailyAmountInCents: 18000,
  subtotalInCents: 54000,
  totalAmountInCents: 59000,
  errors: [] as string[],
  warnings: [] as string[],
};

describe("saveTravelRequest", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.DATABASE_URL = "postgres://test:test@localhost:5432/test_db";
  });

  it("calls query on successful save", async () => {
    // 1. Simula apenas o método query
    const queryMock = vi.fn().mockResolvedValue(undefined);

    // 2. Mocka a classe Pool (que é a usada na implementação)
    vi.doMock("pg", () => ({
      Pool: vi.fn(() => ({
        query: queryMock,
      })),
    }));

    const { saveTravelRequest } = await import("../../src/infra/travel-repository.js");

    await expect(saveTravelRequest(input, output)).resolves.toBeUndefined();

    // 3. Verifica se a query foi chamada corretamente
    expect(queryMock).toHaveBeenCalledOnce();
    expect(queryMock.mock.calls[0][0]).toContain("INSERT INTO travel_requests");
  });

  it("bubbles up repository errors", async () => {
    // 1. Simula uma falha no banco de dados
    const queryMock = vi.fn().mockRejectedValue(new Error("db failure"));

    vi.doMock("pg", () => ({
      Pool: vi.fn(() => ({
        query: queryMock,
      })),
    }));

    const { saveTravelRequest } = await import("../../src/infra/travel-repository.js");

    // 2. Espera que o erro seja propagado (rejeitado), pois a implementação não possui try/catch
    await expect(saveTravelRequest(input, output)).rejects.toThrow("db failure");

    expect(queryMock).toHaveBeenCalledOnce();
  });
});