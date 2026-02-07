import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Log a new activity
export const log = mutation({
  args: {
    category: v.string(),
    action: v.string(),
    description: v.string(),
    metadata: v.optional(v.any()),
    tokens: v.optional(v.number()),
    duration_ms: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("activities", {
      timestamp: Date.now(),
      ...args,
    });
    return id;
  },
});

// Get recent activities (with live updates)
export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activities")
      .order("desc")
      .take(args.limit ?? 50);
  },
});

// Get activities by category
export const getByCategory = query({
  args: { 
    category: v.string(),
    limit: v.optional(v.number()) 
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activities")
      .filter((q) => q.eq(q.field("category"), args.category))
      .order("desc")
      .take(args.limit ?? 20);
  },
});