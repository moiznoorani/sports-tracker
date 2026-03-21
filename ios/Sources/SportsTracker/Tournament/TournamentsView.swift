import SwiftUI

/// Embeddable list of tournaments within a league detail screen.
public struct TournamentsSection: View {
    @Bindable var vm: TournamentViewModel
    let leagueId: String
    let isOrganizer: Bool
    let currentUserId: String

    public init(vm: TournamentViewModel, leagueId: String, isOrganizer: Bool, currentUserId: String = "") {
        self.vm = vm
        self.leagueId = leagueId
        self.isOrganizer = isOrganizer
        self.currentUserId = currentUserId
    }

    public var body: some View {
        GlassCard {
            VStack(alignment: .leading, spacing: 14) {
                HStack {
                    Text("TOURNAMENTS · \(vm.tournaments.count)")
                        .font(.system(size: 11, weight: .semibold))
                        .tracking(1.2)
                        .foregroundStyle(AppTheme.subtleText)

                    Spacer()

                    if isOrganizer {
                        NavigationLink(destination: CreateTournamentView(vm: vm, leagueId: leagueId)) {
                            Image(systemName: "plus")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundStyle(AppTheme.accentLight)
                        }
                    }
                }

                if vm.tournaments.isEmpty {
                    Text("No tournaments yet.")
                        .font(.subheadline)
                        .foregroundStyle(AppTheme.subtleText)
                } else {
                    ForEach(vm.tournaments) { tournament in
                        NavigationLink(destination: TournamentDetailView(vm: vm, tournamentId: tournament.id, leagueId: leagueId, currentUserId: currentUserId)) {
                            tournamentRow(tournament)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(18)
        }
    }

    private func tournamentRow(_ t: Tournament) -> some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 6) {
                Text(t.name)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundStyle(AppTheme.primaryText)
                    .lineLimit(1)
                HStack(spacing: 6) {
                    GlassTag(t.format.displayName)
                    GlassTag(t.sport.displayName)
                    GlassTag(t.status.displayName,
                             color: t.status == .published ? AppTheme.accentLight : AppTheme.subtleText)
                }
            }
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(AppTheme.subtleText)
        }
    }
}
