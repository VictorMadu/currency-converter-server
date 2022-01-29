import { Pipe, throwError } from "../../../_utils";
import * as _ from "lodash";
import * as jwt from "../../../_utils/jwt";

export const headerAuthTransformer = new Pipe<
  [string, (errMsg?: string) => Symbol]
>().next((auth: string, ctx): Symbol | { id: string } => {
  if (_.isUndefined(ctx)) return throwError("ctx is undefined");

  const token = auth.split(" ")[1];
  const [jwtSecretKey, onForbiddenError] = ctx;
  const userParsed = jwt.parseUser(token, jwtSecretKey);
  if (!userParsed)
    return onForbiddenError("Token is invalid. Might have expired");
  return userParsed;
});
