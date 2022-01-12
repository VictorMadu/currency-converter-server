import { Pipe } from "../../../lib";
import v from "validator";
import * as bcrypt from "bcrypt";
import * as _ from "lodash";

export const emailTransformer = new Pipe().next((email) =>
  v.normalizeEmail(email)
);

export const phoneTransformer = new Pipe().next((phone) => v.trim(phone));

export const pwdTransformer = new Pipe<number>()
  .next((pwd) => v.trim(pwd))
  .next(async (pwd, numOfHashes) => {
    return await bcrypt.hash(pwd, numOfHashes as number);
  });
