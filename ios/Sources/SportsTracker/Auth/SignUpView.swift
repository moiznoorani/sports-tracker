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
        Form {
            Section {
                TextField("Email", text: $email)
                    .textContentType(.emailAddress)
                    .autocorrectionDisabled()
                SecureField("Password", text: $password)
                    .textContentType(.newPassword)
            }

            Section {
                Button("Create Account") {
                    Task {
                        await vm.signUp(email: email, password: password)
                        if vm.errorMessage == nil { confirmed = true }
                    }
                }
                .disabled(email.isEmpty || password.isEmpty)
            }

            if let error = vm.errorMessage {
                Section {
                    Text(error).foregroundStyle(.red)
                }
            }
        }
        .navigationTitle("Sign Up")
        .alert("Check your email", isPresented: $confirmed) {
            Button("OK") { dismiss() }
        } message: {
            Text("We sent a confirmation link to \(email).")
        }
    }
}

#Preview {
    NavigationStack {
        SignUpView(vm: AuthViewModel(service: PreviewAuthService()))
    }
}
