import SwiftUI

public struct LeaguesView: View {
    @Bindable var vm: LeagueViewModel
    @State private var showCreate = false

    public init(vm: LeagueViewModel) {
        self.vm = vm
    }

    public var body: some View {
        NavigationStack {
            Group {
                if vm.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let error = vm.errorMessage {
                    ContentUnavailableView("Error", systemImage: "exclamationmark.triangle", description: Text(error))
                } else if vm.leagues.isEmpty {
                    ContentUnavailableView(
                        "No Leagues",
                        systemImage: "sportscourt",
                        description: Text("Create a League to get started.")
                    )
                } else {
                    List(vm.leagues) { league in
                        VStack(alignment: .leading, spacing: 4) {
                            Text(league.name)
                                .font(.headline)
                            Text(league.sport.displayName)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
            .navigationTitle("My Leagues")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button("Create League", systemImage: "plus") {
                        showCreate = true
                    }
                }
            }
            .sheet(isPresented: $showCreate) {
                CreateLeagueView(vm: vm, isPresented: $showCreate)
            }
            .task { await vm.loadLeagues() }
        }
    }
}
