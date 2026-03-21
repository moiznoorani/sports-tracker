import Foundation
import Supabase

public enum TournamentFormat: String, Codable, Sendable, CaseIterable {
    case roundRobin = "round_robin"
    case singleElimination = "single_elimination"

    public var displayName: String {
        switch self {
        case .roundRobin: return "Round Robin"
        case .singleElimination: return "Single Elimination"
        }
    }
}

public enum TournamentStatus: String, Codable, Sendable {
    case draft = "draft"
    case published = "published"

    public var displayName: String {
        switch self {
        case .draft: return "Draft"
        case .published: return "Published"
        }
    }
}

public struct Tournament: Codable, Identifiable, Sendable {
    public let id: String
    public let leagueId: String
    public var name: String
    public var format: TournamentFormat
    public var sport: Sport
    public var startDate: String
    public var endDate: String
    public var status: TournamentStatus
    public let createdBy: String

    enum CodingKeys: String, CodingKey {
        case id, name, format, sport, status
        case leagueId = "league_id"
        case startDate = "start_date"
        case endDate = "end_date"
        case createdBy = "created_by"
    }

    public init(id: String, leagueId: String, name: String, format: TournamentFormat,
                sport: Sport, startDate: String, endDate: String,
                status: TournamentStatus = .draft, createdBy: String = "") {
        self.id = id
        self.leagueId = leagueId
        self.name = name
        self.format = format
        self.sport = sport
        self.startDate = startDate
        self.endDate = endDate
        self.status = status
        self.createdBy = createdBy
    }
}

public protocol TournamentServiceProtocol: Sendable {
    func getTournaments(leagueId: String) async throws -> [Tournament]
    func getTournament(id: String) async throws -> Tournament
    func createTournament(leagueId: String, name: String, format: TournamentFormat,
                          sport: Sport, startDate: String, endDate: String) async throws -> Tournament
    func updateTournament(id: String, name: String?, format: TournamentFormat?,
                          sport: Sport?, startDate: String?, endDate: String?) async throws -> Tournament
}

public final class TournamentService: TournamentServiceProtocol {
    private let client: SupabaseClient

    public init(client: SupabaseClient) {
        self.client = client
    }

    public func getTournaments(leagueId: String) async throws -> [Tournament] {
        try await client.from("tournaments")
            .select("id, league_id, name, format, sport, start_date, end_date, status, created_by")
            .eq("league_id", value: leagueId)
            .order("start_date")
            .execute()
            .value
    }

    public func getTournament(id: String) async throws -> Tournament {
        try await client.from("tournaments")
            .select("id, league_id, name, format, sport, start_date, end_date, status, created_by")
            .eq("id", value: id)
            .single()
            .execute()
            .value
    }

    public func createTournament(leagueId: String, name: String, format: TournamentFormat,
                                  sport: Sport, startDate: String, endDate: String) async throws -> Tournament {
        struct Insert: Encodable {
            let league_id: String
            let name: String
            let format: String
            let sport: String
            let start_date: String
            let end_date: String
        }
        let insert = Insert(league_id: leagueId, name: name, format: format.rawValue,
                            sport: sport.rawValue, start_date: startDate, end_date: endDate)
        return try await client.from("tournaments")
            .insert(insert)
            .select("id, league_id, name, format, sport, start_date, end_date, status, created_by")
            .single()
            .execute()
            .value
    }

    public func updateTournament(id: String, name: String?, format: TournamentFormat?,
                                  sport: Sport?, startDate: String?, endDate: String?) async throws -> Tournament {
        struct Patch: Encodable {
            let name: String?
            let format: String?
            let sport: String?
            let start_date: String?
            let end_date: String?
        }
        let patch = Patch(name: name, format: format?.rawValue, sport: sport?.rawValue,
                          start_date: startDate, end_date: endDate)
        return try await client.from("tournaments")
            .update(patch)
            .eq("id", value: id)
            .select("id, league_id, name, format, sport, start_date, end_date, status, created_by")
            .single()
            .execute()
            .value
    }
}
