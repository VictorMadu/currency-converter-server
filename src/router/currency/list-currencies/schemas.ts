export const res200Schema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    data: {
      type: "array",
      items: {
        type: "object",
        properties: {
          short: { type: "string" },
          name: { type: "string" },
        },
        required: ["short", "name"],
        additionalProperties: false,
      },
    },
  },
  required: ["success", "data"],
  additionalProperties: false,
} as const;
