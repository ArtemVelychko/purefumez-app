import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const get = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const accords = await ctx.db
      .query("accords")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return accords;
  },
});

export const archiveAccord = mutation({
  args: { id: v.id("accords") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingAccord = await ctx.db.get(args.id);

    if (!existingAccord) {
      throw new Error("Accord not found");
    }

    if (existingAccord.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const accord = await ctx.db.patch(args.id, {
      isArchived: true,
    });

    return accord;
  },
});

export const getAccordsSidebar = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const accords = await ctx.db
      .query("accords")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return accords;
  },
});

export const createAccord = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const accord = await ctx.db.insert("accords", {
      title: args.title,
      userId,
      isArchived: false,
      isPublished: false,
      isBase: false,
      solvent: { name: "Solvent", weight: 0 },
    });

    return accord;
  },
});

export const getTrashAccords = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const accords = await ctx.db
      .query("accords")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .order("desc")
      .collect();

    return accords;
  },
});

export const restoreAccord = mutation({
  args: { id: v.id("accords") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingAccord = await ctx.db.get(args.id);

    if (!existingAccord) {
      throw new Error("Accord not found");
    }

    if (existingAccord.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const accord = await ctx.db.patch(args.id, {
      isArchived: false,
    });

    return accord;
  },
});

export const removeAccord = mutation({
  args: { id: v.id("accords") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingAccord = await ctx.db.get(args.id);

    if (!existingAccord) {
      throw new Error("Accord not found");
    }

    if (existingAccord.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const accord = await ctx.db.delete(args.id);

    return accord;
  },
});

export const bulkRemoveAccords = mutation({
  args: { ids: v.array(v.id("accords")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    for (const id of args.ids) {
      const existingAccord = await ctx.db.get(id);

      if (!existingAccord) {
        throw new Error(`Accord with id ${id} not found`);
      }

      if (existingAccord.userId !== userId) {
        throw new Error(`Unauthorized to delete accord with id ${id}`);
      }

      await ctx.db.delete(id);
    }
  },
});

export const getSearchAccords = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const accords = await ctx.db
      .query("accords")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return accords;
  },
});

export const getAccordById = query({
  args: { accordId: v.id("accords") },
  handler: async (ctx, args) => {
    const accord = await ctx.db.get(args.accordId);

    if (!accord) {
      throw new Error("Accord not found");
    }

    const materialDetails = await Promise.all(
      (accord.materialsInFormula || []).map(async (material) => {
        return ctx.db.get(material.material);
      })
    );

    return { ...accord, materialDetails };
  },
});

export const updateAccord = mutation({
  args: {
    id: v.id("accords"),
    title: v.optional(v.string()),
    note: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
    isBase: v.optional(v.boolean()),
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
    solvent: v.optional(v.object({ name: v.string(), weight: v.number() })),
    concentration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      // throw new Error("Not authenticated");
      return;
    }

    const userId = identity.subject;

    const { id, ...rest } = args;

    const existingAccord = await ctx.db.get(args.id);

    if (!existingAccord) {
      throw new Error("Not found");
    }

    if (existingAccord.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const accord = await ctx.db.patch(args.id, { ...rest });

    return accord;
  },
});

export const duplicateAccord = mutation({
  args: { id: v.id("accords") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const existingAccord = await ctx.db.get(args.id);

    if (!existingAccord) {
      throw new Error("Accord not found");
    }

    if (existingAccord.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Create a new object without _id and createdAt
    const { _id, _creationTime, ...accordDataToCopy } = existingAccord;

    const newAccord = {
      ...accordDataToCopy,
      title: `${existingAccord.title} (copy)`,
      isArchived: false,
      isPublished: false,
      userId, // Ensure the new accord is associated with the current user
    };

    const duplicatedAccord = await ctx.db.insert("accords", newAccord);

    return duplicatedAccord;
  },
});

export const saveAccordToLibrary = mutation({
  args: {
    accordId: v.id("accords"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    // Fetch the accord
    const accord = await ctx.db.get(args.accordId);
    if (!accord) {
      throw new Error("Accord not found");
    }

    // Create a mapping of old material IDs to new material IDs
    const materialIdMap = new Map();

    // Save all materials from the accord to the user's library if they don't already exist
    for (const material of accord.materialsInFormula || []) {
      const existingMaterial = await ctx.db.get(material.material);
      if (existingMaterial) {
        // Check if the user already has this material
        const userMaterial = await ctx.db
          .query("materials")
          .withIndex("by_user_and_title", (q) =>
            q.eq("userId", userId).eq("title", existingMaterial.title)
          )
          .first();

        if (userMaterial) {
          // If the user already has this material, use its ID
          materialIdMap.set(material.material, userMaterial._id);
        } else {
          // If the user doesn't have this material, create a new one
          const newMaterial = await ctx.db.insert("materials", {
            title: existingMaterial.title,
            category: existingMaterial.category,
            cas: existingMaterial.cas,
            altName: existingMaterial.altName,
            ifralimit: existingMaterial.ifralimit,
            dilutions: existingMaterial.dilutions,
            fragrancePyramid: existingMaterial.fragrancePyramid,
            dateObtained: existingMaterial.dateObtained,
            description: existingMaterial.description,
            price: existingMaterial.price,
            userId,
            isArchived: false,
            inventory: false,
          });
          materialIdMap.set(material.material, newMaterial);
        }
      }
    }

    // Create a new accord in the user's library with updated material references
    const newAccord = await ctx.db.insert("accords", {
      title: accord.title + " (copy)",
      userId,
      isArchived: false,
      isPublished: false,
      isBase: accord.isBase,
      solvent: accord.solvent,
      materialsInFormula: (accord.materialsInFormula || []).map((material) => ({
        ...material,
        material: materialIdMap.get(material.material) || material.material,
      })),
      note: accord.note,
      concentration: accord.concentration,
    });

    return newAccord;
  },
});