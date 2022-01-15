import { BooleanFilter } from "../../../../dtypes";

export interface IGetPrices {
  userId: string;
  bases?: string[];
  quotas?: string[];
  type?: "pending" | "triggered";
}

type IPendingAlerts = Array<{
  quota_short: string;
  quota_name: string;
  set_time: string;
  set_rate: number;
  target_rate: number;
  prev_rate: number;
  curr_rate: number;
}>;

type ITriggeredAlerts = Array<{
  quota_short: string;
  quota_name: string;
  set_time: string;
  set_rate: number;
  triggered_rate: number;
  triggered_time: string;
  target_rate: number;
  prev_rate: number;
  curr_rate: number;
}>;

export type IGetPricesOut<
  IncludePending extends boolean,
  IncludeTriggered extends boolean
> = Array<{
  short: string;
  name: string;
  pending_alerts: BooleanFilter<IPendingAlerts, IncludePending>;
  triggered_alerts: BooleanFilter<ITriggeredAlerts, IncludeTriggered>;
}>;
