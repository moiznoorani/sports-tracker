import SwiftUI

public struct LeagueDetailView: View {
    @Bindable var vm: LeagueViewModel
    @Bindable var tournamentVM: TournamentViewModel
    let leagueId: String
    let currentUserId: String
    @State private var copied = false

    public init(vm: LeagueViewModel, tournamentVM: TournamentViewModel = TournamentViewModel(),
                leagueId: String, currentUserId: String = "") {
        self.vm = vm
        self.tournamentVM = tournamentVM
        self.leagueId = leagueId
        self.currentUserId = currentUserId
    }

    private var isOrganizer: Bool {
        vm.members.first(where: { $0.userId == currentUserId })?.isOrganizer ?? false
    }

    public var body: some View {
        Group {
            if let error = vm.errorMessage {
                VStack(spacing: 16) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.largeTitle)
                        .foregroundStyle(AppTheme.errorColor)
                    ErrorBanner(error)
                        .padding(.horizontal, 20)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(AppTheme.backgroundGradient.ignoresSafeArea())
            } else if let league = vm.selectedLeague {
                leagueDetail(league)
            } else {
                ProgressView()
                    .tint(AppTheme.accentLight)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(AppTheme.backgroundGradient.ignoresSafeArea())
            }
        }
        .task {
            await vm.loadLeague(id: leagueId)
            await vm.loadMembers(leagueId: leagueId)
            await tournamentVM.loadTournaments(leagueId: leagueId)
        }
    }

    private func leagueDetail(_ league: League) -> some View {
        ScrollView {
            VStack(spacing: 16) {
                // Header card
                GlassCard {
                    HStack(spacing: 16) {
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .fill(AppTheme.accentGradient.opacity(0.5))
                            .frame(width: 60, height: 60)
                            .overlay(
                                Image(systemName: "sportscourt")
                                    .font(.system(size: 24))
                                    .foregroundStyle(.white)
                            )

                        VStack(alignment: .leading, spacing: 6) {
                            Text(league.name)
                                .font(.system(size: 20, weight: .bold))
                                .foregroundStyle(AppTheme.primaryText)
                                .lineLimit(2)
                            HStack(spacing: 6) {
                                GlassTag(league.sport.displayName)
                                GlassTag(league.visibility.displayName,
                                         color: league.visibility == .private ? AppTheme.subtleText : AppTheme.accentLight)
                            }
                        }
                        Spacer()
                    }
                    .padding(18)
                }

                // Invite link card
                if let token = league.inviteToken {
                    inviteLinkCard(token: token)
                }

                // Tournaments section
                TournamentsSection(
                    vm: tournamentVM,
                    leagueId: leagueId,
                    isOrganizer: isOrganizer,
                    currentUserId: currentUserId
                )

                // Members card
                membersCard
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
        }
        .navigationTitle(league.name)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .background(AppTheme.backgroundGradient.ignoresSafeArea())
    }

    private func inviteLinkCard(token: String) -> some View {
        let link = inviteLink(token: token)
        return GlassCard {
            VStack(alignment: .leading, spacing: 14) {
                Text("INVITE LINK")
                    .font(.system(size: 11, weight: .semibold))
                    .tracking(1.2)
                    .foregroundStyle(AppTheme.subtleText)

                Text(link)
                    .font(.system(size: 12, design: .monospaced))
                    .foregroundStyle(AppTheme.secondaryText)
                    .lineLimit(2)
                    .textSelection(.enabled)
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background {
                        RoundedRectangle(cornerRadius: 10, style: .continuous)
                            .fill(Color.white.opacity(0.04))
                            .overlay(
                                RoundedRectangle(cornerRadius: 10, style: .continuous)
                                    .strokeBorder(Color.white.opacity(0.08), lineWidth: 0.5)
                            )
                    }

                Button(copied ? "✓ Copied!" : "Copy Link") {
                    #if os(iOS)
                    UIPasteboard.general.string = link
                    #endif
                    copied = true
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) { copied = false }
                }
                .buttonStyle(GlassButtonStyle())

                Text("Share this link to invite players to join your league.")
                    .font(.caption)
                    .foregroundStyle(AppTheme.subtleText)
            }
            .padding(18)
        }
    }

    private var membersCard: some View {
        GlassCard {
            VStack(alignment: .leading, spacing: 14) {
                Text("MEMBERS · \(vm.members.count)")
                    .font(.system(size: 11, weight: .semibold))
                    .tracking(1.2)
                    .foregroundStyle(AppTheme.subtleText)

                ForEach(vm.members, id: \.userId) { member in
                    HStack(spacing: 12) {
                        RoundedRectangle(cornerRadius: 10, style: .continuous)
                            .fill(AppTheme.accent.opacity(0.2))
                            .frame(width: 36, height: 36)
                            .overlay(
                                Text(String((member.displayName ?? "?").prefix(1)).uppercased())
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundStyle(AppTheme.accentLight)
                            )

                        VStack(alignment: .leading, spacing: 2) {
                            Text(member.displayName ?? "Unknown")
                                .font(.system(size: 15, weight: .medium))
                                .foregroundStyle(AppTheme.primaryText)
                                .lineLimit(1)
                            if member.isOrganizer {
                                Text("Organizer")
                                    .font(.caption2)
                                    .foregroundStyle(AppTheme.accentLight)
                            }
                        }

                        Spacer()

                        if isOrganizer && !member.isOrganizer {
                            Button("Remove") {
                                Task {
                                    await vm.removeMember(
                                        leagueId: leagueId,
                                        userId: member.userId
                                    )
                                }
                            }
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundStyle(AppTheme.errorColor)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background {
                                Capsule()
                                    .fill(AppTheme.errorColor.opacity(0.12))
                            }
                        }
                    }
                }
            }
            .padding(18)
        }
    }

    private func inviteLink(token: String) -> String {
        "https://sportsapp.example.com/leagues/join/\(token)"
    }
}
