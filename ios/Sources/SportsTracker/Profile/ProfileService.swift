import Foundation
import Supabase

public enum PrivacySetting: String, Codable, Sendable {
    case `private` = "private"
    case `public` = "public"
}

public struct UserProfile: Codable {
    public let id: String
    public var displayName: String?
    public var avatarURL: String?
    public var privacySetting: PrivacySetting

    enum CodingKeys: String, CodingKey {
        case id
        case displayName = "display_name"
        case avatarURL = "avatar_url"
        case privacySetting = "privacy_setting"
    }

    public init(id: String, displayName: String?, avatarURL: String?, privacySetting: PrivacySetting) {
        self.id = id
        self.displayName = displayName
        self.avatarURL = avatarURL
        self.privacySetting = privacySetting
    }
}

public protocol ProfileServiceProtocol: Sendable {
    func getProfile(userId: String) async throws -> UserProfile?
    func updateDisplayName(userId: String, displayName: String) async throws
    func updatePrivacy(userId: String, privacy: PrivacySetting) async throws
    func uploadAvatar(userId: String, data: Data, fileExtension: String) async throws -> String
}

public final class ProfileService: ProfileServiceProtocol {
    private let client: SupabaseClient

    public init(client: SupabaseClient) {
        self.client = client
    }

    public func getProfile(userId: String) async throws -> UserProfile? {
        try await client.from("users")
            .select("id, display_name, avatar_url, privacy_setting")
            .eq("id", value: userId)
            .single()
            .execute()
            .value
    }

    public func updateDisplayName(userId: String, displayName: String) async throws {
        try await client.from("users")
            .update(["display_name": displayName])
            .eq("id", value: userId)
            .execute()
    }

    public func updatePrivacy(userId: String, privacy: PrivacySetting) async throws {
        try await client.from("users")
            .update(["privacy_setting": privacy.rawValue])
            .eq("id", value: userId)
            .execute()
    }

    public func uploadAvatar(userId: String, data: Data, fileExtension: String) async throws -> String {
        let path = "\(userId)/avatar.\(fileExtension)"
        try await client.storage.from("avatars").upload(
            path,
            data: data,
            options: FileOptions(upsert: true)
        )
        let urlResponse = try client.storage.from("avatars").getPublicURL(path: path)
        let publicURL = urlResponse.absoluteString
        try await client.from("users")
            .update(["avatar_url": publicURL])
            .eq("id", value: userId)
            .execute()
        return publicURL
    }
}
