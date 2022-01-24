import { BooleanFilter } from "../../../../dtypes";

export interface IGetPrices {
  userId: string;
  bases?: string[];
  quotas?: string[];
  type?: "pending" | "triggered";
}

export interface IGetPriceOut {
  id: { base: string; quota: string };
  alerts: {
    id: string;
    set_rate: number;
    set_time: {
      day: number;
      month: number;
      year: number;
    };
    target_rate: number;
    triggered_rate?: number;
    triggered_time: {
      day: number | null;
      month: number | null;
      year: number | null;
    };
  }[];
}
