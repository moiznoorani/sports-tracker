import SwiftUI

public struct TournamentDetailView: View {
    @Bindable var vm: TournamentViewModel
    let tournamentId: String
    let leagueId: String
    let currentUserId: String

    public init(vm: TournamentViewModel, tournamentId: String, leagueId: String, currentUserId: String = "") {
        self.vm = vm
        self.tournamentId = tournamentId
        self.leagueId = leagueId
        self.currentUserId = currentUserId
    }

    private var isCreator: Bool {
        vm.selectedTournament?.createdBy == currentUserId
    }

    public var body: some View {
        Group {
            if let error = vm.errorMessage {
                VStack(spacing: 16) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.largeTitle)
                        .foregroundStyle(AppTheme.errorColor)
                    ErrorBanner(error).padding(.horizontal, 20)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(AppTheme.backgroundGradient.ignoresSafeArea())
            } else if let t = vm.selectedTournament {
                detail(t)
            } else {
                ProgressView()
                    .tint(AppTheme.accentLight)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(AppTheme.backgroundGradient.ignoresSafeArea())
            }
        }
        .task { await vm.loadTournament(id: tournamentId) }
    }

    private func detail(_ t: Tournament) -> some View {
        ScrollView {
            VStack(spacing: 16) {
                // Header
                GlassCard {
                    HStack(spacing: 16) {
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .fill(AppTheme.accentGradient.opacity(0.5))
                            .frame(width: 60, height: 60)
                            .overlay(
                                Image(systemName: "trophy")
                                    .font(.system(size: 24))
                                    .foregroundStyle(.white)
                            )
                        VStack(alignment: .leading, spacing: 6) {
                            Text(t.name)
                                .font(.system(size: 20, weight: .bold))
                                .foregroundStyle(AppTheme.primaryText)
                                .lineLimit(2)
                            HStack(spacing: 6) {
                                GlassTag(t.format.displayName)
                                GlassTag(t.sport.displayName)
                                GlassTag(t.status.displayName,
                                         color: t.status == .published ? AppTheme.accentLight : AppTheme.subtleText)
                            }
                        }
                        Spacer()
                    }
                    .padding(18)
                }

                // Dates
                GlassCard {
                    VStack(alignment: .leading, spacing: 14) {
                        Text("DATES")
                            .font(.system(size: 11, weight: .semibold))
                            .tracking(1.2)
                            .foregroundStyle(AppTheme.subtleText)
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Start").font(.caption).foregroundStyle(AppTheme.subtleText)
                                Text(t.startDate).font(.system(size: 15, weight: .medium)).foregroundStyle(AppTheme.primaryText)
                            }
                            Spacer()
                            Image(systemName: "arrow.right").foregroundStyle(AppTheme.subtleText)
                            Spacer()
                            VStack(alignment: .trailing, spacing: 4) {
                                Text("End").font(.caption).foregroundStyle(AppTheme.subtleText)
                                Text(t.endDate).font(.system(size: 15, weight: .medium)).foregroundStyle(AppTheme.primaryText)
                            }
                        }
                    }
                    .padding(18)
                }

                // Publish (creator only, draft only)
                if isCreator && t.status == .draft {
                    Button {
                        Task { await vm.publishTournament(id: t.id, leagueId: leagueId) }
                    } label: {
                        Text("Publish Tournament")
                            .font(.system(size: 16, weight: .semibold))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                    }
                    .buttonStyle(PrimaryButtonStyle())
                }

                // Edit (creator only)
                if isCreator {
                    NavigationLink(destination: EditTournamentView(vm: vm, tournament: t, leagueId: leagueId)) {
                        HStack {
                            Image(systemName: "pencil")
                            Text("Edit Tournament")
                                .font(.system(size: 15, weight: .semibold))
                        }
                        .foregroundStyle(AppTheme.accentLight)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                    }
                    .buttonStyle(GlassButtonStyle())
                    .padding(.horizontal, 0)
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
        }
        .navigationTitle(t.name)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .background(AppTheme.backgroundGradient.ignoresSafeArea())
    }
}
