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

const DAILY_ALLOWANCES: Record<TravelRequestInput["requesterType"], number> = {
  student: 9000,
  employee: 18000,
  professor: 25000,
  manager: 30000,
};

const MS_PER_DAY = 86_400_000;
const REVIEW_THRESHOLD_IN_CENTS = 200_000;

function isValidYYYYMMDDDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

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

export function analyzeTravelRequest(input: TravelRequestInput): TravelRequestOutput {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!input.requestId) errors.push("requestId is required");
  if (!input.requesterName) errors.push("requesterName is required");
  if (!input.requesterType) errors.push("requesterType is required");
  if (!input.destination) errors.push("destination is required");
  if (!input.departureDate) errors.push("departureDate is required");
  if (!input.returnDate) errors.push("returnDate is required");

  const hasValidDepartureDate = Boolean(input.departureDate) && isValidYYYYMMDDDate(input.departureDate);
  const hasValidReturnDate = Boolean(input.returnDate) && isValidYYYYMMDDDate(input.returnDate);

  if (input.departureDate && !hasValidDepartureDate) {
    errors.push("departureDate must be a valid YYYY-MM-DD date");
  }
  if (input.returnDate && !hasValidReturnDate) {
    errors.push("returnDate must be a valid YYYY-MM-DD date");
  }

  let departureTimestamp = 0;
  let returnTimestamp = 0;

  if (hasValidDepartureDate && hasValidReturnDate) {
    departureTimestamp = getUtcDayTimestamp(input.departureDate);
    returnTimestamp = getUtcDayTimestamp(input.returnDate);

    if (returnTimestamp < departureTimestamp) {
      errors.push("returnDate cannot be before departureDate");
    }
  }

  if (errors.length > 0) {
    return {
      requestId: input.requestId || "",
      status: "rejected",
      travelDays: 0,
      dailyAmountInCents: 0,
      subtotalInCents: 0,
      totalAmountInCents: 0,
      errors,
      warnings,
    };
  }

  const travelDays = Math.floor((returnTimestamp - departureTimestamp) / MS_PER_DAY) + 1;
  const dailyAmountInCents = DAILY_ALLOWANCES[input.requesterType];
  const subtotalInCents = travelDays * dailyAmountInCents;
  const totalAmountInCents = subtotalInCents + input.transportCostInCents;

  if (travelDays > 5 && (input.reason?.length ?? 0) < 30) {
    warnings.push("long travel requests should include a detailed reason");
  }

  let status: TravelRequestOutput["status"] = "approved";
  if (travelDays > 5 || totalAmountInCents > REVIEW_THRESHOLD_IN_CENTS) {
    status = "pending-review";
  }

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