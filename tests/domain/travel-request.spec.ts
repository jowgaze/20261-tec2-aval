import { describe, expect, it } from "vitest";
import { analyzeTravelRequest } from "../../src/domain/travel-request.js";

describe("analyzeTravelRequest", () => {
  it("returns an approved analysis for a valid short trip", () => {
    const result = analyzeTravelRequest({
      requestId: "TR-001",
      requesterName: "Alice Johnson",
      requesterType: "student",
      destination: "Teresina",
      departureDate: "2026-07-01",
      returnDate: "2026-07-03",
      reason: "Academic visit",
      transportCostInCents: 5000,
    });

    expect(result).toEqual({
      requestId: "TR-001",
      status: "approved",
      travelDays: 3,
      dailyAmountInCents: 9000,
      subtotalInCents: 27000,
      totalAmountInCents: 32000,
      errors: [],
      warnings: [],
    });
  });

  it("returns pending-review with a warning for long trips with a short reason", () => {
    const result = analyzeTravelRequest({
      requestId: "TR-002",
      requesterName: "Bob Smith",
      requesterType: "professor",
      destination: "Fortaleza",
      departureDate: "2026-07-01",
      returnDate: "2026-07-06",
      reason: "Conference",
      transportCostInCents: 0,
    });

    expect(result).toEqual({
      requestId: "TR-002",
      status: "pending-review",
      travelDays: 6,
      dailyAmountInCents: 25000,
      subtotalInCents: 150000,
      totalAmountInCents: 150000,
      errors: [],
      warnings: ["long travel requests should include a detailed reason"],
    });
  });

  it("returns rejected when required fields are missing", () => {
    const result = analyzeTravelRequest({
      requestId: "",
      requesterName: "",
      requesterType: "" as never,
      destination: "",
      departureDate: "",
      returnDate: "",
      reason: "",
      transportCostInCents: 0,
    });

    expect(result.status).toBe("rejected");
    expect(result.errors).toEqual([
      "requestId is required",
      "requesterName is required",
      "requesterType is required",
      "destination is required",
      "departureDate is required",
      "returnDate is required",
    ]);
    expect(result.warnings).toEqual([]);
  });
});