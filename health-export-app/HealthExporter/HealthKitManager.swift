import Foundation
import HealthKit

class HealthKitManager: ObservableObject {
    private let healthStore = HKHealthStore()
    
    @Published var hasPermissions = false
    @Published var currentWeight: Double?
    @Published var currentSteps: Double?
    @Published var currentActiveCalories: Double?
    @Published var todayWorkouts: [HKWorkout] = []
    @Published var autoExportEnabled = false {
        didSet {
            UserDefaults.standard.set(autoExportEnabled, forKey: "autoExportEnabled")
            if autoExportEnabled {
                scheduleAutoExport()
            }
        }
    }
    
    init() {
        autoExportEnabled = UserDefaults.standard.bool(forKey: "autoExportEnabled")
        if autoExportEnabled {
            scheduleAutoExport()
        }
    }
    
    func requestPermissions() {
        guard HKHealthStore.isHealthDataAvailable() else {
            print("Health data not available")
            return
        }
        
        let readTypes: Set<HKObjectType> = [
            HKQuantityType.quantityType(forIdentifier: .bodyMass)!,
            HKQuantityType.quantityType(forIdentifier: .stepCount)!,
            HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned)!,
            HKQuantityType.quantityType(forIdentifier: .basalEnergyBurned)!,
            HKQuantityType.quantityType(forIdentifier: .heartRate)!,
            HKObjectType.workoutType(),
            HKQuantityType.quantityType(forIdentifier: .distanceWalkingRunning)!
        ]
        
        healthStore.requestAuthorization(toShare: [], read: readTypes) { [weak self] success, error in
            DispatchQueue.main.async {
                self?.hasPermissions = success
                if success {
                    self?.loadTodayData()
                }
            }
        }
    }
    
    func loadTodayData() {
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        let tomorrow = calendar.date(byAdding: .day, value: 1, to: today)!
        
        // Load weight (most recent this week)
        loadMostRecentWeight()
        
        // Load today's steps
        loadSteps(from: today, to: tomorrow)
        
        // Load today's active calories
        loadActiveCalories(from: today, to: tomorrow)
        
        // Load today's workouts
        loadWorkouts(from: today, to: tomorrow)
    }
    
    private func loadMostRecentWeight() {
        guard let weightType = HKQuantityType.quantityType(forIdentifier: .bodyMass) else { return }
        
        let calendar = Calendar.current
        let weekAgo = calendar.date(byAdding: .day, value: -7, to: Date())!
        let predicate = HKQuery.predicateForSamples(withStart: weekAgo, end: Date(), options: .strictStartDate)
        
        let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)
        
        let query = HKSampleQuery(sampleType: weightType, predicate: predicate, limit: 1, sortDescriptors: [sortDescriptor]) { [weak self] _, samples, error in
            guard let weightSample = samples?.first as? HKQuantitySample else { return }
            
            DispatchQueue.main.async {
                self?.currentWeight = weightSample.quantity.doubleValue(for: .pound())
            }
        }
        
        healthStore.execute(query)
    }
    
    private func loadSteps(from startDate: Date, to endDate: Date) {
        guard let stepsType = HKQuantityType.quantityType(forIdentifier: .stepCount) else { return }
        
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: .strictStartDate)
        
        let query = HKStatisticsQuery(quantityType: stepsType, quantitySamplePredicate: predicate, options: .cumulativeSum) { [weak self] _, result, error in
            guard let sum = result?.sumQuantity() else { return }
            
            DispatchQueue.main.async {
                self?.currentSteps = sum.doubleValue(for: .count())
            }
        }
        
        healthStore.execute(query)
    }
    
    private func loadActiveCalories(from startDate: Date, to endDate: Date) {
        guard let caloriesType = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned) else { return }
        
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: .strictStartDate)
        
        let query = HKStatisticsQuery(quantityType: caloriesType, quantitySamplePredicate: predicate, options: .cumulativeSum) { [weak self] _, result, error in
            guard let sum = result?.sumQuantity() else { return }
            
            DispatchQueue.main.async {
                self?.currentActiveCalories = sum.doubleValue(for: .kilocalorie())
            }
        }
        
        healthStore.execute(query)
    }
    
    private func loadWorkouts(from startDate: Date, to endDate: Date) {
        let predicate = HKQuery.predicateForWorkouts(withStart: startDate, end: endDate)
        
        let query = HKSampleQuery(sampleType: HKWorkoutType.workoutType(), predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { [weak self] _, samples, error in
            guard let workouts = samples as? [HKWorkout] else { return }
            
            DispatchQueue.main.async {
                self?.todayWorkouts = workouts
            }
        }
        
        healthStore.execute(query)
    }
    
    func exportTodayData() async -> Bool {
        // Ensure we have current data
        await withCheckedContinuation { continuation in
            DispatchQueue.main.async {
                self.loadTodayData()
                // Give it a moment to load
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                    continuation.resume(returning: ())
                }
            }
        }
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        let dateString = dateFormatter.string(from: Date())
        
        let timeFormatter = DateFormatter()
        timeFormatter.dateFormat = "HH:mm:ss"
        let timeString = timeFormatter.string(from: Date())
        
        // Build JSON structure matching OpenClaw format
        var healthData: [String: Any] = [
            "date": dateString,
            "exported_at": "\(dateString) \(timeString)",
            "source": "HealthExporter iOS App"
        ]
        
        if let weight = currentWeight {
            healthData["weight_lbs"] = weight
        }
        
        if let steps = currentSteps {
            healthData["steps"] = Int(steps)
        }
        
        if let calories = currentActiveCalories {
            healthData["active_calories"] = Int(calories)
        }
        
        // Format workouts
        var workoutsArray: [[String: Any]] = []
        for workout in todayWorkouts {
            var workoutData: [String: Any] = [
                "name": workout.workoutActivityType.name,
                "duration": workout.duration,
                "startDate": dateFormatter.string(from: workout.startDate),
                "endDate": dateFormatter.string(from: workout.endDate)
            ]
            
            if let totalEnergy = workout.totalEnergyBurned {
                workoutData["totalEnergyBurned"] = totalEnergy.doubleValue(for: .kilocalorie())
            }
            
            if let distance = workout.totalDistance {
                workoutData["totalDistance"] = distance.doubleValue(for: .mile())
            }
            
            workoutsArray.append(workoutData)
        }
        healthData["workouts"] = workoutsArray
        
        // Export to iCloud Drive
        return await saveToiCloud(data: healthData, filename: "daily-health-export.json")
    }
    
    private func saveToiCloud(data: [String: Any], filename: String) async -> Bool {
        guard let documentsURL = FileManager.default.url(forUbiquityContainerIdentifier: nil)?.appendingPathComponent("Documents") else {
            print("iCloud Drive not available")
            return false
        }
        
        let healthExportURL = documentsURL.appendingPathComponent("Health-Export")
        
        // Create directory if it doesn't exist
        try? FileManager.default.createDirectory(at: healthExportURL, withIntermediateDirectories: true)
        
        let fileURL = healthExportURL.appendingPathComponent(filename)
        
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: data, options: .prettyPrinted)
            try jsonData.write(to: fileURL)
            print("Health data exported to: \(fileURL.path)")
            return true
        } catch {
            print("Failed to export health data: \(error)")
            return false
        }
    }
    
    private func scheduleAutoExport() {
        // For simplicity, we'll use a basic timer
        // In a production app, you'd want to use background app refresh
        Timer.scheduledTimer(withTimeInterval: 3600, repeats: true) { _ in
            Task {
                await self.exportTodayData()
            }
        }
    }
}

// Extension to get workout type names
extension HKWorkoutActivityType {
    var name: String {
        switch self {
        case .walking: return "Walking"
        case .running: return "Running"
        case .cycling: return "Cycling"
        case .swimming: return "Swimming"
        case .yoga: return "Yoga"
        case .functionalStrengthTraining: return "Strength Training"
        case .traditionalStrengthTraining: return "Weight Training"
        case .crossTraining: return "Cross Training"
        case .hiking: return "Hiking"
        case .tennis: return "Tennis"
        case .basketball: return "Basketball"
        case .soccer: return "Soccer"
        default: return "Other Exercise"
        }
    }
}