import SwiftUI

public struct SignUpView: View {
    @Bindable var vm: AuthViewModel

    @State private var email = ""
    @State private var password = ""
    @State private var confirmed = false
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
                        Text("Create account")
                            .font(.system(size: 24, weight: .bold))
                            .foregroundStyle(AppTheme.primaryText)
                        Text("Join Sports Tracker")
                            .font(.subheadline)
                            .foregroundStyle(AppTheme.subtleText)
                    }
                    .padding(.top, 60)
                    .padding(.bottom, 36)

                    GlassCard {
                        VStack(spacing: 18) {
                            GlassTextField("Email", text: $email, placeholder: "you@example.com")
                                .textContentType(.emailAddress)
                            GlassTextField("Password", text: $password, placeholder: "Min. 6 characters", isSecure: true)
                                .textContentType(.newPassword)

                            if let error = vm.errorMessage {
                                ErrorBanner(error)
                            }

                            Button("Create account") {
                                Task {
                                    await vm.signUp(email: email, password: password)
                                    if vm.errorMessage == nil { confirmed = true }
                                }
                            }
                            .buttonStyle(PrimaryButtonStyle())
                            .disabled(email.isEmpty || password.count < 6)
                        }
                        .padding(20)
                    }
                    .padding(.horizontal, 20)

                    HStack(spacing: 4) {
                        Text("Already have an account?")
                            .foregroundStyle(AppTheme.subtleText)
                        Button("Sign in") { dismiss() }
                            .foregroundStyle(AppTheme.accentLight)
                            .fontWeight(.semibold)
                    }
                    .font(.subheadline)
                    .padding(.top, 24)
                    .padding(.bottom, 40)
                }
            }
        }
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .alert("Check your email", isPresented: $confirmed) {
            Button("OK") { dismiss() }
        } message: {
            Text("We sent a confirmation link to \(email). Click it to activate your account.")
        }
    }
}

#Preview {
    NavigationStack {
        SignUpView(vm: AuthViewModel(service: PreviewAuthService()))
    }
}
