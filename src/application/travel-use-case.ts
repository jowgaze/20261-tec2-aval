import { analyzeTravelRequest, type TravelRequestInput, type TravelRequestOutput } from "../domain/travel-request.js";
import { saveTravelRequest } from "../infra/travel-repository.js";

export function processTravelUseCase(input: TravelRequestInput): TravelRequestOutput {
  const output = analyzeTravelRequest(input);

  void saveTravelRequest(input, output).catch(() => undefined);

  return output;
}