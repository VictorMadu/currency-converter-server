import v from "validator";
import { Pipe, throwError } from "../../../lib";
import DbService from "./db-service/_service";
import * as _ from "lodash";
import * as bcrypt from "bcrypt";

export const emailValidator = new Pipe<(errMsg: string) => Symbol>().next(
  (email: string, onError) => {
    if (_.isUndefined(onError)) return throwError("ctx is undefined");

    if (v.isEmail(email)) return email;
    return onError("field 'email' is not a valid email");
  }
);

export const pwdValidator = new Pipe<
  [(errMsg: string) => Symbol, DbService, string]
>()
  .next((pwd: string, ctx) => {
    if (_.isUndefined(ctx)) return throwError("ctx is undefined");
    const [onError] = ctx;

    if (v.isLength(pwd, { min: 5 })) return pwd;
    return onError("field 'pwd' must be 5 or more characters");
  })
  .next(async (pwd: string, ctx) => {
    if (_.isUndefined(ctx)) return throwError("ctx is undefined");
    const [onError, dbService, transformedEmail] = ctx;

    // TODO: Add cache config to db service for this
    const user = await dbService.getUser(transformedEmail, {
      includePassword: true,
    });
    if (!user) return onError("field 'email' does not exist");
    if (!(await bcrypt.compare(pwd, user.pwd as string)))
      return onError("field 'pwd' does not match email");
    return pwd;
  });
