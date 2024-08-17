import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  materials: defineTable({
    title: v.string(),
    userId: v.string(),
    profiles: v.array(v.id("profiles")),
    inventory: v.boolean(),
    isArchived: v.boolean(),
    cas: v.optional(v.string()),
    altName: v.optional(v.string()),
    price: v.optional(v.number()),
    fragrancePyramid: v.optional(v.array(v.string())),
    ifralimit: v.optional(v.number()),
    dilutions: v.optional(v.array(v.number())),
    dateObtained: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_title", ["userId", "title"]),

  accords: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    isBase: v.boolean(),
    note: v.optional(v.string()),
    isPublished: v.boolean(),
    solvent: v.object({ name: v.string(), weight: v.number() }),
    materialsInFormula: v.optional(
      v.array(
        v.object({
          material: v.id("materials"),
          ifralimit: v.number(),
          weight: v.number(),
          dilution: v.number(),
        })
      )
    ),
    concentration: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_title", ["userId", "title"]),

  formulas: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    note: v.optional(v.string()),
    isPublished: v.boolean(),
    solvent: v.object({ name: v.string(), weight: v.number() }),
    accordsInFormula: v.optional(
      v.array(
        v.object({
          accord: v.id("accords"),
          weight: v.number(),
          dilution: v.number(),
        })
      )
    ),
    materialsInFormula: v.optional(
      v.array(
        v.object({
          material: v.id("materials"),
          weight: v.number(),
          ifralimit: v.number(),
          dilution: v.number(),
        })
      )
    ),
    concentration: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  }).index("by_user", ["userId"]),

  profiles: defineTable({
    userId: v.string(),
    title: v.string(),
    color: v.string(),
  }).index("by_user", ["userId"]),
});
