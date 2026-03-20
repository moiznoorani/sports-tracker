import Foundation
import Supabase

public enum Sport: String, Codable, Sendable, CaseIterable {
    case ultimateFrisbee = "ultimate_frisbee"
    case basketball = "basketball"

    public var displayName: String {
        switch self {
        case .ultimateFrisbee: return "Ultimate Frisbee"
        case .basketball: return "Basketball"
        }
    }
}

public enum Visibility: String, Codable, Sendable, CaseIterable {
    case `private` = "private"
    case `public` = "public"

    public var displayName: String {
        switch self {
        case .private: return "Private"
        case .public: return "Public"
        }
    }
}

public struct League: Codable, Identifiable, Sendable {
    public let id: String
    public var name: String
    public var sport: Sport
    public var visibility: Visibility
    public var lat: Double?
    public var lng: Double?
    public var inviteToken: String?

    enum CodingKeys: String, CodingKey {
        case id, name, sport, visibility, lat, lng
        case inviteToken = "invite_token"
    }

    public init(id: String, name: String, sport: Sport, visibility: Visibility, lat: Double? = nil, lng: Double? = nil, inviteToken: String? = nil) {
        self.id = id
        self.name = name
        self.sport = sport
        self.visibility = visibility
        self.lat = lat
        self.lng = lng
        self.inviteToken = inviteToken
    }
}

public protocol LeagueServiceProtocol: Sendable {
    func getMyLeagues() async throws -> [League]
    func getLeague(id: String) async throws -> League
    func createLeague(name: String, sport: Sport, visibility: Visibility, lat: Double?, lng: Double?) async throws -> League
    func joinByToken(_ token: String) async throws
}

public final class LeagueService: LeagueServiceProtocol {
    private let client: SupabaseClient

    public init(client: SupabaseClient) {
        self.client = client
    }

    public func getMyLeagues() async throws -> [League] {
        try await client.from("leagues")
            .select("id, name, sport, visibility, lat, lng")
            .order("created_at", ascending: false)
            .execute()
            .value
    }

    public func getLeague(id: String) async throws -> League {
        try await client.from("leagues")
            .select("id, name, sport, visibility, lat, lng, invite_token")
            .eq("id", value: id)
            .single()
            .execute()
            .value
    }

    public func joinByToken(_ token: String) async throws {
        try await client.rpc("join_league_by_token", params: ["p_token": token])
            .execute()
    }

    public func createLeague(name: String, sport: Sport, visibility: Visibility, lat: Double? = nil, lng: Double? = nil) async throws -> League {
        struct Insert: Encodable {
            let name: String
            let sport: String
            let visibility: String
            let lat: Double?
            let lng: Double?
        }
        let insert = Insert(
            name: name,
            sport: sport.rawValue,
            visibility: visibility.rawValue,
            lat: lat,
            lng: lng
        )
        return try await client.from("leagues")
            .insert(insert)
            .select("id, name, sport, visibility, lat, lng")
            .single()
            .execute()
            .value
    }
}
