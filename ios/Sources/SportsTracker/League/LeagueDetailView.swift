import SwiftUI

public struct LeagueDetailView: View {
    @Bindable var vm: LeagueViewModel
    let leagueId: String

    public init(vm: LeagueViewModel, leagueId: String) {
        self.vm = vm
        self.leagueId = leagueId
    }

    public var body: some View {
        Group {
            if let error = vm.errorMessage {
                ContentUnavailableView("Error", systemImage: "exclamationmark.triangle", description: Text(error))
            } else if let league = vm.selectedLeague {
                Form {
                    Section("League") {
                        LabeledContent("Name", value: league.name)
                        LabeledContent("Sport", value: league.sport.displayName)
                        LabeledContent("Visibility", value: league.visibility.displayName)
                    }

                    if let token = league.inviteToken {
                        Section("Invite Link") {
                            let link = inviteLink(token: token)
                            LabeledContent("Link") {
                                Text(link)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                    .textSelection(.enabled)
                            }
                            Button("Copy Link") {
                                #if os(iOS)
                                UIPasteboard.general.string = link
                                #endif
                            }
                        }
                    }
                }
                .navigationTitle(league.name)
                #if os(iOS)
                .navigationBarTitleDisplayMode(.inline)
                #endif
            } else {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .task { await vm.loadLeague(id: leagueId) }
    }

    private func inviteLink(token: String) -> String {
        "https://sportsapp.example.com/leagues/join/\(token)"
    }
}
