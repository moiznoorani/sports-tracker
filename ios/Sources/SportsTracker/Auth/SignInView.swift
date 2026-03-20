import SwiftUI
import AuthenticationServices

public struct SignInView: View {
    @Bindable var vm: AuthViewModel
    var appleSignInHandler: AppleSignInHandler

    @State private var email = ""
    @State private var password = ""

    init(vm: AuthViewModel, appleSignInHandler: AppleSignInHandler = AppleSignInHandler()) {
        self.vm = vm
        self.appleSignInHandler = appleSignInHandler
    }

    public var body: some View {
        ZStack {
            AppTheme.backgroundGradient.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 0) {
                    // Logo
                    VStack(spacing: 12) {
                        LogoMark(size: 64)
                        Text("Sports Tracker")
                            .font(.system(size: 26, weight: .bold))
                            .foregroundStyle(AppTheme.primaryText)
                        Text("Sign in to your account")
                            .font(.subheadline)
                            .foregroundStyle(AppTheme.subtleText)
                    }
                    .padding(.top, 80)
                    .padding(.bottom, 40)

                    // Form card
                    GlassCard {
                        VStack(spacing: 18) {
                            GlassTextField("Email", text: $email, placeholder: "you@example.com")
                                .textContentType(.emailAddress)
                            GlassTextField("Password", text: $password, placeholder: "••••••••", isSecure: true)
                                .textContentType(.password)

                            if let error = vm.errorMessage {
                                ErrorBanner(error)
                            }

                            Button("Sign in") {
                                Task { await vm.signIn(email: email, password: password) }
                            }
                            .buttonStyle(PrimaryButtonStyle())
                            .disabled(email.isEmpty || password.isEmpty)

                            NavigationLink {
                                ResetPasswordView(vm: vm)
                            } label: {
                                Text("Forgot password?")
                                    .font(.footnote)
                                    .foregroundStyle(AppTheme.subtleText)
                                    .frame(maxWidth: .infinity)
                            }
                        }
                        .padding(20)
                    }
                    .padding(.horizontal, 20)

                    // Divider
                    HStack {
                        Rectangle().fill(Color.white.opacity(0.08)).frame(height: 0.5)
                        Text("or").font(.caption).foregroundStyle(AppTheme.subtleText).padding(.horizontal, 12)
                        Rectangle().fill(Color.white.opacity(0.08)).frame(height: 0.5)
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 20)

                    // Apple Sign In
                    GlassCard(cornerRadius: 14) {
                        SignInWithAppleButton(.signIn) { request in
                            request.requestedScopes = [.email, .fullName]
                        } onCompletion: { _ in
                            Task {
                                guard let (idToken, nonce) = try? await appleSignInHandler.signIn() else { return }
                                await vm.signInWithApple(idToken: idToken, nonce: nonce)
                            }
                        }
                        .frame(height: 50)
                        .padding(.horizontal, 4)
                        .padding(.vertical, 2)
                    }
                    .padding(.horizontal, 20)

                    // Sign up link
                    HStack(spacing: 4) {
                        Text("No account?")
                            .foregroundStyle(AppTheme.subtleText)
                        NavigationLink("Create one") {
                            SignUpView(vm: vm)
                        }
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
        .navigationBarHidden(true)
        #endif
    }
}

#Preview {
    NavigationStack {
        SignInView(vm: AuthViewModel(service: PreviewAuthService()))
    }
}
