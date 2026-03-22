import SwiftUI

public struct TournamentDetailView: View {
    @Bindable var vm: TournamentViewModel
    @State private var teamVM = TeamViewModel()
    @State private var myTeamId: String? = nil
    let tournamentId: String
    let leagueId: String
    let currentUserId: String
    let isOrganizer: Bool

    public init(vm: TournamentViewModel, tournamentId: String, leagueId: String,
                currentUserId: String = "", isOrganizer: Bool = false) {
        self.vm = vm
        self.tournamentId = tournamentId
        self.leagueId = leagueId
        self.currentUserId = currentUserId
        self.isOrganizer = isOrganizer
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
        .task {
            await vm.loadTournament(id: tournamentId)
            await teamVM.loadTeams(tournamentId: tournamentId)
            if !currentUserId.isEmpty {
                myTeamId = try? await RosterService(client: .shared)
                    .getMyTeamId(tournamentId: tournamentId, playerId: currentUserId)
            }
        }
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

                // Teams section
                GlassCard {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("TEAMS · \(teamVM.teams.count)")
                            .font(.system(size: 11, weight: .semibold))
                            .tracking(1.2)
                            .foregroundStyle(AppTheme.subtleText)

                        if teamVM.teams.isEmpty {
                            Text("No teams yet.")
                                .font(.system(size: 14))
                                .foregroundStyle(AppTheme.subtleText)
                        } else {
                            ForEach(teamVM.teams) { team in
                                NavigationLink(destination: TeamDetailView(
                                    teamVM: teamVM,
                                    teamId: team.id,
                                    tournamentId: t.id,
                                    leagueId: leagueId,
                                    isOrganizer: isOrganizer
                                )) {
                                    HStack {
                                        Text(team.name)
                                            .font(.system(size: 14, weight: .medium))
                                            .foregroundStyle(AppTheme.primaryText)
                                        Spacer()
                                        if myTeamId == team.id {
                                            GlassTag("Your Team", color: AppTheme.accentLight)
                                        }
                                        Image(systemName: "chevron.right")
                                            .font(.system(size: 11, weight: .semibold))
                                            .foregroundStyle(AppTheme.subtleText)
                                    }
                                    .padding(.vertical, 6)
                                    .padding(.horizontal, 10)
                                    .background(Color.white.opacity(0.03))
                                    .cornerRadius(8)
                                }
                                .buttonStyle(.plain)
                            }
                        }

                        if isOrganizer && t.status == .published {
                            HStack(spacing: 8) {
                                GlassTextField("Team name", text: $teamVM.newName)
                                Button {
                                    Task {
                                        await teamVM.createTeam(tournamentId: t.id, name: teamVM.newName)
                                    }
                                } label: {
                                    Text(teamVM.isCreating ? "…" : "Add")
                                        .font(.system(size: 14, weight: .semibold))
                                        .padding(.horizontal, 16)
                                        .padding(.vertical, 10)
                                }
                                .buttonStyle(PrimaryButtonStyle())
                                .disabled(teamVM.isCreating || teamVM.newName.trimmingCharacters(in: .whitespaces).isEmpty)
                            }
                        }

                        if let err = teamVM.errorMessage {
                            ErrorBanner(err)
                        }
                    }
                    .padding(18)
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
