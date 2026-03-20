import SwiftUI

public struct LeagueDetailView: View {
    @Bindable var vm: LeagueViewModel
    let leagueId: String
    @State private var copied = false

    public init(vm: LeagueViewModel, leagueId: String) {
        self.vm = vm
        self.leagueId = leagueId
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
        .task { await vm.loadLeague(id: leagueId) }
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
                    GlassCard {
                        VStack(alignment: .leading, spacing: 14) {
                            Text("INVITE LINK")
                                .font(.system(size: 11, weight: .semibold))
                                .tracking(1.2)
                                .foregroundStyle(AppTheme.subtleText)

                            let link = inviteLink(token: token)
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

    private func inviteLink(token: String) -> String {
        "https://sportsapp.example.com/leagues/join/\(token)"
    }
}
