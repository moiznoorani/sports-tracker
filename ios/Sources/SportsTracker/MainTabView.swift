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
                    ZStack {
                        AppTheme.backgroundGradient.ignoresSafeArea()
                        VStack(spacing: 16) {
                            Spacer()
                            GlassCard {
                                Button(role: .destructive) {
                                    Task { await authVM.signOut() }
                                } label: {
                                    HStack {
                                        Image(systemName: "arrow.right.square")
                                        Text("Sign Out")
                                    }
                                    .font(.system(size: 16, weight: .semibold))
                                    .foregroundStyle(AppTheme.errorColor)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 4)
                                }
                                .padding(20)
                            }
                            .padding(.horizontal, 20)
                            Spacer()
                        }
                    }
                    .navigationTitle("Settings")
                    #if os(iOS)
                    .navigationBarTitleDisplayMode(.large)
                    #endif
                }
            }
        }
        .tint(AppTheme.accentLight)
    }
}
