import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/infra/travel-repository.js", () => ({
  saveTravelRequest: vi.fn(() => new Promise<void>(() => undefined)),
}));

import { processTravelUseCase } from "../../src/application/travel-use-case.js";
import { saveTravelRequest } from "../../src/infra/travel-repository.js";

describe("processTravelUseCase", () => {
  it("returns the domain output and calls saveTravelRequest without awaiting it", () => {
    const input = {
      requestId: "TR-010",
      requesterName: "Alice Johnson",
      requesterType: "employee" as const,
      destination: "Teresina",
      departureDate: "2026-07-01",
      returnDate: "2026-07-03",
      reason: "Official travel",
      transportCostInCents: 5000,
    };

    const result = processTravelUseCase(input);

    expect(result).toEqual({
      requestId: "TR-010",
      status: "approved",
      travelDays: 3,
      dailyAmountInCents: 18000,
      subtotalInCents: 54000,
      totalAmountInCents: 59000,
      errors: [],
      warnings: [],
    });
    expect(saveTravelRequest).toHaveBeenCalledOnce();
    expect(saveTravelRequest).toHaveBeenCalledWith(input, result);
  });
});