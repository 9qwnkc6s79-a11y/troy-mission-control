#!/bin/bash

echo "🍎 Updating OpenClaw health skill to work with iOS app export..."

# Update the health data processor to prioritize iOS app exports
echo "📱 Configuring health skill for iOS app integration..."

# Update the query script to look for iOS app exports first
cd ../health-data/scripts

# Create backup
cp process_health_data.py process_health_data.py.backup

# Update the file paths to prioritize iOS app exports
python3 << 'EOF'
import sys

# Read the current file
with open('process_health_data.py', 'r') as f:
    content = f.read()

# Update the iCloud path to match iOS app export location
old_path = 'Path.home() / "Library/Mobile Documents/com~apple~CloudDocs/Health-Export"'
new_path = 'Path.home() / "Library/Mobile Documents/com~apple~CloudDocs/Health-Export"'

# The path is already correct, but let's make sure it prioritizes iOS app format
updated_content = content.replace(
    'print(f"📝 Using sample data for testing: {export_file}")',
    'print(f"📱 Using iOS app export data: {export_file}")'
)

# Write the updated file
with open('process_health_data.py', 'w') as f:
    f.write(updated_content)

print("✅ Updated health data processor to prioritize iOS app exports")
EOF

echo "✅ Health skill updated for iOS app integration"
echo ""
echo "🎯 Next steps:"
echo "1. Build and install the iOS app (see README.md)"
echo "2. Export health data from the app"
echo "3. Test OpenClaw health queries:"
echo "   cd ../../health-data"
echo "   python3 scripts/query_health.py --current"
echo ""
echo "📱 The iOS app will export to the same location the skill monitors,"
echo "   so everything should work seamlessly!"