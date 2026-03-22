import Foundation
import Supabase

public struct Team: Codable, Identifiable, Sendable {
    public let id: String
    public let tournamentId: String
    public let name: String
    public var captainId: String?
    public let createdBy: String
    public let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id, name
        case tournamentId = "tournament_id"
        case captainId = "captain_id"
        case createdBy = "created_by"
        case createdAt = "created_at"
    }

    public init(id: String, tournamentId: String, name: String,
                captainId: String? = nil, createdBy: String = "", createdAt: String = "") {
        self.id = id
        self.tournamentId = tournamentId
        self.name = name
        self.captainId = captainId
        self.createdBy = createdBy
        self.createdAt = createdAt
    }
}

public protocol TeamServiceProtocol: Sendable {
    func getTeams(tournamentId: String) async throws -> [Team]
    func getTeam(id: String) async throws -> Team
    func createTeam(tournamentId: String, name: String) async throws -> Team
}

private let teamFields = "id, tournament_id, name, captain_id, created_by, created_at"

public final class TeamService: TeamServiceProtocol {
    private let client: SupabaseClient

    public init(client: SupabaseClient) {
        self.client = client
    }

    public func getTeams(tournamentId: String) async throws -> [Team] {
        try await client.from("teams")
            .select(teamFields)
            .eq("tournament_id", value: tournamentId)
            .order("created_at")
            .execute()
            .value
    }

    public func getTeam(id: String) async throws -> Team {
        try await client.from("teams")
            .select(teamFields)
            .eq("id", value: id)
            .single()
            .execute()
            .value
    }

    public func createTeam(tournamentId: String, name: String) async throws -> Team {
        struct Insert: Encodable {
            let tournament_id: String
            let name: String
        }
        return try await client.from("teams")
            .insert(Insert(tournament_id: tournamentId, name: name))
            .select(teamFields)
            .single()
            .execute()
            .value
    }
}
