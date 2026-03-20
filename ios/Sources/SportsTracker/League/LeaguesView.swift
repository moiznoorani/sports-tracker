import SwiftUI

public struct LeaguesView: View {
    @Bindable var vm: LeagueViewModel
    @State private var showCreate = false
    @State private var showJoin = false

    public init(vm: LeagueViewModel) {
        self.vm = vm
    }

    public var body: some View {
        NavigationStack {
            Group {
                if vm.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if !vm.leagues.isEmpty {
                    List(vm.leagues) { league in
                        NavigationLink(destination: LeagueDetailView(vm: vm, leagueId: league.id)) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(league.name)
                                    .font(.headline)
                                Text(league.sport.displayName)
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                } else {
                    ContentUnavailableView(
                        "No Leagues",
                        systemImage: "sportscourt",
                        description: Text("Create or join a League to get started.")
                    )
                }
            }
            .navigationTitle("My Leagues")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button("Create League", systemImage: "plus") {
                        showCreate = true
                    }
                }
                ToolbarItem(placement: .secondaryAction) {
                    Button("Join League", systemImage: "person.badge.plus") {
                        vm.errorMessage = nil
                        showJoin = true
                    }
                }
            }
            .sheet(isPresented: $showCreate) {
                CreateLeagueView(vm: vm, isPresented: $showCreate)
            }
            .sheet(isPresented: $showJoin) {
                JoinLeagueView(vm: vm, isPresented: $showJoin)
            }
            .task { await vm.loadLeagues() }
        }
    }
}
