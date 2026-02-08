// GPX Route Analysis for Daniel's Cycling Data
// Analyzes cycling performance, route metrics, and weather correlation

class CyclingAnalyzer {
    constructor() {
        this.earthRadius = 6371000; // meters
    }

    parseGPXData(gpxContent) {
        // Extract trackpoints from the GPX data
        const trackpoints = [];
        const lines = gpxContent.split('\n');
        
        for (const line of lines) {
            if (line.includes('<trkpt')) {
                const latMatch = line.match(/lat="([^"]+)"/);
                const lonMatch = line.match(/lon="([^"]+)"/);
                
                if (latMatch && lonMatch) {
                    const lat = parseFloat(latMatch[1]);
                    const lon = parseFloat(lonMatch[1]);
                    
                    // Look for elevation and time in following lines
                    let elevation = 0;
                    let timestamp = null;
                    let speed = 0;
                    
                    const eleMatch = line.match(/<ele>([^<]+)<\/ele>/);
                    if (eleMatch) elevation = parseFloat(eleMatch[1]);
                    
                    const timeMatch = line.match(/<time>([^<]+)<\/time>/);
                    if (timeMatch) timestamp = new Date(timeMatch[1]);
                    
                    const speedMatch = line.match(/<speed>([^<]+)<\/speed>/);
                    if (speedMatch) speed = parseFloat(speedMatch[1]); // m/s
                    
                    if (lat && lon && timestamp) {
                        trackpoints.push({
                            lat, lon, elevation, timestamp, speed
                        });
                    }
                }
            }
        }
        
        return trackpoints;
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        // Haversine formula for distance between two GPS points
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return this.earthRadius * c; // meters
    }

    toRadians(degrees) {
        return degrees * (Math.PI/180);
    }

    analyzeRoute(trackpoints) {
        if (trackpoints.length < 2) return null;

        let totalDistance = 0;
        let totalElevationGain = 0;
        let maxSpeed = 0;
        let averageSpeed = 0;
        let speedSum = 0;
        let validSpeedCount = 0;
        
        const startTime = trackpoints[0].timestamp;
        const endTime = trackpoints[trackpoints.length - 1].timestamp;
        const duration = (endTime - startTime) / 1000; // seconds

        for (let i = 1; i < trackpoints.length; i++) {
            const prev = trackpoints[i-1];
            const curr = trackpoints[i];
            
            // Distance calculation
            const segmentDistance = this.calculateDistance(
                prev.lat, prev.lon, curr.lat, curr.lon
            );
            totalDistance += segmentDistance;
            
            // Elevation gain
            if (curr.elevation > prev.elevation) {
                totalElevationGain += (curr.elevation - prev.elevation);
            }
            
            // Speed analysis
            if (curr.speed > 0) {
                maxSpeed = Math.max(maxSpeed, curr.speed);
                speedSum += curr.speed;
                validSpeedCount++;
            }
        }

        averageSpeed = validSpeedCount > 0 ? speedSum / validSpeedCount : 0;

        return {
            startTime,
            endTime,
            duration: duration / 60, // minutes
            totalDistance: totalDistance / 1000, // km
            totalElevationGain, // meters
            maxSpeed: maxSpeed * 3.6, // km/h
            averageSpeed: averageSpeed * 3.6, // km/h
            avgPace: totalDistance > 0 ? (duration / 60) / (totalDistance / 1000) : 0, // min/km
            startLocation: { lat: trackpoints[0].lat, lon: trackpoints[0].lon },
            endLocation: { 
                lat: trackpoints[trackpoints.length-1].lat, 
                lon: trackpoints[trackpoints.length-1].lon 
            }
        };
    }

    getLocationName(lat, lon) {
        // Simple location identification for Aubrey area
        if (lat >= 33.20 && lat <= 33.35 && lon >= -97.0 && lon <= -96.85) {
            if (lat >= 33.31 && lon >= -96.98) return "Aubrey, TX";
            if (lat >= 33.28 && lon >= -96.95) return "Cross Roads, TX";
            if (lat <= 33.25 && lon <= -96.92) return "Little Elm, TX";
            return "North Denton County, TX";
        }
        return "Unknown Location";
    }

    formatAnalysis(analysis) {
        if (!analysis) return "No route data available";

        const startLocation = this.getLocationName(
            analysis.startLocation.lat, 
            analysis.startLocation.lon
        );

        return {
            summary: {
                date: analysis.startTime.toLocaleDateString(),
                startTime: analysis.startTime.toLocaleTimeString(),
                location: startLocation,
                distance: `${analysis.totalDistance.toFixed(2)} km`,
                duration: `${Math.floor(analysis.duration)}:${String(Math.floor((analysis.duration % 1) * 60)).padStart(2, '0')}`,
                averageSpeed: `${analysis.averageSpeed.toFixed(1)} km/h`,
                maxSpeed: `${analysis.maxSpeed.toFixed(1)} km/h`,
                elevationGain: `${Math.round(analysis.totalElevationGain)}m`,
                pace: `${Math.floor(analysis.avgPace)}:${String(Math.floor((analysis.avgPace % 1) * 60)).padStart(2, '0')} min/km`
            },
            performance: {
                rating: this.getRideRating(analysis),
                insights: this.getPerformanceInsights(analysis)
            },
            weatherCorrelation: this.getWeatherInsights(analysis.startTime)
        };
    }

    getRideRating(analysis) {
        // Simple performance rating based on speed and distance
        const score = analysis.averageSpeed * 0.4 + analysis.totalDistance * 2;
        
        if (score >= 50) return "Excellent 🚴‍♂️💨";
        if (score >= 35) return "Great 👍";
        if (score >= 25) return "Good ✓";
        if (score >= 15) return "Moderate 🚴‍♂️";
        return "Easy ride 😌";
    }

    getPerformanceInsights(analysis) {
        const insights = [];
        
        // Distance insights
        if (analysis.totalDistance > 30) {
            insights.push("🏆 Long ride - excellent endurance training!");
        } else if (analysis.totalDistance > 20) {
            insights.push("💪 Solid distance for fitness building");
        }

        // Speed insights
        if (analysis.averageSpeed > 25) {
            insights.push("⚡ Fast average pace - great power output!");
        } else if (analysis.averageSpeed > 20) {
            insights.push("🎯 Good steady pace maintained");
        }

        // Elevation insights
        if (analysis.totalElevationGain > 300) {
            insights.push("⛰️ Challenging climbs - building leg strength!");
        } else if (analysis.totalElevationGain > 150) {
            insights.push("📈 Moderate elevation - good hill training");
        } else {
            insights.push("🏁 Flat route - focus on speed and endurance");
        }

        // Duration insights
        if (analysis.duration > 120) {
            insights.push("⏱️ Long session - excellent cardiovascular training");
        }

        return insights;
    }

    getWeatherInsights(rideTime) {
        // This would integrate with the weather system to provide context
        // For now, return a placeholder that could be enhanced
        return {
            conditions: "Weather data would be integrated here",
            recommendation: "Check weather patterns for optimal ride timing"
        };
    }
}

// Export for use in mission control
if (typeof module !== 'undefined') {
    module.exports = CyclingAnalyzer;
} else {
    window.CyclingAnalyzer = CyclingAnalyzer;
}