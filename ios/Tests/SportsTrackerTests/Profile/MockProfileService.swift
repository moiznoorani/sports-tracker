import Foundation
@testable import SportsTracker

final class MockProfileService: ProfileServiceProtocol, @unchecked Sendable {
    var stubbedProfile: UserProfile?
    var shouldThrow: Error?
    var uploadedAvatarUrl = "https://example.com/avatar.png"

    var getProfileCalled = false
    var updateDisplayNameCalled = false
    var updatePrivacyCalled = false
    var uploadAvatarCalled = false

    var lastDisplayName: String?
    var lastPrivacy: UserProfile.PrivacySetting?
    var lastAvatarData: Data?
    var lastUserId: UUID?

    func getProfile(userId: UUID) async throws -> UserProfile {
        getProfileCalled = true
        lastUserId = userId
        if let error = shouldThrow { throw error }
        return stubbedProfile ?? UserProfile(
            id: userId,
            displayName: nil,
            avatarUrl: nil,
            privacySetting: .private
        )
    }

    func updateDisplayName(_ name: String, userId: UUID) async throws {
        updateDisplayNameCalled = true
        lastDisplayName = name
        lastUserId = userId
        if let error = shouldThrow { throw error }
    }

    func updatePrivacy(_ setting: UserProfile.PrivacySetting, userId: UUID) async throws {
        updatePrivacyCalled = true
        lastPrivacy = setting
        lastUserId = userId
        if let error = shouldThrow { throw error }
    }

    func uploadAvatar(data: Data, fileName: String, userId: UUID) async throws -> String {
        uploadAvatarCalled = true
        lastAvatarData = data
        lastUserId = userId
        if let error = shouldThrow { throw error }
        return uploadedAvatarUrl
    }
}
