export const bodySchema = {
  type: "object",
  properties: {
    email: { type: "string" },
    pwd: { type: "string" },
  },
  required: ["email", "pwd"],
  additionalProperties: false,
} as const;

export const res201Schema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    data: {
      type: "object",
      properties: {
        id: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        token: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  required: ["success"],
  additionalProperties: false,
} as const;
