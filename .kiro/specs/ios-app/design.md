# LifeMap iOS App - Technical Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     SwiftUI Views                        │
│  (MapView, TimelineView, SettingsView, SharingView)    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   ViewModels                             │
│  (MapViewModel, LocationViewModel, SyncViewModel)       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Repositories                            │
│  (LocationRepository, UserRepository, SyncRepository)   │
└─────────┬──────────────────────────────────┬────────────┘
          │                                  │
┌─────────▼──────────┐          ┌───────────▼────────────┐
│   Local Storage    │          │    Cloud Services      │
│   (Core Data)      │          │  (CloudKit / API)      │
└────────────────────┘          └────────────────────────┘
```

## Project Structure

```
LifeMap/
├── App/
│   ├── LifeMapApp.swift          # App entry point
│   └── AppDelegate.swift         # Background tasks
│
├── Views/
│   ├── Map/
│   │   ├── MapView.swift         # Main map screen
│   │   ├── LocationMarkerView.swift
│   │   └── PathOverlayView.swift
│   ├── Timeline/
│   │   ├── TimelineView.swift
│   │   └── LocationListItem.swift
│   ├── Settings/
│   │   ├── SettingsView.swift
│   │   └── PrivacySettingsView.swift
│   └── Auth/
│       ├── LoginView.swift
│       └── SignUpView.swift
│
├── ViewModels/
│   ├── MapViewModel.swift
│   ├── LocationViewModel.swift
│   ├── TimelineViewModel.swift
│   └── AuthViewModel.swift
│
├── Models/
│   ├── LocationPoint.swift
│   ├── User.swift
│   ├── Journey.swift
│   └── SharedLocation.swift
│
├── Services/
│   ├── Location/
│   │   ├── LocationManager.swift
│   │   ├── BackgroundLocationManager.swift
│   │   └── LocationPermissionManager.swift
│   ├── Storage/
│   │   ├── CoreDataManager.swift
│   │   └── LocationRepository.swift
│   ├── Sync/
│   │   ├── CloudKitSyncService.swift
│   │   ├── APISyncService.swift
│   │   └── SyncCoordinator.swift
│   └── Auth/
│       ├── AuthService.swift
│       └── KeychainManager.swift
│
├── Utilities/
│   ├── Extensions/
│   ├── Constants.swift
│   └── Helpers.swift
│
└── Resources/
    ├── Assets.xcassets
    ├── Info.plist
    └── LifeMap.xcdatamodeld  # Core Data model
```

## Core Components

### 1. Location Manager

```swift
class LocationManager: NSObject, ObservableObject {
    private let locationManager = CLLocationManager()
    @Published var currentLocation: CLLocation?
    @Published var authorizationStatus: CLAuthorizationStatus
    
    // Foreground tracking
    func startTracking()
    func stopTracking()
    
    // Background tracking
    func startBackgroundTracking()
    func stopBackgroundTracking()
    
    // Smart tracking
    func enableSignificantLocationChanges()
    func enableVisitMonitoring()
}
```

### 2. Core Data Model

```swift
// LocationPoint Entity
@objc(LocationPoint)
class LocationPoint: NSManagedObject {
    @NSManaged var id: UUID
    @NSManaged var latitude: Double
    @NSManaged var longitude: Double
    @NSManaged var altitude: Double
    @NSManaged var accuracy: Double
    @NSManaged var timestamp: Date
    @NSManaged var speed: Double
    @NSManaged var course: Double
    @NSManaged var synced: Bool
    @NSManaged var userId: String
}

// Journey Entity (groups of location points)
@objc(Journey)
class Journey: NSManagedObject {
    @NSManaged var id: UUID
    @NSManaged var startDate: Date
    @NSManaged var endDate: Date
    @NSManaged var distance: Double
    @NSManaged var locationPoints: NSSet
}
```

### 3. Sync Service

```swift
protocol SyncService {
    func syncLocations() async throws
    func uploadLocations(_ locations: [LocationPoint]) async throws
    func downloadLocations(since: Date) async throws -> [LocationPoint]
}

class CloudKitSyncService: SyncService {
    // CloudKit implementation
}

class APISyncService: SyncService {
    // Railway API implementation
}
```

### 4. Map View Model

```swift
@MainActor
class MapViewModel: ObservableObject {
    @Published var locationPoints: [LocationPoint] = []
    @Published var selectedDateRange: DateRange
    @Published var mapRegion: MKCoordinateRegion
    
    private let locationRepository: LocationRepository
    private let locationManager: LocationManager
    
    func loadLocations(for dateRange: DateRange)
    func centerOnCurrentLocation()
    func exportJourney() -> URL
}
```

## Background Location Tracking

### Implementation Strategy

```swift
// AppDelegate.swift
class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // Register for background tasks
        BGTaskScheduler.shared.register(
            forTaskWithIdentifier: "com.lifemap.location.sync",
            using: nil
        ) { task in
            self.handleLocationSync(task: task as! BGProcessingTask)
        }
        return true
    }
    
    func handleLocationSync(task: BGProcessingTask) {
        // Sync locations in background
        Task {
            await syncService.syncLocations()
            task.setTaskCompleted(success: true)
        }
    }
}
```

### Info.plist Configuration

```xml
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>LifeMap tracks your location to create a beautiful visualization of your life journey.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>LifeMap needs your location to show where you are on the map.</string>

<key>UIBackgroundModes</key>
<array>
    <string>location</string>
    <string>fetch</string>
    <string>processing</string>
</array>

<key>BGTaskSchedulerPermittedIdentifiers</key>
<array>
    <string>com.lifemap.location.sync</string>
</array>
```

## Data Flow

### Location Capture Flow

```
1. CLLocationManager detects location change
   ↓
2. LocationManager receives update
   ↓
3. Validate location (accuracy, speed, etc.)
   ↓
4. Save to Core Data (local)
   ↓
5. Mark as unsynced
   ↓
6. Trigger background sync (if conditions met)
   ↓
7. Upload to CloudKit/API
   ↓
8. Mark as synced
```

### Sync Strategy

**Immediate Sync** (when):
- WiFi connected
- Battery > 20%
- App in foreground

**Batch Sync** (when):
- On cellular
- Low battery
- Background mode

**Conflict Resolution**:
- Server timestamp wins
- Merge non-conflicting changes
- Keep local copy as backup

## UI/UX Design

### Main Map View

```swift
struct MapView: View {
    @StateObject var viewModel: MapViewModel
    
    var body: some View {
        ZStack {
            // Map with path overlay
            Map(coordinateRegion: $viewModel.mapRegion) {
                // User's journey path
                MapPolyline(coordinates: viewModel.pathCoordinates)
                    .stroke(Color.blue, lineWidth: 3)
                
                // Current location marker
                MapMarker(
                    coordinate: viewModel.currentLocation,
                    tint: .red
                )
            }
            
            // Floating controls
            VStack {
                // Date range picker
                DateRangePicker(selection: $viewModel.dateRange)
                
                Spacer()
                
                // Center on current location button
                Button(action: viewModel.centerOnCurrentLocation) {
                    Image(systemName: "location.fill")
                }
            }
        }
    }
}
```

### Timeline View

```swift
struct TimelineView: View {
    @StateObject var viewModel: TimelineViewModel
    
    var body: some View {
        List {
            ForEach(viewModel.groupedLocations) { day in
                Section(header: Text(day.date.formatted())) {
                    ForEach(day.locations) { location in
                        LocationRow(location: location)
                    }
                }
            }
        }
    }
}
```

## Performance Optimization

### Location Batching

```swift
class LocationBatcher {
    private var buffer: [LocationPoint] = []
    private let batchSize = 50
    
    func add(_ location: LocationPoint) {
        buffer.append(location)
        
        if buffer.count >= batchSize {
            flush()
        }
    }
    
    func flush() {
        // Save batch to Core Data
        CoreDataManager.shared.saveBatch(buffer)
        buffer.removeAll()
    }
}
```

### Map Rendering Optimization

```swift
// Use clustering for many points
class LocationClusterManager {
    func cluster(
        locations: [LocationPoint],
        zoomLevel: Double
    ) -> [LocationCluster] {
        // Group nearby locations
        // Return clusters instead of individual points
    }
}
```

## Security

### Keychain Storage

```swift
class KeychainManager {
    func save(token: String, for key: String) throws
    func retrieve(for key: String) throws -> String?
    func delete(for key: String) throws
}
```

### Data Encryption

```swift
class EncryptionService {
    func encrypt(_ data: Data) throws -> Data
    func decrypt(_ data: Data) throws -> Data
}
```

## Testing Strategy

### Unit Tests
- Location validation logic
- Sync conflict resolution
- Data transformation

### Integration Tests
- Core Data operations
- CloudKit sync
- API communication

### UI Tests
- Map interactions
- Location permission flow
- Settings changes

## Deployment

### App Store Requirements
- Privacy policy URL
- Location usage description
- App preview video
- Screenshots (all device sizes)

### TestFlight Beta
- Internal testing first
- External beta (100 users)
- Collect feedback

---

**Next Steps**:
1. Set up Xcode project
2. Implement location manager
3. Create Core Data model
4. Build map view
5. Implement sync service
6. Add authentication
7. Test on device
8. Submit to App Store
