import Testing
import Foundation
@testable import SportsTracker

struct ProfileError: Error { let message: String }

@MainActor
struct ProfileViewModelTests {

    // Slice 1: loadProfile exposes displayName
    @Test func loadProfile_exposesDisplayName() async {
        let mock = MockProfileService()
        mock.stubbedProfile = UserProfile(id: "user-1", displayName: "Moiz", avatarURL: nil, privacySetting: .private)
        let vm = ProfileViewModel(service: mock)

        await vm.loadProfile(userId: "user-1")

        #expect(vm.displayName == "Moiz")
    }

    // Slice 2: privacy defaults to private
    @Test func loadProfile_defaultsPrivacyToPrivate() async {
        let mock = MockProfileService()
        mock.stubbedProfile = UserProfile(id: "user-1", displayName: nil, avatarURL: nil, privacySetting: .private)
        let vm = ProfileViewModel(service: mock)

        await vm.loadProfile(userId: "user-1")

        #expect(vm.privacySetting == .private)
    }

    // Slice 3: updateDisplayName calls service and updates state
    @Test func updateDisplayName_callsServiceAndUpdatesState() async {
        let mock = MockProfileService()
        mock.stubbedProfile = UserProfile(id: "user-1", displayName: "Old", avatarURL: nil, privacySetting: .private)
        let vm = ProfileViewModel(service: mock)
        await vm.loadProfile(userId: "user-1")

        await vm.updateDisplayName("New Name")

        #expect(mock.updateDisplayNameCalled == true)
        #expect(mock.lastDisplayName == "New Name")
        #expect(vm.displayName == "New Name")
    }

    // Slice 4: updatePrivacy calls service and updates state
    @Test func updatePrivacy_callsServiceAndUpdatesState() async {
        let mock = MockProfileService()
        mock.stubbedProfile = UserProfile(id: "user-1", displayName: nil, avatarURL: nil, privacySetting: .private)
        let vm = ProfileViewModel(service: mock)
        await vm.loadProfile(userId: "user-1")

        await vm.updatePrivacy(.public)

        #expect(mock.updatePrivacyCalled == true)
        #expect(mock.lastPrivacy == .public)
        #expect(vm.privacySetting == .public)
    }

    // Slice 5: uploadAvatar calls service and updates avatarURL
    @Test func uploadAvatar_callsServiceAndUpdatesAvatarURL() async {
        let mock = MockProfileService()
        mock.stubbedProfile = UserProfile(id: "user-1", displayName: nil, avatarURL: nil, privacySetting: .private)
        let vm = ProfileViewModel(service: mock)
        await vm.loadProfile(userId: "user-1")

        let imageData = Data("fake-image".utf8)
        await vm.uploadAvatar(data: imageData, fileExtension: "png")

        #expect(mock.uploadAvatarCalled == true)
        #expect(mock.lastAvatarData == imageData)
        #expect(vm.avatarURL == "https://example.com/avatar.png")
    }

    // Slice 6: error on getProfile failure sets errorMessage
    @Test func loadProfile_setsErrorMessageOnFailure() async {
        let mock = MockProfileService()
        mock.shouldThrow = ProfileError(message: "Network error")
        let vm = ProfileViewModel(service: mock)

        await vm.loadProfile(userId: "user-1")

        #expect(vm.errorMessage != nil)
    }
}
