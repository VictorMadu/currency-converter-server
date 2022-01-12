import * as _ from "lodash";
import { Pipe, throwError } from "../../../lib";

export const paramIdValidator = new Pipe<[string, () => Symbol]>().next(
  (userId, ctx) => {
    if (_.isUndefined(ctx)) return throwError("ctx is undefined");
    const [id, onForbiddenError] = ctx;

    if (userId === id) return userId;
    return onForbiddenError();
  }
);
