import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      // throw new Error("Not authenticated");
      return;
    }

    const userId = identity.subject;

    const rawMaterials = await ctx.db
      .query("materials")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return rawMaterials;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const rawMaterial = await ctx.db.insert("materials", {
      title: args.title,
      userId,
      isArchived: false,
      dilutions: [100],
      category: {
        name: "Uncategorized",
        color: "#808080",
        isCustom: false,
      },
      inventory: true,
    });

    return rawMaterial;
  },
});

export const createMaterial = mutation({
  args: {
    title: v.string(),
    category: v.object({
      name: v.string(),
      color: v.string(),
      isCustom: v.boolean(),
    }),
    description: v.optional(v.string()),
    altName: v.optional(v.string()),
    cas: v.optional(v.string()),
    fragrancePyramid: v.optional(v.array(v.string())),
    ifralimit: v.optional(v.number()),
    dilutions: v.optional(v.array(v.number())),
    dateObtained: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const newMaterial = {
      title: args.title,
      category: args.category,
      description: args.description || "",
      altName: args.altName || "",
      cas: args.cas || "",
      fragrancePyramid: args.fragrancePyramid || [],
      ifralimit: args.ifralimit || 0,
      dilutions: args.dilutions || [100],
      dateObtained: args.dateObtained || "",
      userId,
      isArchived: false,
      inventory: true,
    };
    const rawMaterial = await ctx.db.insert("materials", newMaterial);

    return rawMaterial;
  },
});

export const getById = query({
  args: { materialId: v.id("materials") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    const rawMaterial = await ctx.db.get(args.materialId);

    if (!rawMaterial) {
      throw new Error("Material not found");
    }

    if (!rawMaterial.isArchived) {
      return rawMaterial;
    }

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    if (rawMaterial.userId !== userId) {
      throw new Error("Unauthorized");
    }

    return rawMaterial;
  },
});

export const getSidebar = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      // throw new Error("Not authenticated");
      return;
    }

    const userId = identity.subject;

    const materials = await ctx.db
      .query("materials")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return materials;
  },
});

export const remove = mutation({
  args: { id: v.id("materials") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingMaterial = await ctx.db.get(args.id);

    if (!existingMaterial) {
      throw new Error("Material not found");
    }

    if (existingMaterial.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const material = await ctx.db.delete(args.id);

    return material;
  },
});

export const bulkRemove = mutation({
  args: { ids: v.array(v.id("materials")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    for (const id of args.ids) {
      const existingMaterial = await ctx.db.get(id);

      if (!existingMaterial) {
        throw new Error(`Material with id ${id} not found`);
      }

      if (existingMaterial.userId !== userId) {
        throw new Error(`Unauthorized to delete material with id ${id}`);
      }

      await ctx.db.delete(id);
    }
  },
});


export const update = mutation({
  args: {
    id: v.id("materials"),
    title: v.optional(v.string()),
    cas: v.optional(v.string()),
    category: v.optional(
      v.object({
        name: v.string(),
        color: v.string(),
        isCustom: v.boolean(),
      }),
    ),
    ifralimit: v.optional(v.number()),
    altName: v.optional(v.string()),
    fragrancePyramid: v.optional(v.array(v.string())),
    dilutions: v.optional(v.array(v.number())),
    dateObtained: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
    price: v.optional(v.number()),
    inventory: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const { id, ...rest } = args;

    const existingMaterial = await ctx.db.get(args.id);

    if (!existingMaterial) {
      throw new Error("Not found");
    }

    if (existingMaterial.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const material = await ctx.db.patch(args.id, { ...rest });

    return material;
  },
});

export const removeCoverImage = mutation({
  args: { id: v.id("materials") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingMaterial = await ctx.db.get(args.id);

    if (!existingMaterial) {
      throw new Error("Not found");
    }

    if (existingMaterial.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const material = await ctx.db.patch(args.id, {
      coverImage: undefined,
    });

    return material;
  },
});

export const removeField = mutation({
  args: {
    id: v.id("materials"),
    field: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const existingMaterial = await ctx.db.get(args.id);
    if (!existingMaterial) {
      throw new Error("Not found");
    }
    if (existingMaterial.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const allowedFields = ["cas", "altName"]; // Add more fields as needed
    if (!allowedFields.includes(args.field)) {
      throw new Error("Invalid field");
    }

    const updateData = {
      [args.field]: undefined,
    };

    const material = await ctx.db.patch(args.id, updateData);
    return material;
  },
});

export const getSearch = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const Materials = await ctx.db
      .query("materials")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return Materials;
  },
});

export const saveMaterial = mutation({
  args: {
    title: v.string(),
    category: v.object({
      name: v.string(),
      color: v.string(),
      isCustom: v.boolean(),
    }),
    cas: v.optional(v.string()),
    altName: v.optional(v.string()),
    ifralimit: v.optional(v.number()),
    dilutions: v.optional(v.array(v.number())),
    fragrancePyramid: v.optional(v.array(v.string())),
    dateObtained: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    inventory: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const newMaterial = await ctx.db.insert("materials", {
      ...args,
      userId,
      isArchived: false,
      inventory: false,
    });

    return newMaterial;
  },
});

export const getSharedMaterials = query({
  handler: async (ctx) => {
    const materials = await ctx.db
      .query("materials")
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return materials;
  },
});

export const getMaterialsForAccord = query({
  args: { accordId: v.id("accords") },
  handler: async (ctx, args) => {
    const accord = await ctx.db.get(args.accordId);
    if (!accord) {
      throw new Error("Accord not found");
    }

    const materialIds = accord.materialsInFormula?.map(m => m.material) || [];

    const materials = await ctx.db
      .query("materials")
      .filter(q => q.and(
        q.eq(q.field("userId"), accord.userId),
        q.or(...materialIds.map(id => q.eq(q.field("_id"), id)))
      ))
      .collect();

    return materials;
  }
});
