import SwiftUI

public struct MainTabView: View {
    @Bindable var authVM: AuthViewModel
    @Bindable var profileVM: ProfileViewModel
    @Bindable var leagueVM: LeagueViewModel
    let userId: String

    init(authVM: AuthViewModel, profileVM: ProfileViewModel, leagueVM: LeagueViewModel, userId: String) {
        self.authVM = authVM
        self.profileVM = profileVM
        self.leagueVM = leagueVM
        self.userId = userId
    }

    public var body: some View {
        TabView {
            Tab("Leagues", systemImage: "sportscourt") {
                LeaguesView(vm: leagueVM)
            }

            Tab("Profile", systemImage: "person.circle") {
                NavigationStack {
                    ProfileView(vm: profileVM, userId: userId)
                }
            }

            Tab("Settings", systemImage: "gearshape") {
                NavigationStack {
                    List {
                        Button("Sign Out", role: .destructive) {
                            Task { await authVM.signOut() }
                        }
                    }
                    .navigationTitle("Settings")
                }
            }
        }
    }
}
