import { describe, expect, it } from "vitest";
import { analyzeTravelRequest } from "../../src/domain/travel-request.js";

describe("analyzeTravelRequest", () => {
  it.each([
    ["student", 9000],
    ["employee", 18000],
    ["professor", 25000],
    ["manager", 30000],
  ] as const)(
    "returns the exact daily amount for requesterType %s",
    (requesterType, dailyAmountInCents) => {
      const result = analyzeTravelRequest({
        requestId: "TR-001",
        requesterName: "Alice Johnson",
        requesterType,
        destination: "Teresina",
        departureDate: "2026-07-01",
        returnDate: "2026-07-01",
        reason: "Same-day trip",
        transportCostInCents: 0,
      });

      expect(result.dailyAmountInCents).toBe(dailyAmountInCents);
    },
  );

  it("treats identical departure and return dates as a one-day trip", () => {
    const result = analyzeTravelRequest({
      requestId: "TR-002",
      requesterName: "Bob Smith",
      requesterType: "student",
      destination: "Teresina",
      departureDate: "2026-07-10",
      returnDate: "2026-07-10",
      reason: "Campus visit",
      transportCostInCents: 5000,
    });

    expect(result.travelDays).toBe(1);
    expect(result.status).toBe("approved");
  });

  it("returns pending-review when the total amount is above 200000 cents", () => {
    const result = analyzeTravelRequest({
      requestId: "TR-003",
      requesterName: "Carol White",
      requesterType: "manager",
      destination: "Fortaleza",
      departureDate: "2026-07-01",
      returnDate: "2026-07-01",
      reason: "Executive meeting",
      transportCostInCents: 170001,
    });

    expect(result.totalAmountInCents).toBe(200001);
    expect(result.status).toBe("pending-review");
    expect(result.warnings).toEqual([]);
  });

  it("adds a warning for long trips with a short reason", () => {
    const result = analyzeTravelRequest({
      requestId: "TR-004",
      requesterName: "Diana Green",
      requesterType: "professor",
      destination: "Recife",
      departureDate: "2026-07-01",
      returnDate: "2026-07-06",
      reason: "Conference",
      transportCostInCents: 0,
    });

    expect(result.status).toBe("pending-review");
    expect(result.travelDays).toBe(6);
    expect(result.warnings).toEqual(["long travel requests should include a detailed reason"]);
  });

  it("does not add a warning for long trips with a detailed reason", () => {
    const result = analyzeTravelRequest({
      requestId: "TR-005",
      requesterName: "Evan Brown",
      requesterType: "employee",
      destination: "Natal",
      departureDate: "2026-07-01",
      returnDate: "2026-07-06",
      reason: "Detailed business travel justification for the full week.",
      transportCostInCents: 0,
    });

    expect(result.status).toBe("pending-review");
    expect(result.travelDays).toBe(6);
    expect(result.warnings).toEqual([]);
  });
});