const jwt = require("jsonwebtoken");
import * as _ from "lodash";

export interface IParsedUser {
  id: string;
  email: string;
}

export const signUser = (
  secretKey: string,
  expires: string,
  payload: IParsedUser
): string => {
  return jwt.sign(payload, secretKey, { expiresIn: expires });
};

export const parseUser = (
  token: string | undefined,
  secretKey: string
): IParsedUser | undefined => {
  if (_.isUndefined(token)) return undefined;
  try {
    const parsed = jwt.verify(token, secretKey) as IParsedUser & {
      iat: number;
      exp: number;
    };
    return parsed.exp * 1000 > new Date().getTime() ? parsed : undefined;
  } catch (error) {
    return undefined;
  }
};
