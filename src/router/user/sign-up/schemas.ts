export const bodySchema = {
  type: "object",
  properties: {
    email: { type: "string" },
    phone: { type: "string" },
    pwd: { type: "string" },
  },
  required: ["email", "phone", "pwd"],
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
        createdTime: { type: "number" },
      },
      required: ["id", "createdTime"],
      additionalProperties: false,
    },
  },
  required: ["success"],
  additionalProperties: false,
} as const;
