import { Pipe } from "../../../lib";
import v from "validator";
import * as _ from "lodash";

export const emailTransformer = new Pipe().next((email) =>
  v.normalizeEmail(email)
);

export const pwdTransformer = new Pipe<number>().next((pwd) => v.trim(pwd));
