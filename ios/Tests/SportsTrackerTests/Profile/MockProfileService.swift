import Foundation
@testable import SportsTracker

final class MockProfileService: ProfileServiceProtocol, @unchecked Sendable {
    var stubbedProfile: UserProfile? = nil
    var shouldThrow: Error? = nil

    var getProfileCalled = false
    var updateDisplayNameCalled = false
    var updatePrivacyCalled = false
    var uploadAvatarCalled = false

    var lastUserId: String?
    var lastDisplayName: String?
    var lastPrivacy: PrivacySetting?
    var lastAvatarData: Data?

    func getProfile(userId: String) async throws -> UserProfile? {
        getProfileCalled = true
        lastUserId = userId
        if let error = shouldThrow { throw error }
        return stubbedProfile
    }

    func updateDisplayName(userId: String, displayName: String) async throws {
        updateDisplayNameCalled = true
        lastUserId = userId
        lastDisplayName = displayName
        if let error = shouldThrow { throw error }
    }

    func updatePrivacy(userId: String, privacy: PrivacySetting) async throws {
        updatePrivacyCalled = true
        lastUserId = userId
        lastPrivacy = privacy
        if let error = shouldThrow { throw error }
    }

    func uploadAvatar(userId: String, data: Data, fileExtension: String) async throws -> String {
        uploadAvatarCalled = true
        lastUserId = userId
        lastAvatarData = data
        if let error = shouldThrow { throw error }
        return "https://example.com/avatar.png"
    }
}
