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

    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return profiles;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const profile = await ctx.db.insert("profiles", {
      title: args.title,
      userId,
      color: args.color,
    });

    return profile;
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
  args: { id: v.id("profiles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingProfile = await ctx.db.get(args.id);

    if (!existingProfile) {
      throw new Error("Profile not found");
    }

    if (existingProfile.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const profile = await ctx.db.delete(args.id);

    return profile;
  },
});

export const getById = query({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error("Profile not found");
    }
    return profile;
  },
});

export const update = mutation({
  args: {
    id: v.id("profiles"),
    title: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    const existingProfile = await ctx.db.get(id);

    if (!existingProfile) {
      throw new Error("Profile not found");
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (existingProfile.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const updatedProfile = await ctx.db.patch(id, rest);
    return updatedProfile;
  },
});