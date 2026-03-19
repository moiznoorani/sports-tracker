import Supabase
import Foundation

struct UserProfile: Codable, Equatable {
    let id: UUID
    var displayName: String?
    var avatarUrl: String?
    var privacySetting: PrivacySetting

    enum PrivacySetting: String, Codable {
        case `private`, `public`
    }

    enum CodingKeys: String, CodingKey {
        case id
        case displayName = "display_name"
        case avatarUrl   = "avatar_url"
        case privacySetting = "privacy_setting"
    }
}

protocol ProfileServiceProtocol: Sendable {
    func getProfile(userId: UUID) async throws -> UserProfile
    func updateDisplayName(_ name: String, userId: UUID) async throws
    func updatePrivacy(_ setting: UserProfile.PrivacySetting, userId: UUID) async throws
    func uploadAvatar(data: Data, fileName: String, userId: UUID) async throws -> String
}

final class ProfileService: ProfileServiceProtocol {
    private let client: SupabaseClient

    init(client: SupabaseClient = .shared) {
        self.client = client
    }

    func getProfile(userId: UUID) async throws -> UserProfile {
        try await client
            .from("users")
            .select("id, display_name, avatar_url, privacy_setting")
            .eq("id", value: userId)
            .single()
            .execute()
            .value
    }

    func updateDisplayName(_ name: String, userId: UUID) async throws {
        try await client
            .from("users")
            .update(["display_name": name])
            .eq("id", value: userId)
            .execute()
    }

    func updatePrivacy(_ setting: UserProfile.PrivacySetting, userId: UUID) async throws {
        try await client
            .from("users")
            .update(["privacy_setting": setting.rawValue])
            .eq("id", value: userId)
            .execute()
    }

    func uploadAvatar(data: Data, fileName: String, userId: UUID) async throws -> String {
        let path = "\(userId)/\(fileName)"

        try await client.storage
            .from("avatars")
            .upload(path, data: data, options: FileOptions(upsert: true))

        let response = try client.storage
            .from("avatars")
            .getPublicURL(path: path)

        let avatarUrl = response.absoluteString
        try await client
            .from("users")
            .update(["avatar_url": avatarUrl])
            .eq("id", value: userId)
            .execute()

        return avatarUrl
    }
}
