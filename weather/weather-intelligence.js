// Weather Intelligence for Daniel's locations
// Integrates with mission control dashboard

class WeatherIntelligence {
    constructor() {
        this.locations = {
            home: { name: "Aubrey, TX", query: "Aubrey+TX", coords: [33.3142085, -96.9756323] },
            boundaries_little_elm: { name: "Little Elm (Boundaries)", query: "Little+Elm+TX" },
            boundaries_prosper: { name: "Prosper (Boundaries)", query: "Prosper+TX" },
            dallas: { name: "Dallas", query: "Dallas+TX" },
            southlake: { name: "Southlake (Ancor)", query: "Southlake+TX" }
        };
        
        this.workoutThreshold = 45; // Below this temp (F), recommend indoor workout
        this.umbrella_threshold = 30; // Above this precip %, recommend umbrella
    }

    async getCurrentWeather(location = 'home') {
        const loc = this.locations[location];
        if (!loc) throw new Error(`Unknown location: ${location}`);
        
        try {
            const response = await fetch(`https://wttr.in/${loc.query}?format=j1`);
            const data = await response.json();
            
            return {
                location: loc.name,
                current: {
                    temp_f: parseInt(data.current_condition[0].temp_F),
                    temp_c: parseInt(data.current_condition[0].temp_C),
                    condition: data.current_condition[0].weatherDesc[0].value,
                    humidity: parseInt(data.current_condition[0].humidity),
                    wind_mph: parseInt(data.current_condition[0].windspeedMiles),
                    wind_dir: data.current_condition[0].winddir16Point,
                    precip_mm: parseFloat(data.current_condition[0].precipMM),
                    uv_index: parseInt(data.current_condition[0].uvIndex)
                },
                forecast: this.parseForecast(data.weather),
                suggestions: this.generateSuggestions(data)
            };
        } catch (error) {
            console.error(`Weather fetch failed for ${location}:`, error);
            return null;
        }
    }

    parseForecast(weather) {
        return weather.slice(0, 3).map(day => ({
            date: day.date,
            max_f: parseInt(day.maxtempF),
            min_f: parseInt(day.mintempF),
            condition: day.hourly[4].weatherDesc[0].value, // ~noon
            precip_chance: parseInt(day.hourly[4].chanceofrain),
            wind_mph: parseInt(day.hourly[4].windspeedMiles)
        }));
    }

    generateSuggestions(data) {
        const current = data.current_condition[0];
        const today = data.weather[0];
        const temp_f = parseInt(current.temp_F);
        const rain_chance = parseInt(today.hourly[4].chanceofrain);
        const wind_mph = parseInt(current.windspeedMiles);
        
        const suggestions = [];

        // Workout recommendations
        if (temp_f < this.workoutThreshold) {
            suggestions.push({
                type: 'workout',
                message: `🏃‍♂️ Cold morning (${temp_f}°F) - perfect for your 5:15am indoor workout session`
            });
        } else if (temp_f > 75) {
            suggestions.push({
                type: 'workout',
                message: `🌡️ Warm start (${temp_f}°F) - consider earlier workout or indoor gym`
            });
        }

        // Commute/travel recommendations
        if (rain_chance > this.umbrella_threshold) {
            suggestions.push({
                type: 'travel',
                message: `☔ ${rain_chance}% chance of rain today - pack umbrella for Boundaries/Dallas trips`
            });
        }

        if (wind_mph > 20) {
            suggestions.push({
                type: 'travel',
                message: `💨 Windy conditions (${wind_mph}mph) - secure outdoor signage at Boundaries locations`
            });
        }

        // Business recommendations
        const forecast = today.hourly;
        const peak_hours = forecast.slice(2, 6); // 6am-2pm coffee rush
        const good_coffee_weather = peak_hours.every(hour => 
            parseInt(hour.chanceofrain) < 50 && parseInt(hour.tempF) > 35
        );

        if (good_coffee_weather) {
            suggestions.push({
                type: 'business',
                message: '☕ Great coffee weather predicted during rush hours - expect strong sales'
            });
        }

        return suggestions;
    }

    async getLocationComparison() {
        const weather_data = {};
        for (const [key, location] of Object.entries(this.locations)) {
            weather_data[key] = await this.getCurrentWeather(key);
            await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
        }
        return weather_data;
    }

    formatForDashboard(weather) {
        if (!weather) return '<div class="weather-error">Weather unavailable</div>';
        
        const { current, forecast, suggestions } = weather;
        
        return `
            <div class="weather-widget">
                <div class="current-weather">
                    <h3>${weather.location}</h3>
                    <div class="temp">${current.temp_f}°F</div>
                    <div class="condition">${current.condition}</div>
                    <div class="details">
                        💧 ${current.humidity}% | 💨 ${current.wind_mph}mph ${current.wind_dir}
                    </div>
                </div>
                
                <div class="forecast">
                    ${forecast.map(day => `
                        <div class="forecast-day">
                            <div class="date">${new Date(day.date).toLocaleDateString('en-US', {weekday: 'short'})}</div>
                            <div class="temps">${day.max_f}°/${day.min_f}°</div>
                            <div class="precip">${day.precip_chance}%</div>
                        </div>
                    `).join('')}
                </div>
                
                ${suggestions.length > 0 ? `
                    <div class="weather-suggestions">
                        ${suggestions.map(s => `
                            <div class="suggestion suggestion-${s.type}">
                                ${s.message}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
}

// Export for mission control integration
window.WeatherIntelligence = WeatherIntelligence;

// Auto-start for standalone use
if (typeof module !== 'undefined') {
    module.exports = WeatherIntelligence;
}