import { ObjectId } from "mongodb";

export interface ITriggeredAlertDocument {
  triggered_time: Date;
  triggered_ratio: number;
  base: string;
  user: {
    id: ObjectId;
    email: string;
    phone: string;
    notification_medium: ("app" | "email" | "phone")[];
  };
  _id: ObjectId;
  set_time: Date;
  target_ratio: number;
  set_ratio: number;
  quota: string;
}
