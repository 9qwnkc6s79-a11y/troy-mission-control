import { ConvexHttpClient } from "convex/browser";

// Test Convex connection with error details
async function testConvex() {
    try {
        // Test basic connection first
        const response = await fetch("http://127.0.0.1:3210");
        console.log("🔍 Basic connection test:", response.status);
        
        const convex = new ConvexHttpClient("http://127.0.0.1:3210");
        
        // Try to query first (simpler operation)
        console.log("📊 Testing query...");
        const recent = await convex.query("activities:getRecent", { limit: 5 });
        console.log("✅ Query successful! Activities:", recent.length);
        
        // Then try mutation
        console.log("📝 Testing mutation...");
        const result = await convex.mutation("activities:log", {
            category: "system",
            action: "convex_test", 
            description: "Testing Convex integration - real-time logging active",
            metadata: { test: true, timestamp: Date.now() }
        });
        
        console.log("✅ Convex fully working! Activity ID:", result);
        return true;
        
    } catch (error) {
        console.error("❌ Detailed error:", error);
        return false;
    }
}

testConvex();