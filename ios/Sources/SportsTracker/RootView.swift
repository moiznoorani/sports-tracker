import SwiftUI

public struct RootView: View {
    @State private var authVM = AuthViewModel()
    @State private var profileVM = ProfileViewModel()
    @State private var leagueVM = LeagueViewModel()
    @State private var tournamentVM = TournamentViewModel()

    public init() {}

    public var body: some View {
        switch authVM.state {
        case .loading:
            ZStack {
                AppTheme.backgroundGradient.ignoresSafeArea()
                ProgressView()
                    .tint(AppTheme.accentLight)
            }
            .task { await authVM.loadSession() }
        case .unauthenticated:
            NavigationStack {
                SignInView(vm: authVM)
            }
        case .authenticated(let session):
            MainTabView(
                authVM: authVM,
                profileVM: profileVM,
                leagueVM: leagueVM,
                tournamentVM: tournamentVM,
                userId: session.user.id.uuidString.lowercased()
            )
        }
    }
}

#Preview {
    RootView()
}
