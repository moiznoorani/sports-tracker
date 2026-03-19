import Foundation

@MainActor
@Observable
public final class ProfileViewModel {
    public var displayName: String = ""
    public var privacySetting: PrivacySetting = .private
    public var avatarURL: String? = nil
    public var errorMessage: String? = nil
    public var isSaving: Bool = false

    private let service: ProfileServiceProtocol
    private var userId: String = ""

    public init(service: ProfileServiceProtocol) {
        self.service = service
    }

    public func loadProfile(userId: String) async {
        self.userId = userId
        do {
            guard let profile = try await service.getProfile(userId: userId) else { return }
            displayName = profile.displayName ?? ""
            privacySetting = profile.privacySetting
            avatarURL = profile.avatarURL
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    public func updateDisplayName(_ name: String) async {
        do {
            try await service.updateDisplayName(userId: userId, displayName: name)
            displayName = name
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    public func updatePrivacy(_ privacy: PrivacySetting) async {
        do {
            try await service.updatePrivacy(userId: userId, privacy: privacy)
            privacySetting = privacy
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    public func uploadAvatar(data: Data, fileExtension: String) async {
        do {
            let url = try await service.uploadAvatar(userId: userId, data: data, fileExtension: fileExtension)
            avatarURL = url
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
