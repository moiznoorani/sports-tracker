import SwiftUI

public struct MainTabView: View {
    @Bindable var authVM: AuthViewModel
    @Bindable var profileVM: ProfileViewModel
    let userId: String

    init(authVM: AuthViewModel, profileVM: ProfileViewModel, userId: String) {
        self.authVM = authVM
        self.profileVM = profileVM
        self.userId = userId
    }

    public var body: some View {
        TabView {
            Tab("Dashboard", systemImage: "house") {
                NavigationStack {
                    Text("Dashboard")
                        .navigationTitle("Dashboard")
                        .toolbar {
                            ToolbarItem(placement: .automatic) {
                                Button("Sign Out") {
                                    Task { await authVM.signOut() }
                                }
                            }
                        }
                }
            }

            Tab("Profile", systemImage: "person.circle") {
                NavigationStack {
                    ProfileView(vm: profileVM, userId: userId)
                }
            }
        }
    }
}
