import { ConvexHttpClient } from "convex/browser";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.CONVEX_URL || "");

export async function logActivity(category, action, description, metadata = {}) {
    try {
        // Log to Convex for real-time updates
        await convex.mutation("activities:log", {
            category,
            action, 
            description,
            metadata,
            tokens: metadata.tokens,
            duration_ms: metadata.duration_ms,
        });
        
        // Also log locally as backup
        const localLogger = await import('./logger.js');
        localLogger.default(category, action, description, metadata);
        
        console.log(`✓ Activity logged: ${category}/${action}`);
    } catch (error) {
        console.error('Convex logging failed, using local only:', error.message);
        
        // Fallback to local logging
        const localLogger = await import('./logger.js');
        localLogger.default(category, action, description, metadata);
    }
}