import SwiftUI

// MARK: - Glass Card

public struct GlassCard<Content: View>: View {
    let cornerRadius: CGFloat
    let content: () -> Content

    public init(cornerRadius: CGFloat = 20, @ViewBuilder content: @escaping () -> Content) {
        self.cornerRadius = cornerRadius
        self.content = content
    }

    public var body: some View {
        content()
            .background {
                ZStack {
                    RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                        .fill(.ultraThinMaterial)
                        .environment(\.colorScheme, .dark)

                    RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: [Color.white.opacity(0.10), Color.white.opacity(0.03), .clear],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )

                    RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                        .strokeBorder(
                            LinearGradient(
                                colors: [Color.white.opacity(0.18), Color.white.opacity(0.05)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 0.5
                        )
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
            .shadow(color: .black.opacity(0.25), radius: 12, x: 0, y: 6)
    }
}

// MARK: - Primary Button Style (accent gradient)

public struct PrimaryButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) private var isEnabled

    public init() {}

    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 16, weight: .semibold))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background {
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(AppTheme.accentGradient)
                    .shadow(color: AppTheme.accent.opacity(isEnabled ? 0.4 : 0), radius: 12, y: 4)
            }
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .opacity(isEnabled ? (configuration.isPressed ? 0.85 : 1.0) : 0.5)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}

// MARK: - Glass Button Style (frosted secondary)

public struct GlassButtonStyle: ButtonStyle {
    public init() {}

    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 15, weight: .semibold))
            .foregroundStyle(AppTheme.primaryText)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background {
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(.ultraThinMaterial)
                    .environment(\.colorScheme, .dark)
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .strokeBorder(Color.white.opacity(0.12), lineWidth: 0.5)
                    )
            }
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .opacity(configuration.isPressed ? 0.85 : 1.0)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}

// MARK: - Glass Text Field

public struct GlassTextField: View {
    let label: String
    @Binding var text: String
    var placeholder: String = ""
    var isSecure: Bool = false
    var autocorrection: Bool = false

    public init(
        _ label: String,
        text: Binding<String>,
        placeholder: String = "",
        isSecure: Bool = false,
        autocorrection: Bool = false
    ) {
        self.label = label
        self._text = text
        self.placeholder = placeholder
        self.isSecure = isSecure
        self.autocorrection = autocorrection
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label.uppercased())
                .font(.system(size: 11, weight: .semibold))
                .tracking(1.2)
                .foregroundStyle(AppTheme.subtleText)

            Group {
                if isSecure {
                    SecureField(placeholder, text: $text)
                } else {
                    TextField(placeholder, text: $text)
                        .autocorrectionDisabled(!autocorrection)
                }
            }
            .font(.system(size: 15))
            .foregroundStyle(AppTheme.primaryText)
            .padding(.horizontal, 16)
            .padding(.vertical, 13)
            .background {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(Color.white.opacity(0.05))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .strokeBorder(Color.white.opacity(0.1), lineWidth: 0.5)
                    )
            }
            .tint(AppTheme.accentLight)
        }
    }
}

// MARK: - Glass Tag

public struct GlassTag: View {
    let text: String
    var color: Color = AppTheme.accent

    public init(_ text: String, color: Color = AppTheme.accent) {
        self.text = text
        self.color = color
    }

    public var body: some View {
        Text(text)
            .font(.caption2)
            .fontWeight(.semibold)
            .foregroundStyle(color)
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background {
                Capsule()
                    .fill(color.opacity(0.15))
                    .overlay(Capsule().strokeBorder(color.opacity(0.25), lineWidth: 0.5))
            }
    }
}

// MARK: - Logo Mark

public struct LogoMark: View {
    var size: CGFloat = 56

    public init(size: CGFloat = 56) {
        self.size = size
    }

    public var body: some View {
        RoundedRectangle(cornerRadius: size * 0.3, style: .continuous)
            .fill(AppTheme.accentGradient)
            .frame(width: size, height: size)
            .overlay(
                Text("ST")
                    .font(.system(size: size * 0.35, weight: .bold))
                    .foregroundStyle(.white)
            )
            .shadow(color: AppTheme.accent.opacity(0.45), radius: size * 0.3, y: size * 0.12)
    }
}

// MARK: - Error Banner

public struct ErrorBanner: View {
    let message: String

    public init(_ message: String) {
        self.message = message
    }

    public var body: some View {
        Text(message)
            .font(.footnote)
            .foregroundStyle(AppTheme.errorColor)
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background {
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(AppTheme.errorColor.opacity(0.12))
            }
    }
}
