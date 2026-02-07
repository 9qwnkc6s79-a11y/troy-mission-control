import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  activities: defineTable({
    timestamp: v.number(),
    category: v.string(),
    action: v.string(), 
    description: v.string(),
    metadata: v.optional(v.any()),
    tokens: v.optional(v.number()),
    duration_ms: v.optional(v.number()),
  }).index("by_timestamp", ["timestamp"]),
  
  system_state: defineTable({
    key: v.string(),
    value: v.any(),
    updated_at: v.number(),
  }).index("by_key", ["key"]),
  
  search_index: defineTable({
    content: v.string(),
    source_file: v.string(),
    source_type: v.string(), // "memory", "activity", "config", etc
    keywords: v.array(v.string()),
    updated_at: v.number(),
  }).index("by_source", ["source_file"]),
});