import SwiftUI

public struct JoinLeagueView: View {
    @Bindable var vm: LeagueViewModel
    @Binding var isPresented: Bool

    public init(vm: LeagueViewModel, isPresented: Binding<Bool>) {
        self.vm = vm
        self._isPresented = isPresented
    }

    public var body: some View {
        NavigationStack {
            Form {
                Section("Invite Token") {
                    TextField("Paste token or link", text: $vm.joinToken)
                        .autocorrectionDisabled()
                        #if os(iOS)
                        .textInputAutocapitalization(.never)
                        #endif
                }

                if let error = vm.errorMessage {
                    Section {
                        Text(error)
                            .foregroundStyle(.red)
                    }
                }
            }
            .navigationTitle("Join League")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { isPresented = false }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Join") {
                        Task {
                            await vm.joinByToken()
                            if vm.joinSuccess { isPresented = false }
                        }
                    }
                    .disabled(vm.joinToken.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
        .onDisappear {
            vm.joinToken = ""
            vm.joinSuccess = false
        }
    }
}
