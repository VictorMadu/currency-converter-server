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
    bases: { type: "array", items: { type: "string" } },
    quotas: { type: "array", items: { type: "string" } },
    type: {
      type: "string",
      enum: ["pending", "triggered"],
    },
  },
  additionalProperties: false,
} as const;

export const res200Schema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    data: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "object",
            properties: {
              base: { type: "string" },
              quota: { type: "string" },
            },
            required: ["base", "quota"],
            additionalProperties: false,
          },
          alerts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                set_rate: { type: "number" },
                set_time: {
                  type: "object",
                  properties: {
                    day: { type: "number" },
                    month: { type: "number" },
                    year: { type: "number" },
                  },
                  required: ["day", "month", "year"],
                  additionalProperties: false,
                },
                target_rate: { type: "number" },
                triggered_rate: { type: "number" },
                triggered_time: {
                  type: "object",
                  properties: {
                    day: { type: ["number", "null"] },
                    month: { type: ["number", "null"] },
                    year: { type: ["number", "null"] },
                  },
                  required: ["day", "month", "year"],
                  additionalProperties: false,
                },
              },
              required: [
                "id",
                "set_rate",
                "set_time",
                "target_rate",
                "triggered_time",
              ],
              additionalProperties: false,
            },
          },
        },
        required: ["id", "alerts"],
        additionalProperties: false,
      },
    },
  },
  required: ["success", "data"],
  additionalProperties: false,
} as const;
