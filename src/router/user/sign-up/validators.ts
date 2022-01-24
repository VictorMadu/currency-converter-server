import v from "validator";
import { Pipe, throwError } from "../../../_utils";
import DbService from "./db-service/_service";
import * as _ from "lodash";

export const emailValidator = new Pipe<[(email: string) => Symbol, DbService]>()

  .next((email: string, ctx) => {
    if (_.isUndefined(ctx)) return throwError("ctx is undefined");
    const [onError] = ctx;

    if (v.isEmail(email)) return email;
    return onError("field 'email' is not a valid email");
  })

  .next(async (email: string, ctx) => {
    if (_.isUndefined(ctx)) return throwError("ctx is undefined");
    const [onError, dbService] = ctx;

    if (!(await dbService.isEmailExist(email))) return email;

    return onError && onError("field 'email' is already taken");
  });

export const pwdValidator = new Pipe<(pwd: string) => Symbol>().next(
  (pwd: string, onError) => {
    if (v.isLength(pwd, { min: 5 })) return pwd;
    return onError && onError("field 'pwd' must be 5 or more characters");
  }
);
