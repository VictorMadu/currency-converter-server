export const reqHeaderSchema = {
  type: "object",
  properties: {
    authorization: {
      type: "string",
      pattern: "^Bearer ",
    },
  },
  required: ["authorization"],
} as const;

export const bodySchema = {
  type: "object",
  properties: {
    base: { type: "string" },
    quota: { type: "string" },
    target_rate: { type: "number" },
  },
  required: ["base", "quota", "target_rate"],
  additionalProperties: false,
} as const;

export const res200Schema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
  },
  required: ["success"],
  additionalProperties: false,
} as const;
