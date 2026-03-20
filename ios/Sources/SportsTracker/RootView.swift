import SwiftUI

public struct RootView: View {
    @State private var authVM = AuthViewModel()
    @State private var profileVM = ProfileViewModel()
    @State private var leagueVM = LeagueViewModel()

    public init() {}

    public var body: some View {
        switch authVM.state {
        case .loading:
            ProgressView()
                .task { await authVM.loadSession() }
        case .unauthenticated:
            SignInView(vm: authVM)
        case .authenticated(let session):
            MainTabView(
                authVM: authVM,
                profileVM: profileVM,
                leagueVM: leagueVM,
                userId: session.user.id.uuidString
            )
        }
    }
}

#Preview {
    RootView()
}
