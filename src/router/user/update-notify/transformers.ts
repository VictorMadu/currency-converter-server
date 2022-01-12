import { Pipe, throwError } from "../../../lib";
import * as _ from "lodash";
const jwt = require("jsonwebtoken");

export const headerAuthTransformer = new Pipe<
  [string, (errMsg?: string) => Symbol]
>().next((auth: string, ctx) => {
  if (_.isUndefined(ctx)) return throwError("ctx is undefined");

  const token = auth.split(" ")[1];
  const [jwtSecretKey, onForbiddenError] = ctx;

  try {
    return (jwt.verify(token, jwtSecretKey) as any).id;
  } catch (error) {
    return onForbiddenError("Token has expired");
  }
});
