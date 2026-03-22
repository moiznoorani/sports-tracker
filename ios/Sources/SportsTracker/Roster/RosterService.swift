import Foundation
import Supabase

public struct RosterPlayer: Codable, Identifiable, Sendable {
    public let id: String
    public let teamId: String
    public let tournamentId: String
    public let playerId: String
    public let joinedAt: String
    public let displayName: String?
    public let avatarUrl: String?

    enum CodingKeys: String, CodingKey {
        case id
        case teamId = "team_id"
        case tournamentId = "tournament_id"
        case playerId = "player_id"
        case joinedAt = "joined_at"
        case displayName = "display_name"
        case avatarUrl = "avatar_url"
    }

    public init(id: String, teamId: String, tournamentId: String, playerId: String,
                joinedAt: String = "", displayName: String? = nil, avatarUrl: String? = nil) {
        self.id = id
        self.teamId = teamId
        self.tournamentId = tournamentId
        self.playerId = playerId
        self.joinedAt = joinedAt
        self.displayName = displayName
        self.avatarUrl = avatarUrl
    }
}

public protocol RosterServiceProtocol: Sendable {
    func getRoster(teamId: String) async throws -> [RosterPlayer]
    func assignPlayer(teamId: String, tournamentId: String, playerId: String) async throws -> RosterPlayer
    func removePlayer(id: String) async throws
    func setCaptain(teamId: String, captainId: String) async throws
}

public final class RosterService: RosterServiceProtocol {
    private let client: SupabaseClient

    public init(client: SupabaseClient) {
        self.client = client
    }

    public func getRoster(teamId: String) async throws -> [RosterPlayer] {
        struct Row: Decodable {
            let id: String
            let team_id: String
            let tournament_id: String
            let player_id: String
            let joined_at: String
            struct UserInfo: Decodable {
                let display_name: String?
                let avatar_url: String?
            }
            let users: UserInfo?
        }
        let rows: [Row] = try await client.from("roster_entries")
            .select("id, team_id, tournament_id, player_id, joined_at, users(display_name, avatar_url)")
            .eq("team_id", value: teamId)
            .order("joined_at")
            .execute()
            .value
        return rows.map {
            RosterPlayer(id: $0.id, teamId: $0.team_id, tournamentId: $0.tournament_id,
                         playerId: $0.player_id, joinedAt: $0.joined_at,
                         displayName: $0.users?.display_name, avatarUrl: $0.users?.avatar_url)
        }
    }

    public func assignPlayer(teamId: String, tournamentId: String, playerId: String) async throws -> RosterPlayer {
        struct Insert: Encodable {
            let team_id: String
            let tournament_id: String
            let player_id: String
        }
        struct Row: Decodable {
            let id: String; let team_id: String; let tournament_id: String
            let player_id: String; let joined_at: String
        }
        let row: Row = try await client.from("roster_entries")
            .insert(Insert(team_id: teamId, tournament_id: tournamentId, player_id: playerId))
            .select("id, team_id, tournament_id, player_id, joined_at")
            .single()
            .execute()
            .value
        return RosterPlayer(id: row.id, teamId: row.team_id, tournamentId: row.tournament_id,
                            playerId: row.player_id, joinedAt: row.joined_at)
    }

    public func removePlayer(id: String) async throws {
        try await client.from("roster_entries")
            .delete()
            .eq("id", value: id)
            .execute()
    }

    public func setCaptain(teamId: String, captainId: String) async throws {
        struct Patch: Encodable { let captain_id: String }
        try await client.from("teams")
            .update(Patch(captain_id: captainId))
            .eq("id", value: teamId)
            .execute()
    }
}
