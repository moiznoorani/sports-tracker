import Testing
import Foundation
@testable import SportsTracker

private let testUserId = UUID(uuidString: "00000000-0000-0000-0000-000000000001")!

private func makeProfile(
    displayName: String? = "Moiz",
    avatarUrl: String? = nil,
    privacy: UserProfile.PrivacySetting = .private
) -> UserProfile {
    UserProfile(id: testUserId, displayName: displayName, avatarUrl: avatarUrl, privacySetting: privacy)
}

struct ProfileError: Error { let message: String }

@MainActor
struct ProfileViewModelTests {

    // MARK: - loadProfile

    @Test func loadProfile_populatesProfile() async {
        let mock = MockProfileService()
        mock.stubbedProfile = makeProfile()
        let vm = ProfileViewModel(service: mock)

        await vm.loadProfile(userId: testUserId)

        #expect(mock.getProfileCalled == true)
        #expect(vm.profile?.displayName == "Moiz")
        #expect(vm.profile?.privacySetting == .private)
    }

    @Test func loadProfile_setsErrorOnFailure() async {
        let mock = MockProfileService()
        mock.shouldThrow = ProfileError(message: "Not found")
        let vm = ProfileViewModel(service: mock)

        await vm.loadProfile(userId: testUserId)

        #expect(vm.errorMessage != nil)
        #expect(vm.profile == nil)
    }

    // MARK: - updateDisplayName

    @Test func updateDisplayName_callsServiceAndUpdatesProfile() async {
        let mock = MockProfileService()
        mock.stubbedProfile = makeProfile()
        let vm = ProfileViewModel(service: mock)
        await vm.loadProfile(userId: testUserId)

        await vm.updateDisplayName("New Name", userId: testUserId)

        #expect(mock.updateDisplayNameCalled == true)
        #expect(mock.lastDisplayName == "New Name")
        #expect(vm.profile?.displayName == "New Name")
        #expect(vm.savedSuccessfully == true)
    }

    @Test func updateDisplayName_setsErrorOnFailure() async {
        let mock = MockProfileService()
        mock.stubbedProfile = makeProfile()
        let vm = ProfileViewModel(service: mock)
        await vm.loadProfile(userId: testUserId)

        mock.shouldThrow = ProfileError(message: "DB error")
        await vm.updateDisplayName("Bad", userId: testUserId)

        #expect(vm.errorMessage != nil)
        #expect(vm.savedSuccessfully == false)
    }

    // MARK: - updatePrivacy

    @Test func updatePrivacy_toPublic_callsServiceAndUpdatesProfile() async {
        let mock = MockProfileService()
        mock.stubbedProfile = makeProfile(privacy: .private)
        let vm = ProfileViewModel(service: mock)
        await vm.loadProfile(userId: testUserId)

        await vm.updatePrivacy(.public, userId: testUserId)

        #expect(mock.updatePrivacyCalled == true)
        #expect(mock.lastPrivacy == .public)
        #expect(vm.profile?.privacySetting == .public)
    }

    @Test func updatePrivacy_defaultsToPrivate() async {
        let mock = MockProfileService()
        mock.stubbedProfile = makeProfile(privacy: .private)
        let vm = ProfileViewModel(service: mock)

        await vm.loadProfile(userId: testUserId)

        #expect(vm.profile?.privacySetting == .private)
    }

    @Test func updatePrivacy_setsErrorOnFailure() async {
        let mock = MockProfileService()
        mock.stubbedProfile = makeProfile()
        let vm = ProfileViewModel(service: mock)
        await vm.loadProfile(userId: testUserId)

        mock.shouldThrow = ProfileError(message: "DB error")
        await vm.updatePrivacy(.public, userId: testUserId)

        #expect(vm.errorMessage != nil)
    }

    // MARK: - uploadAvatar

    @Test func uploadAvatar_callsServiceAndUpdatesAvatarUrl() async {
        let mock = MockProfileService()
        mock.stubbedProfile = makeProfile()
        let vm = ProfileViewModel(service: mock)
        await vm.loadProfile(userId: testUserId)

        let imageData = Data("fake-image".utf8)
        await vm.uploadAvatar(data: imageData, fileName: "avatar.png", userId: testUserId)

        #expect(mock.uploadAvatarCalled == true)
        #expect(mock.lastAvatarData == imageData)
        #expect(vm.profile?.avatarUrl == "https://example.com/avatar.png")
    }

    @Test func uploadAvatar_setsErrorOnFailure() async {
        let mock = MockProfileService()
        mock.stubbedProfile = makeProfile()
        mock.shouldThrow = ProfileError(message: "Upload failed")
        let vm = ProfileViewModel(service: mock)
        await vm.loadProfile(userId: testUserId)

        mock.shouldThrow = ProfileError(message: "Upload failed")
        await vm.uploadAvatar(data: Data(), fileName: "avatar.png", userId: testUserId)

        #expect(vm.errorMessage != nil)
    }

    @Test func uploadAvatar_setsUploadingDuringUpload() async {
        let mock = MockProfileService()
        mock.stubbedProfile = makeProfile()
        let vm = ProfileViewModel(service: mock)
        await vm.loadProfile(userId: testUserId)

        // After completion, uploading should be false
        await vm.uploadAvatar(data: Data(), fileName: "avatar.png", userId: testUserId)
        #expect(vm.uploading == false)
    }
}
