import SwiftUI

struct ContentView: View {
    @StateObject private var healthManager = HealthKitManager()
    @State private var isExporting = false
    @State private var exportMessage = ""
    @State private var showingAlert = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                
                // Header
                VStack(spacing: 10) {
                    Image(systemName: "heart.text.square")
                        .font(.system(size: 60))
                        .foregroundColor(.pink)
                    
                    Text("Health Exporter")
                        .font(.title)
                        .fontWeight(.bold)
                    
                    Text("Export your health data to OpenClaw")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                
                // Current Data Preview
                if healthManager.hasPermissions {
                    VStack(alignment: .leading, spacing: 15) {
                        Text("Today's Data")
                            .font(.headline)
                            .padding(.bottom, 5)
                        
                        if let weight = healthManager.currentWeight {
                            HStack {
                                Image(systemName: "scalemass")
                                    .foregroundColor(.blue)
                                Text("Weight: \(weight, specifier: "%.1f") lbs")
                            }
                        }
                        
                        if let steps = healthManager.currentSteps {
                            HStack {
                                Image(systemName: "figure.walk")
                                    .foregroundColor(.green)
                                Text("Steps: \(Int(steps))")
                            }
                        }
                        
                        if let calories = healthManager.currentActiveCalories {
                            HStack {
                                Image(systemName: "flame")
                                    .foregroundColor(.orange)
                                Text("Active Calories: \(Int(calories))")
                            }
                        }
                        
                        if healthManager.todayWorkouts.count > 0 {
                            HStack {
                                Image(systemName: "dumbbell")
                                    .foregroundColor(.purple)
                                Text("Workouts: \(healthManager.todayWorkouts.count)")
                            }
                        }
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(10)
                } else {
                    Text("Grant Health permissions to see your data")
                        .foregroundColor(.secondary)
                        .padding()
                }
                
                Spacer()
                
                // Export Button
                Button(action: exportHealthData) {
                    HStack {
                        if isExporting {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .scaleEffect(0.8)
                        } else {
                            Image(systemName: "square.and.arrow.up")
                        }
                        Text(isExporting ? "Exporting..." : "Export Today's Data")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(healthManager.hasPermissions ? Color.blue : Color.gray)
                    .foregroundColor(.white)
                    .cornerRadius(10)
                }
                .disabled(!healthManager.hasPermissions || isExporting)
                
                // Auto-export toggle
                if healthManager.hasPermissions {
                    Toggle("Auto-export daily", isOn: $healthManager.autoExportEnabled)
                        .padding(.horizontal)
                }
                
                Text("Data exports to iCloud Drive/Health-Export/")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            .padding()
            .navigationBarHidden(true)
        }
        .onAppear {
            healthManager.requestPermissions()
        }
        .alert("Export Result", isPresented: $showingAlert) {
            Button("OK") { }
        } message: {
            Text(exportMessage)
        }
    }
    
    private func exportHealthData() {
        guard !isExporting else { return }
        
        isExporting = true
        
        Task {
            do {
                let success = await healthManager.exportTodayData()
                
                await MainActor.run {
                    isExporting = false
                    if success {
                        exportMessage = "Health data exported successfully!\n\nSaved to iCloud Drive/Health-Export/daily-health-export.json"
                    } else {
                        exportMessage = "Failed to export health data. Please check permissions and try again."
                    }
                    showingAlert = true
                }
            }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}