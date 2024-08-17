import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const formulas = await ctx.db
      .query("formulas")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return formulas;
  },
});

export const archiveFormula = mutation({
  args: { id: v.id("formulas") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const existingFormula = await ctx.db.get(args.id);
    if (!existingFormula) {
      throw new Error("Formula not found");
    }
    if (existingFormula.userId !== userId) {
      throw new Error("Unauthorized");
    }
    const formula = await ctx.db.patch(args.id, {
      isArchived: true,
    });
    return formula;
  },
});

export const getFormulasSidebar = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const formulas = await ctx.db
      .query("formulas")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();
    return formulas;
  },
});

export const createFormula = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const formula = await ctx.db.insert("formulas", {
      title: args.title,
      userId,
      isArchived: false,
      isPublished: false,
      solvent: { name: "Solvent", weight: 0 },
    });
    return formula;
  },
});

export const getTrashFormulas = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const formulas = await ctx.db
      .query("formulas")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .order("desc")
      .collect();
    return formulas;
  },
});

export const restoreFormula = mutation({
  args: { id: v.id("formulas") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const existingFormula = await ctx.db.get(args.id);
    if (!existingFormula) {
      throw new Error("Formula not found");
    }
    if (existingFormula.userId !== userId) {
      throw new Error("Unauthorized");
    }
    const formula = await ctx.db.patch(args.id, {
      isArchived: false,
    });
    return formula;
  },
});

export const removeFormula = mutation({
  args: { id: v.id("formulas") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const existingFormula = await ctx.db.get(args.id);
    if (!existingFormula) {
      throw new Error("Formula not found");
    }
    if (existingFormula.userId !== userId) {
      throw new Error("Unauthorized");
    }
    const formula = await ctx.db.delete(args.id);
    return formula;
  },
});

export const bulkRemoveFormulas = mutation({
  args: { ids: v.array(v.id("formulas")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    for (const id of args.ids) {
      const existingFormula = await ctx.db.get(id);
      if (!existingFormula) {
        throw new Error(`Formula with id ${id} not found`);
      }
      if (existingFormula.userId !== userId) {
        throw new Error(`Unauthorized to delete formula with id ${id}`);
      }
      await ctx.db.delete(id);
    }
  },
});

export const getSearchFormulas = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const formulas = await ctx.db
      .query("formulas")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();
    return formulas;
  },
});

export const getFormulaById = query({
  args: { formulaId: v.id("formulas") },
  handler: async (ctx, args) => {
    const formula = await ctx.db.get(args.formulaId);
    if (!formula) {
      throw new Error("Formula not found");
    }
    const materialDetails = await Promise.all(
      (formula.materialsInFormula || []).map(async (material) => {
        return ctx.db.get(material.material);
      })
    );
    const accordDetails = await Promise.all(
      (formula.accordsInFormula || []).map(async (accord) => {
        return ctx.db.get(accord.accord);
      })
    );
    return { ...formula, materialDetails, accordDetails };
  },
});

export const updateFormula = mutation({
  args: {
    id: v.id("formulas"),
    title: v.optional(v.string()),
    note: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
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
    accordsInFormula: v.optional(
      v.array(
        v.object({
          accord: v.id("accords"),
          weight: v.number(),
          dilution: v.number(),
        })
      )
    ),
    solvent: v.optional(v.object({ name: v.string(), weight: v.number() })),
    concentration: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return;
    }
    const userId = identity.subject;
    const { id, ...rest } = args;
    const existingFormula = await ctx.db.get(args.id);
    if (!existingFormula) {
      throw new Error("Not found");
    }
    if (existingFormula.userId !== userId) {
      throw new Error("Unauthorized");
    }
    const formula = await ctx.db.patch(args.id, { ...rest });
    return formula;
  },
});

export const duplicateFormula = mutation({
  args: { id: v.id("formulas") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const existingFormula = await ctx.db.get(args.id);
    if (!existingFormula) {
      throw new Error("Formula not found");
    }
    if (existingFormula.userId !== userId) {
      throw new Error("Unauthorized");
    }
    const { _id, _creationTime, ...formulaDataToCopy } = existingFormula;
    const newFormula = {
      ...formulaDataToCopy,
      title: `${existingFormula.title} (copy)`,
      isArchived: false,
      isPublished: false,
      userId,
    };
    const duplicatedFormula = await ctx.db.insert("formulas", newFormula);
    return duplicatedFormula;
  },
});

export const saveFormulaToLibrary = mutation({
  args: {
    formulaId: v.id("formulas"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    // Fetch the formula
    const formula = await ctx.db.get(args.formulaId);
    if (!formula) {
      throw new Error("Formula not found");
    }

    // Create a mapping of old material IDs to new material IDs
    const materialIdMap = new Map();
    const accordIdMap = new Map();

    // Save all materials from the formula to the user's library if they don't already exist
    for (const material of formula.materialsInFormula || []) {
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
            profiles: existingMaterial.profiles,
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

    // Create simple accords for the user's library
    for (const accord of formula.accordsInFormula || []) {
      const existingAccord = await ctx.db.get(accord.accord);
      if (existingAccord) {
        const newAccord = await ctx.db.insert("accords", {
          title: existingAccord.title + " (Placeholder)",
          userId,
          isArchived: false,
          isPublished: false,
          isBase: false,
          solvent: { name: "Solvent", weight: 0 },
          materialsInFormula: [],
          note: "This is a placeholder accord created when copying a formula.",
          concentration: 100,
        });
        accordIdMap.set(accord.accord, newAccord);
      }
    }

    // Create a new formula in the user's library with updated material and accord references
    const newFormula = await ctx.db.insert("formulas", {
      title: formula.title + " (copy)",
      userId,
      isArchived: false,
      isPublished: false,
      solvent: formula.solvent,
      materialsInFormula: (formula.materialsInFormula || []).map((material) => ({
        ...material,
        material: materialIdMap.get(material.material) || material.material,
      })),
      accordsInFormula: (formula.accordsInFormula || []).map((accord) => ({
        ...accord,
        accord: accordIdMap.get(accord.accord) || accord.accord,
      })),
      note: formula.note,
      concentration: formula.concentration,
    });

    return newFormula;
  },
});

export const getSharedFormulas = query({
  handler: async (ctx) => {
    const formulas = await ctx.db
      .query("formulas")
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();
    return formulas;
  },
});
