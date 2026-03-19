import Foundation

@MainActor
@Observable
final class ProfileViewModel {
    private(set) var profile: UserProfile?
    private(set) var uploading = false
    private(set) var saving = false
    private(set) var errorMessage: String?
    private(set) var savedSuccessfully = false

    private let service: any ProfileServiceProtocol

    init(service: any ProfileServiceProtocol = ProfileService()) {
        self.service = service
    }

    func loadProfile(userId: UUID) async {
        errorMessage = nil
        do {
            profile = try await service.getProfile(userId: userId)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func updateDisplayName(_ name: String, userId: UUID) async {
        errorMessage = nil
        saving = true
        defer { saving = false }
        do {
            try await service.updateDisplayName(name, userId: userId)
            profile?.displayName = name
            savedSuccessfully = true
        } catch {
            errorMessage = error.localizedDescription
            savedSuccessfully = false
        }
    }

    func updatePrivacy(_ setting: UserProfile.PrivacySetting, userId: UUID) async {
        errorMessage = nil
        saving = true
        defer { saving = false }
        do {
            try await service.updatePrivacy(setting, userId: userId)
            profile?.privacySetting = setting
            savedSuccessfully = true
        } catch {
            errorMessage = error.localizedDescription
            savedSuccessfully = false
        }
    }

    func uploadAvatar(data: Data, fileName: String, userId: UUID) async {
        errorMessage = nil
        uploading = true
        defer { uploading = false }
        do {
            let url = try await service.uploadAvatar(data: data, fileName: fileName, userId: userId)
            profile?.avatarUrl = url
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
