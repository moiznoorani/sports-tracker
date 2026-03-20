import SwiftUI

public struct CreateLeagueView: View {
    @Bindable var vm: LeagueViewModel
    @Binding var isPresented: Bool

    @State private var name = ""
    @State private var sport: Sport = .ultimateFrisbee
    @State private var visibility: Visibility = .private
    @State private var submitting = false

    public init(vm: LeagueViewModel, isPresented: Binding<Bool>) {
        self.vm = vm
        self._isPresented = isPresented
    }

    public var body: some View {
        NavigationStack {
            Form {
                Section("League Details") {
                    TextField("League Name", text: $name)

                    Picker("Sport", selection: $sport) {
                        ForEach(Sport.allCases, id: \.self) { s in
                            Text(s.displayName).tag(s)
                        }
                    }

                    Picker("Visibility", selection: $visibility) {
                        ForEach(Visibility.allCases, id: \.self) { v in
                            Text(v.displayName).tag(v)
                        }
                    }
                }

                if let error = vm.errorMessage {
                    Section {
                        Text(error)
                            .foregroundStyle(.red)
                    }
                }
            }
            .navigationTitle("Create League")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { isPresented = false }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Create") {
                        submitting = true
                        Task {
                            await vm.createLeague(name: name, sport: sport, visibility: visibility)
                            if vm.errorMessage == nil { isPresented = false }
                            submitting = false
                        }
                    }
                    .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty || submitting)
                }
            }
        }
    }
}
