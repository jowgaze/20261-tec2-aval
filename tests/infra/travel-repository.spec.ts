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

describe("Travel Repository", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.DATABASE_URL = "postgres://test:test@localhost:5432/test_db";
  });

  describe("saveTravelRequest", () => {
    it("calls query on successful save", async () => {
      const queryMock = vi.fn().mockResolvedValue(undefined);

      vi.doMock("pg", () => ({
        Pool: vi.fn(() => ({
          query: queryMock,
        })),
      }));

      const { saveTravelRequest } = await import("../../src/infra/travel-repository.js");

      await expect(saveTravelRequest(input, output)).resolves.toBeUndefined();

      expect(queryMock).toHaveBeenCalledOnce();
      expect(queryMock.mock.calls[0][0]).toContain("INSERT INTO travel_requests");
    });

    it("bubbles up repository errors", async () => {
      const queryMock = vi.fn().mockRejectedValue(new Error("db failure"));

      vi.doMock("pg", () => ({
        Pool: vi.fn(() => ({
          query: queryMock,
        })),
      }));

      const { saveTravelRequest } = await import("../../src/infra/travel-repository.js");

      await expect(saveTravelRequest(input, output)).rejects.toThrow("db failure");

      expect(queryMock).toHaveBeenCalledOnce();
    });
  });

  describe("getTravelRequest", () => {
    it("returns the travel request when found in the database", async () => {
      const mockDbRow = {
        id: "TR-123",
        requester_name: "Bob",
        status: "approved"
      };
      
      // Simula o retorno padrão do driver pg contendo a propriedade "rows"
      const queryMock = vi.fn().mockResolvedValue({ rows: [mockDbRow] });

      vi.doMock("pg", () => ({
        Pool: vi.fn(() => ({
          query: queryMock,
        })),
      }));

      const { getTravelRequest } = await import("../../src/infra/travel-repository.js");

      const result = await getTravelRequest("TR-123");

      expect(queryMock).toHaveBeenCalledOnce();
      expect(queryMock.mock.calls[0][0]).toContain("SELECT * FROM travel_requests WHERE id = $1");
      expect(queryMock.mock.calls[0][1]).toEqual(["TR-123"]); // Garante que passou o ID como parâmetro
      expect(result).toEqual(mockDbRow);
    });

    it("returns null when no travel request is found", async () => {
      // Simula um retorno onde o banco não encontrou nenhum registro
      const queryMock = vi.fn().mockResolvedValue({ rows: [] });

      vi.doMock("pg", () => ({
        Pool: vi.fn(() => ({
          query: queryMock,
        })),
      }));

      const { getTravelRequest } = await import("../../src/infra/travel-repository.js");

      const result = await getTravelRequest("TR-999");

      expect(queryMock).toHaveBeenCalledOnce();
      expect(result).toBeNull(); // Valida se a condicional result.rows.length === 0 funcionou
    });
  });
});