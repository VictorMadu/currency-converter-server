export const res200Schema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    data: {
      type: "object",
      properties: {
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
            required: ["short", "name", "prev_rate", "curr_rate"],
            additionalProperties: false,
          },
        },
      },
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
    currencies: {
      type: "array",
      items: { type: "string" },
    },
  },
  additionalProperties: false,
} as const;
