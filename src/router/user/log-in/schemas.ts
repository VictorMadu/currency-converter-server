export const querySchema = {
  type: "object",
  properties: {
    theme: { enum: ["0", "1"] },
    notify_opts: { enum: ["0", "1"] },
  },
  // TODO: add conditional/dependent schema for properties of res201Schema as it depends on the properties of querySchema
  additionalProperties: false,
} as const;

export const bodySchema = {
  type: "object",
  properties: {
    email: { type: "string" },
    pwd: { type: "string" },
  },
  required: ["email", "pwd"],
  additionalProperties: false,
} as const;

export const res200Schema = {
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
        app_theme: { enum: ["light", "dark"] },
        notify_opts: {
          type: "array",
          items: { enum: ["app", "phone", "email"] },
          minItems: 1,
          uniqueItems: true,
        },
      },
      required: ["id", "email", "phone", "token"],
      additionalProperties: false,
      // TODO: add conditional/dependent schema for properties of res201Schema as it depends on the properties of querySchema
    },
  },
  required: ["success"],
  additionalProperties: false,
} as const;
