export type TravelRequestInput = {
  requestId: string;
  requesterName: string;
  requesterType: "student" | "employee" | "professor" | "manager";
  destination: string;
  departureDate: string;
  returnDate: string;
  reason: string;
  transportCostInCents: number;
};

export type TravelRequestOutput = {
  requestId: string;
  status: "approved" | "pending-review" | "rejected";
  travelDays: number;
  dailyAmountInCents: number;
  subtotalInCents: number;
  totalAmountInCents: number;
  errors: string[];
  warnings: string[];
};

function isValidYYYYMMDDDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function getUtcDayTimestamp(value: string): number {
  const [yearText, monthText, dayText] = value.split("-");

  return Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText));
}

function getDailyAmountInCents(requesterType: TravelRequestInput["requesterType"]): number {
  switch (requesterType) {
    case "student":
      return 9000;
    case "employee":
      return 18000;
    case "professor":
      return 25000;
    case "manager":
      return 30000;
  }
}

export function analyzeTravelRequest(input: TravelRequestInput): TravelRequestOutput {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!input.requestId) {
    errors.push("requestId is required");
  }

  if (!input.requesterName) {
    errors.push("requesterName is required");
  }

  if (!input.requesterType) {
    errors.push("requesterType is required");
  }

  if (!input.destination) {
    errors.push("destination is required");
  }

  if (!input.departureDate) {
    errors.push("departureDate is required");
  }

  if (!input.returnDate) {
    errors.push("returnDate is required");
  }

  let travelDays = 0;

  const hasValidDepartureDate = Boolean(input.departureDate) && isValidYYYYMMDDDate(input.departureDate);
  const hasValidReturnDate = Boolean(input.returnDate) && isValidYYYYMMDDDate(input.returnDate);

  if (input.departureDate && !hasValidDepartureDate) {
    errors.push("departureDate must be a valid YYYY-MM-DD date");
  }

  if (input.returnDate && !hasValidReturnDate) {
    errors.push("returnDate must be a valid YYYY-MM-DD date");
  }

  if (hasValidDepartureDate && hasValidReturnDate) {
    const departureTimestamp = getUtcDayTimestamp(input.departureDate);
    const returnTimestamp = getUtcDayTimestamp(input.returnDate);

    if (returnTimestamp < departureTimestamp) {
      errors.push("returnDate cannot be before departureDate");
    } else {
      travelDays = Math.floor((returnTimestamp - departureTimestamp) / 86_400_000) + 1;
    }
  }

  const dailyAmountInCents = getDailyAmountInCents(input.requesterType);
  const subtotalInCents = travelDays * dailyAmountInCents;
  const totalAmountInCents = subtotalInCents + input.transportCostInCents;

  if (travelDays > 5 && (input.reason?.length ?? 0) < 30) {
    warnings.push("long travel requests should include a detailed reason");
  }

  const status = errors.length > 0
    ? "rejected"
    : travelDays > 5 || totalAmountInCents > 200_000
      ? "pending-review"
      : "approved";

  return {
    requestId: input.requestId,
    status,
    travelDays,
    dailyAmountInCents,
    subtotalInCents,
    totalAmountInCents,
    errors,
    warnings,
  };
}