import SwiftUI

// MARK: - App Theme

public struct AppTheme {
    public static let backgroundGradient = LinearGradient(
        colors: [Color(hex: "0A0A0F"), Color(hex: "111118"), Color(hex: "0D0D14")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    public static let accentGradient = LinearGradient(
        colors: [Color(hex: "7B3F85"), Color(hex: "9B5AA6")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    public static let cardBackground = Color.white.opacity(0.06)
    public static let cardBorder = Color.white.opacity(0.1)
    public static let subtleText = Color(hex: "FFF1DE").opacity(0.45)
    public static let secondaryText = Color(hex: "FFF1DE").opacity(0.65)
    public static let primaryText = Color(hex: "FFF1DE")
    public static let accent = Color(hex: "7B3F85")
    public static let accentLight = Color(hex: "9B5AA6")
    public static let errorColor = Color(red: 0.97, green: 0.44, blue: 0.44)
    public static let successColor = Color(red: 0.29, green: 0.86, blue: 0.50)
}

// MARK: - Hex Color Extension

extension Color {
    public init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - View Modifiers

extension View {
    public func appBackground() -> some View {
        self.background(AppTheme.backgroundGradient.ignoresSafeArea())
    }
}
