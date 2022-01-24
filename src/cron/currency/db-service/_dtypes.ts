import { ObjectId } from "mongodb";

export interface ITriggeredAlertDocument {
  triggered_time: Date;
  triggered_ratio: number;
  base: string;
  user_id: ObjectId;
  _id: ObjectId;
  set_time: Date;
  target_ratio: number;
  set_rate: number;
  quota: string;
}
