import fs from 'fs';
import path from 'path';
import { ConvexHttpClient } from "convex/browser";

// Initialize Convex client
const convex = new ConvexHttpClient("http://127.0.0.1:3210");

export default function logActivity(category, action, description, metadata = {}) {
    const timestamp = Date.now();
    const entry = {
        timestamp,
        datetime: new Date(timestamp).toISOString(),
        category,
        action,
        description,
        metadata
    };

    // Log to Convex for real-time dashboard
    convex.mutation("activities:log", {
        category,
        action,
        description,
        metadata,
        tokens: metadata.tokens,
        duration_ms: metadata.duration_ms,
    }).catch(error => {
        console.warn('Convex logging failed (using local only):', error.message);
    });

    // Also log locally as backup
    const activityDir = path.join(process.cwd(), 'activity', 'logs');
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(activityDir, `${today}.jsonl`);

    // Ensure directory exists
    if (!fs.existsSync(activityDir)) {
        fs.mkdirSync(activityDir, { recursive: true });
    }

    // Append to JSONL file
    try {
        fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
    } catch (error) {
        console.error('Failed to write activity log:', error);
    }
}

// For command-line usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const [,, category, action, description, metadataStr] = process.argv;
    
    if (!category || !action || !description) {
        console.error('Usage: node logger.js <category> <action> <description> [metadata-json]');
        process.exit(1);
    }
    
    let metadata = {};
    if (metadataStr) {
        try {
            metadata = JSON.parse(metadataStr);
        } catch (error) {
            console.error('Invalid JSON metadata:', error.message);
            process.exit(1);
        }
    }
    
    logActivity(category, action, description, metadata);
    console.log('Activity logged successfully');
}