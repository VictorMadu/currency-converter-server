export const res200Schema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    data: {
      type: "object",
      properties: {
        base: { type: "string" },
        currencies: {
          type: "array",
          items: {
            type: "object",
            properties: {
              short: { type: "string" },
              name: { type: "string" },
              prev_rate: { type: "number" },
              curr_rate: { type: "number" },
            },
            additionalProperties: false,
            required: ["short", "name", "prev_rate", "curr_rate"],
          },
        },
      },
      required: ["base", "currencies"],
      additionalProperties: false,
    },
  },
  required: ["success", "data"],
  additionalProperties: false,
} as const;

export const querySchema = {
  type: "object",
  properties: {
    base: { type: "string" },
    quota: {
      type: "array",
      items: { type: "string" },
    },
  },
  additionalProperties: false,
} as const;
