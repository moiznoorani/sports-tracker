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
        Form {
            Section {
                TextField("Email", text: $email)
                    .textContentType(.emailAddress)
                    .autocorrectionDisabled()
            }

            Section {
                Button("Send Reset Link") {
                    Task {
                        let ok = await vm.resetPassword(email: email)
                        if ok { sent = true }
                    }
                }
                .disabled(email.isEmpty)
            }

            if let error = vm.errorMessage {
                Section {
                    Text(error).foregroundStyle(.red)
                }
            }
        }
        .navigationTitle("Reset Password")
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
