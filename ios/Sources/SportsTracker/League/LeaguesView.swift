import SwiftUI

public struct LeaguesView: View {
    @Bindable var vm: LeagueViewModel
    let userId: String
    @State private var showCreate = false
    @State private var showJoin = false

    public init(vm: LeagueViewModel, userId: String = "") {
        self.vm = vm
        self.userId = userId
    }

    public var body: some View {
        NavigationStack {
            Group {
                if vm.isLoading {
                    ProgressView()
                        .tint(AppTheme.accentLight)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(AppTheme.backgroundGradient.ignoresSafeArea())
                } else if !vm.leagues.isEmpty {
                    leagueList
                } else {
                    emptyState
                }
            }
            .navigationTitle("My Leagues")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button("Create League", systemImage: "plus") {
                        showCreate = true
                    }
                    .tint(AppTheme.accentLight)
                }
                ToolbarItem(placement: .secondaryAction) {
                    Button("Join League", systemImage: "person.badge.plus") {
                        vm.errorMessage = nil
                        showJoin = true
                    }
                    .tint(AppTheme.accentLight)
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

    private var leagueList: some View {
        ScrollView {
            VStack(spacing: 10) {
                ForEach(vm.leagues) { league in
                    NavigationLink(destination: LeagueDetailView(vm: vm, leagueId: league.id, currentUserId: userId)) {
                        GlassCard(cornerRadius: 16) {
                            HStack(spacing: 14) {
                                RoundedRectangle(cornerRadius: 12, style: .continuous)
                                    .fill(AppTheme.accent.opacity(0.2))
                                    .frame(width: 46, height: 46)
                                    .overlay(
                                        Image(systemName: "sportscourt")
                                            .font(.system(size: 18))
                                            .foregroundStyle(AppTheme.accentLight)
                                    )

                                VStack(alignment: .leading, spacing: 4) {
                                    Text(league.name)
                                        .font(.system(size: 16, weight: .semibold))
                                        .foregroundStyle(AppTheme.primaryText)
                                        .lineLimit(1)
                                    HStack(spacing: 6) {
                                        GlassTag(league.sport.displayName)
                                        GlassTag(league.visibility.displayName,
                                                 color: league.visibility == .private ? AppTheme.subtleText : AppTheme.accentLight)
                                    }
                                }

                                Spacer()

                                Image(systemName: "chevron.right")
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundStyle(AppTheme.subtleText)
                            }
                            .padding(16)
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
        }
        .background(AppTheme.backgroundGradient.ignoresSafeArea())
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "sportscourt")
                .font(.system(size: 48))
                .foregroundStyle(AppTheme.accent.opacity(0.5))
            Text("No Leagues Yet")
                .font(.title3)
                .fontWeight(.semibold)
                .foregroundStyle(AppTheme.primaryText)
            Text("Create or join a league to get started.")
                .font(.subheadline)
                .foregroundStyle(AppTheme.subtleText)
                .multilineTextAlignment(.center)
            Button("Create a League") { showCreate = true }
                .buttonStyle(PrimaryButtonStyle())
                .frame(maxWidth: 240)
                .padding(.top, 8)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(32)
        .background(AppTheme.backgroundGradient.ignoresSafeArea())
    }
}
