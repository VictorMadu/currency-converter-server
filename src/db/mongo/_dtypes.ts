import { PromiseReturnType } from "../../dtypes";
import decorator from "./_decorator";

export interface IMongoConfig {
  address: string;
  port: number;
  name: string;
  poolsize?: number;
  version: string;
}

export type IMongo = PromiseReturnType<typeof decorator>;
export type IOpts = { key: string };
