import SwiftUI

public struct TeamDetailView: View {
    @Bindable var teamVM: TeamViewModel
    @State private var rosterVM = RosterViewModel()
    @State private var leagueMembers: [LeagueMember] = []
    let teamId: String
    let tournamentId: String
    let leagueId: String
    let isOrganizer: Bool

    public init(teamVM: TeamViewModel, teamId: String, tournamentId: String,
                leagueId: String, isOrganizer: Bool = false) {
        self.teamVM = teamVM
        self.teamId = teamId
        self.tournamentId = tournamentId
        self.leagueId = leagueId
        self.isOrganizer = isOrganizer
    }

    private var team: Team? { teamVM.teams.first(where: { $0.id == teamId }) }

    public var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                rosterCard
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
        }
        .navigationTitle(team?.name ?? "Team")
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .background(AppTheme.backgroundGradient.ignoresSafeArea())
        .task {
            await rosterVM.loadRoster(teamId: teamId)
            leagueMembers = (try? await LeagueService(client: .shared).getMembers(leagueId: leagueId)) ?? []
        }
    }

    private var rosterCard: some View {
        GlassCard {
            VStack(alignment: .leading, spacing: 12) {
                Text("ROSTER · \(rosterVM.roster.count)")
                    .font(.system(size: 11, weight: .semibold))
                    .tracking(1.2)
                    .foregroundStyle(AppTheme.subtleText)

                if rosterVM.roster.isEmpty {
                    Text("No players yet.")
                        .font(.system(size: 14))
                        .foregroundStyle(AppTheme.subtleText)
                } else {
                    ForEach(rosterVM.roster) { player in
                        playerRow(player)
                    }
                }

                if isOrganizer {
                    assignSection
                }

                if let err = rosterVM.errorMessage {
                    ErrorBanner(err)
                }
            }
            .padding(18)
        }
    }

    private func playerRow(_ player: RosterPlayer) -> some View {
        HStack(spacing: 10) {
            Text(String((player.displayName ?? "?").prefix(1)).uppercased())
                .font(.system(size: 13, weight: .bold))
                .frame(width: 32, height: 32)
                .background(AppTheme.accentGradient.opacity(0.3))
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .foregroundStyle(.white)

            Text(player.displayName
                ?? leagueMembers.first(where: { $0.userId == player.playerId })?.displayName
                ?? player.playerId)
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(AppTheme.primaryText)

            Spacer()

            if team?.captainId == player.playerId {
                GlassTag("Captain", color: AppTheme.accentLight)
            } else if isOrganizer {
                Button("Set Captain") {
                    Task { await rosterVM.setCaptain(teamId: teamId, captainId: player.playerId) }
                }
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(AppTheme.accentLight)
                .buttonStyle(.plain)
            }

            if isOrganizer {
                Button("Remove") {
                    Task { await rosterVM.removePlayer(id: player.id, teamId: teamId) }
                }
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(AppTheme.errorColor)
                .buttonStyle(.plain)
            }
        }
        .padding(.vertical, 4)
    }

    private var unassignedMembers: [LeagueMember] {
        let assigned = Set(rosterVM.roster.map(\.playerId))
        return leagueMembers.filter { !$0.isOrganizer && !assigned.contains($0.userId) }
    }

    private var assignSection: some View {
        Group {
            if !unassignedMembers.isEmpty {
                HStack(spacing: 8) {
                    Picker("Add player", selection: $rosterVM.selectedPlayerId) {
                        Text("Select player…").tag("")
                        ForEach(unassignedMembers, id: \.userId) { m in
                            Text(m.displayName ?? m.userId).tag(m.userId)
                        }
                    }
                    .pickerStyle(.menu)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(Color.white.opacity(0.04))
                    .cornerRadius(10)
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.white.opacity(0.08), lineWidth: 0.5))

                    Button {
                        guard !rosterVM.selectedPlayerId.isEmpty else { return }
                        Task {
                            await rosterVM.assignPlayer(teamId: teamId, tournamentId: tournamentId,
                                                        playerId: rosterVM.selectedPlayerId)
                        }
                    } label: {
                        Text(rosterVM.isAssigning ? "…" : "Add")
                            .font(.system(size: 14, weight: .semibold))
                            .padding(.horizontal, 16)
                            .padding(.vertical, 10)
                    }
                    .buttonStyle(PrimaryButtonStyle())
                    .disabled(rosterVM.isAssigning || rosterVM.selectedPlayerId.isEmpty)
                }
            }
        }
    }
}
