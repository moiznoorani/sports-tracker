import Foundation
import Supabase

public struct Team: Codable, Identifiable, Sendable {
    public let id: String
    public let tournamentId: String
    public let name: String
    public let createdBy: String
    public let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id, name
        case tournamentId = "tournament_id"
        case createdBy = "created_by"
        case createdAt = "created_at"
    }

    public init(id: String, tournamentId: String, name: String,
                createdBy: String = "", createdAt: String = "") {
        self.id = id
        self.tournamentId = tournamentId
        self.name = name
        self.createdBy = createdBy
        self.createdAt = createdAt
    }
}

public protocol TeamServiceProtocol: Sendable {
    func getTeams(tournamentId: String) async throws -> [Team]
    func createTeam(tournamentId: String, name: String) async throws -> Team
}

public final class TeamService: TeamServiceProtocol {
    private let client: SupabaseClient

    public init(client: SupabaseClient) {
        self.client = client
    }

    public func getTeams(tournamentId: String) async throws -> [Team] {
        try await client.from("teams")
            .select("id, tournament_id, name, created_by, created_at")
            .eq("tournament_id", value: tournamentId)
            .order("created_at")
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
            .select("id, tournament_id, name, created_by, created_at")
            .single()
            .execute()
            .value
    }
}
