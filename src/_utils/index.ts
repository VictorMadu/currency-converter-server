import { Func } from "../dtypes";
import * as _ from "lodash";

// INSPIRTION: medium.com/@ian_grubb/function-piping-in-javascript-d25b0876a2b
export class Pipe<T extends any> {
  private nextCbs: ((value: any, ctx?: T) => any)[] = [];
  static END = Symbol("Terminated pipe");

  constructor(private ctx?: T) {}

  setContext(ctx: T) {
    this.ctx = ctx;
    return this;
  }

  next(cb: (value: any, ctx?: T) => any) {
    this.nextCbs.push(cb);
    return this;
  }

  async run(value: any) {
    let result: any = value;
    let i = 0;

    while (result !== Pipe.END && i < this.nextCbs.length) {
      result = await this.nextCbs[i](result, this.ctx);
      ++i;
    }

    return result;
  }
}

export const throwError = (msg: string) => {
  throw new Error(msg);
};

export class ItemsStack {
  private cond: boolean = true;
  private items: string[] = [];
  constructor() {}

  condition(condition: boolean | Func<[], boolean>) {
    this.cond = this.runCondition(condition);
    return this;
  }

  stack(...items: string[]) {
    if (this.cond) this.items.push(...items);
    return this;
  }

  getItems() {
    return this.items;
  }

  resetItems() {
    this.items = [];
    this.cond = true;
    return this;
  }

  private runCondition(condition: boolean | Func<[], boolean>) {
    if (typeof condition === "boolean") return condition;
    return condition();
  }
}

export function getMongoProjection(fields: string[], project: 1 | 0 = 1) {
  const projection: Record<string, 1 | 0> = {};
  _.map(fields, (field) => (projection[field] = project));
  return projection;
}
