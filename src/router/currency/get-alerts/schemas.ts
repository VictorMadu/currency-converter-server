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
          short: { type: "string" },
          name: { type: "string" },
          pending_alerts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                quota_short: { type: "string" },
                quota_name: { type: "string" },
                set_time: { type: "string" },
                set_rate: { type: "number" },
                target_rate: { type: "number" },
                prev_rate: { type: "number" },
                curr_rate: { type: "number" },
              },
              required: [
                "quota_short",
                "quota_name",
                "set_time",
                "set_rate",
                "target_rate",
                "prev_rate",
                "curr_rate",
              ],
              additionalProperties: false,
            },
          },

          triggered_alerts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                quota_short: { type: "string" },
                quota_name: { type: "string" },
                set_time: { type: "string" },
                set_rate: { type: "number" },
                target_rate: { type: "number" },
                triggered_rate: { type: "number" },
                triggered_time: { type: "string" },
                prev_rate: { type: "number" },
                curr_rate: { type: "number" },
              },
              required: [
                "quota_short",
                "quota_name",
                "set_time",
                "set_rate",
                "target_rate",
                "triggered_time",
                "triggered_rate",
                "prev_rate",
                "curr_rate",
              ],
              minContains: 0,
              additionalProperties: false,
            },
          },
        },
        required: ["short", "name"],
        additionalProperties: false,
      },
    },
  },
  required: ["success"],
  additionalProperties: false,
} as const;
