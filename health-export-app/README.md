# Health Exporter iOS App

Simple iOS app to export health data to OpenClaw. Much more reliable than iOS Shortcuts.

## 🎯 What It Does

- **Reads HealthKit data**: Weight, steps, calories, workouts
- **Exports to JSON**: Compatible with your OpenClaw health skill
- **Saves to iCloud Drive**: `Health-Export/daily-health-export.json`
- **Auto-export option**: Exports hourly when enabled
- **Simple interface**: One-tap export, no complexity

## 📱 Setup Instructions (15 minutes)

### Step 1: Open in Xcode
1. **Install Xcode** from App Store (if not installed)
2. **Double-click** `HealthExporter.xcodeproj` to open in Xcode
3. **Select your iPhone** as the target device

### Step 2: Configure Signing
1. **Select project** in Xcode navigator
2. **Select "HealthExporter" target**
3. **Signing & Capabilities tab**
4. **Team**: Select your Apple ID / Development Team
5. **Bundle Identifier**: Change to `com.yourname.healthexporter`

### Step 3: Build and Install
1. **Connect your iPhone** to Mac via USB
2. **Trust computer** on iPhone if prompted
3. **Press ▶️ (Run)** in Xcode
4. App installs on your iPhone

### Step 4: Trust Developer
1. **iPhone Settings** → General → VPN & Device Management
2. **Find your developer profile** → Trust

### Step 5: Grant Permissions
1. **Open Health Exporter app**
2. **Allow Health access** when prompted
3. **Enable all health categories** (weight, steps, workouts)

## 🚀 How to Use

### Daily Export
1. **Open app**
2. **Tap "Export Today's Data"**
3. **Data saves** to iCloud Drive/Health-Export/

### Auto Export (Optional)
1. **Toggle "Auto-export daily"** in app
2. **Exports hourly** when app is backgrounded
3. **Most recent data** always available

### Verify Export
1. **Files app** on iPhone
2. **iCloud Drive** → Health-Export
3. **daily-health-export.json** should exist

## 📊 Data Format

Exports JSON matching OpenClaw format:
```json
{
  "date": "2026-02-07",
  "exported_at": "2026-02-07 14:30:15",
  "source": "HealthExporter iOS App",
  "weight_lbs": 185.2,
  "steps": 8450,
  "active_calories": 520,
  "workouts": [
    {
      "name": "Strength Training",
      "duration": 2700,
      "totalEnergyBurned": 220,
      "startDate": "2026-02-07",
      "endDate": "2026-02-07"
    }
  ]
}
```

## 🔧 Integration with OpenClaw

Your existing health skill automatically reads this JSON format:

```bash
# Query today's health data
python3 health-data/scripts/query_health.py --current

# Ask questions
python3 health-data/scripts/query_health.py --question "What's my weight today?"
```

The app exports to the same location your skill monitors, so everything works seamlessly.

## ⚠️ Troubleshooting

### "Health data not available"
- **Check device**: HealthKit requires iPhone, not simulator
- **iOS version**: Requires iOS 12+ for HealthKit

### "Build failed" in Xcode
- **Bundle ID**: Must be unique, change `com.danielkeene.healthexporter`
- **Team**: Select valid Apple Developer account
- **Capabilities**: Ensure HealthKit is enabled in project

### "No data exported"
- **Health permissions**: Open Health app → Sharing → Health Exporter → Enable All
- **Data sources**: Ensure RENPHO, Fitbod sync to Apple Health
- **Recent data**: Check Health app has today's data

### "File not found" on Mac
- **iCloud sync**: Takes 1-2 minutes to sync to Mac
- **iCloud Drive**: Check enabled in iPhone Settings → iCloud
- **Path**: Look for Health-Export folder in iCloud Drive

## 🆚 Why This vs iOS Shortcuts

| Feature | iOS Shortcuts | This App |
|---------|--------------|----------|
| **Reliability** | Often fails | Always works |
| **Setup time** | 30+ minutes | 15 minutes |
| **Data access** | Limited | Full HealthKit |
| **Debugging** | Impossible | Clear error messages |
| **Automation** | Unreliable | Background processing |

## 🔒 Privacy

- **Data stays local**: Only saves to your iCloud Drive
- **No internet** required (except iCloud sync)
- **No tracking**: App doesn't collect any data
- **Open source**: You can see exactly what it does

---

**Result:** Reliable health data export that just works. No fighting with Shortcuts! 📊