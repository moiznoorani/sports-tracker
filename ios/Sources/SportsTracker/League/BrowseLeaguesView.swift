import SwiftUI

public struct BrowseLeaguesView: View {
    @Bindable var vm: LeagueViewModel
    let currentUserId: String

    public init(vm: LeagueViewModel, currentUserId: String = "") {
        self.vm = vm
        self.currentUserId = currentUserId
    }

    private var myLeagueIds: Set<String> {
        Set(vm.leagues.map(\.id))
    }

    public var body: some View {
        NavigationStack {
            Group {
                if vm.isLoading {
                    ProgressView()
                        .tint(AppTheme.accentLight)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(AppTheme.backgroundGradient.ignoresSafeArea())
                } else if vm.publicLeagues.isEmpty {
                    emptyState
                } else {
                    leagueList
                }
            }
            .navigationTitle("Browse Leagues")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.large)
            #endif
            .safeAreaInset(edge: .top) {
                if let error = vm.errorMessage {
                    ErrorBanner(error)
                        .padding(.horizontal, 20)
                        .padding(.top, 8)
                }
            }
            .background(AppTheme.backgroundGradient.ignoresSafeArea())
            .task {
                await vm.loadLeagues()
                await vm.browseLeagues()
            }
        }
    }

    private var leagueList: some View {
        ScrollView {
            VStack(spacing: 10) {
                ForEach(vm.publicLeagues) { league in
                    let isMember = myLeagueIds.contains(league.id)
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
                                    GlassTag("\(league.memberCount) member\(league.memberCount != 1 ? "s" : "")",
                                             color: AppTheme.subtleText)
                                }
                            }

                            Spacer()

                            if isMember {
                                GlassTag("Joined", color: AppTheme.accentLight)
                            } else {
                                Button("Join") {
                                    Task { await vm.joinLeague(leagueId: league.id) }
                                }
                                .buttonStyle(GlassButtonStyle())
                                .font(.system(size: 13, weight: .semibold))
                            }
                        }
                        .padding(16)
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
            Image(systemName: "magnifyingglass")
                .font(.system(size: 48))
                .foregroundStyle(AppTheme.accent.opacity(0.5))
            Text("No Public Leagues")
                .font(.title3)
                .fontWeight(.semibold)
                .foregroundStyle(AppTheme.primaryText)
            Text("Public leagues created by organizers will appear here.")
                .font(.subheadline)
                .foregroundStyle(AppTheme.subtleText)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(32)
        .background(AppTheme.backgroundGradient.ignoresSafeArea())
    }
}
