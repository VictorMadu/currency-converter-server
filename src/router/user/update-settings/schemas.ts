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

export const res201Schema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    data: {
      type: "object",
      properties: {
        modifiedCount: { type: "number" },
      },
      required: ["modifiedCount"],
      additionalProperties: false,
    },
  },
  required: ["success", "data"],
  additionalProperties: false,
} as const;
