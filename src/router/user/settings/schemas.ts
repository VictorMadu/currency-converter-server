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
    notify_opts: {
      type: "array",
      items: { enum: ["app", "phone", "email"] },
      minItems: 1,
      uniqueItems: true,
    },
    notify_action: {
      enum: ["add", "remove"],
    },
    theme: {
      enum: ["light", "dark"],
    },
  },
  dependentRequired: {
    notify_opts: ["notify_action"],
  },
  additionalProperties: false,
} as const;

export const res200Schema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    data: {
      type: "object",
      properties: {
        modifiedCount: { type: "number" },
        user: {
          type: "object",
          properties: {
            app_theme: { enum: ["light", "dark"] },
            notify_opts: {
              type: "array",
              items: { enum: ["app", "phone", "email"] },
              minItems: 1,
              uniqueItems: true,
            },
          },
          additionalProperties: false,
          // TODO: add conditional/dependent schema for properties of res201Schema as it depends on the properties of querySchema
        },
      },
      required: ["modifiedCount"],
      additionalProperties: false,
    },
  },
  required: ["success", "data"],
  additionalProperties: false,
} as const;
