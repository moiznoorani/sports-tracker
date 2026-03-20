import SwiftUI

public struct ResetPasswordView: View {
    @Bindable var vm: AuthViewModel

    @State private var email = ""
    @State private var sent = false
    @Environment(\.dismiss) private var dismiss

    init(vm: AuthViewModel) {
        self.vm = vm
    }

    public var body: some View {
        ZStack {
            AppTheme.backgroundGradient.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 0) {
                    VStack(spacing: 12) {
                        LogoMark(size: 56)
                        Text("Reset password")
                            .font(.system(size: 24, weight: .bold))
                            .foregroundStyle(AppTheme.primaryText)
                        Text("We'll send you a link to get back in")
                            .font(.subheadline)
                            .foregroundStyle(AppTheme.subtleText)
                    }
                    .padding(.top, 60)
                    .padding(.bottom, 36)

                    GlassCard {
                        VStack(spacing: 18) {
                            GlassTextField("Email", text: $email, placeholder: "you@example.com")
                                .textContentType(.emailAddress)

                            if let error = vm.errorMessage {
                                ErrorBanner(error)
                            }

                            Button("Send reset link") {
                                Task {
                                    let ok = await vm.resetPassword(email: email)
                                    if ok { sent = true }
                                }
                            }
                            .buttonStyle(PrimaryButtonStyle())
                            .disabled(email.isEmpty)
                        }
                        .padding(20)
                    }
                    .padding(.horizontal, 20)

                    Button("Back to sign in") { dismiss() }
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundStyle(AppTheme.accentLight)
                        .padding(.top, 24)
                }
            }
        }
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .alert("Email sent", isPresented: $sent) {
            Button("OK") { dismiss() }
        } message: {
            Text("Check \(email) for a reset link.")
        }
    }
}

#Preview {
    NavigationStack {
        ResetPasswordView(vm: AuthViewModel(service: PreviewAuthService()))
    }
}
