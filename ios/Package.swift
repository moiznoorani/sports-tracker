// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "SportsTracker",
    platforms: [.iOS(.v18), .macOS(.v15)],
    products: [
        .library(name: "SportsTracker", targets: ["SportsTracker"]),
    ],
    dependencies: [
        .package(url: "https://github.com/supabase/supabase-swift.git", from: "2.0.0"),
    ],
    targets: [
        .target(
            name: "SportsTracker",
            dependencies: [
                .product(name: "Supabase", package: "supabase-swift"),
            ],
            path: "Sources/SportsTracker"
        ),
        .testTarget(
            name: "SportsTrackerTests",
            dependencies: ["SportsTracker"],
            path: "Tests/SportsTrackerTests"
        ),
    ]
)
