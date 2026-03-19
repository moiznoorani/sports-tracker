import Foundation
import Supabase

// MARK: - Auth preview stub

final class PreviewAuthService: AuthServiceProtocol, @unchecked Sendable {
    var currentSession: Session? { get async { nil } }
    func signUp(email: String, password: String) async throws {}
    func signIn(email: String, password: String) async throws {}
    func signInWithApple(idToken: String, nonce: String) async throws {}
    func signOut() async throws {}
    func resetPassword(email: String) async throws {}
    func updatePassword(_ newPassword: String) async throws {}
}

// MARK: - Profile preview stub

final class PreviewProfileService: ProfileServiceProtocol, @unchecked Sendable {
    func getProfile(userId: String) async throws -> UserProfile? {
        UserProfile(id: userId, displayName: "Preview User", avatarURL: nil, privacySetting: .private)
    }
    func updateDisplayName(userId: String, displayName: String) async throws {}
    func updatePrivacy(userId: String, privacy: PrivacySetting) async throws {}
    func uploadAvatar(userId: String, data: Data, fileExtension: String) async throws -> String {
        "https://example.com/avatar.png"
    }
}
