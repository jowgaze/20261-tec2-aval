import { processTravelUseCase } from "./application/travel-use-case.js";
import type {
  TravelRequestInput as DomainTravelRequestInput,
  TravelRequestOutput as DomainTravelRequestOutput,
} from "./domain/travel-request.js";

export type TravelRequestInput = DomainTravelRequestInput;

export type TravelRequestOutput = DomainTravelRequestOutput;

export type RequesterType = TravelRequestInput["requesterType"];

export type TravelRequestStatus = TravelRequestOutput["status"];

export function processTravelRequest(input: TravelRequestInput): TravelRequestOutput {
  return processTravelUseCase(input);
}
