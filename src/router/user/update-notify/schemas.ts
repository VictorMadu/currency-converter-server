export const bodySchema = {
  type: "object",
  properties: {
    action: { enum: ["add", "remove"] },
    notifyOptions: {
      type: "array",
      items: { enum: ["app", "phone", "email"] },
      minItems: 1,
      // maxItems: 3,
      uniqueItems: true,
    },
  },
  required: ["action", "notifyOptions"],
  additionalProperties: false,
} as const;

export const res201Schema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
  },
  required: ["success"],
  additionalProperties: false,
};

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
