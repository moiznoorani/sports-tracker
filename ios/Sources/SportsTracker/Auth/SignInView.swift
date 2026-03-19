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
        NavigationStack {
            Form {
                Section {
                    TextField("Email", text: $email)
                        .textContentType(.emailAddress)
                        .autocorrectionDisabled()
                    SecureField("Password", text: $password)
                        .textContentType(.password)
                }

                Section {
                    Button("Sign In") {
                        Task { await vm.signIn(email: email, password: password) }
                    }
                    .disabled(email.isEmpty || password.isEmpty)

                    SignInWithAppleButton(.signIn) { request in
                        request.requestedScopes = [.email, .fullName]
                    } onCompletion: { _ in
                        Task {
                            guard let (idToken, nonce) = try? await appleSignInHandler.signIn() else { return }
                            await vm.signInWithApple(idToken: idToken, nonce: nonce)
                        }
                    }
                    .frame(height: 44)
                }

                if let error = vm.errorMessage {
                    Section {
                        Text(error).foregroundStyle(.red)
                    }
                }
            }
            .navigationTitle("Sign In")
            .toolbar {
                ToolbarItem(placement: .automatic) {
                    NavigationLink("Sign Up") {
                        SignUpView(vm: vm)
                    }
                }
            }
        }
    }
}

#Preview {
    SignInView(vm: AuthViewModel(service: PreviewAuthService()))
}
