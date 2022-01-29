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

export const res200Schema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
  },
  required: ["success"],
  additionalProperties: false,
} as const;
