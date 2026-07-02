import { Pool } from "pg";
import 'dotenv/config';
import type { TravelRequestInput, TravelRequestOutput } from "../domain/travel-request.js";

let pool: Pool | undefined;

function getPool(): Pool {
  if (pool) {
    return pool;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  pool = new Pool({ connectionString: databaseUrl });

  return pool;
}

export async function saveTravelRequest(
  input: TravelRequestInput,
  output: TravelRequestOutput,
): Promise<void> {
  await getPool().query(
    `
      INSERT INTO travel_requests (
        id,
        requester_name,
        requester_type,
        destination,
        departure_date,
        return_date,
        reason,
        status,
        travel_days,
        daily_amount_in_cents,
        subtotal_in_cents,
        transport_cost_in_cents,
        total_amount_in_cents,
        created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      )
    `,
    [
      input.requestId,
      input.requesterName,
      input.requesterType,
      input.destination,
      input.departureDate,
      input.returnDate,
      input.reason,
      output.status,
      output.travelDays,
      output.dailyAmountInCents,
      output.subtotalInCents,
      input.transportCostInCents,
      output.totalAmountInCents,
      new Date().toISOString(),
    ],
  );
}

export async function getTravelRequest(requestId: string): Promise<Record<string, unknown> | null> {
  const result = await getPool().query(
    `SELECT * FROM travel_requests WHERE id = $1`,
    [requestId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}