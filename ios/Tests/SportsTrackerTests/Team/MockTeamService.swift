@testable import SportsTracker

final class MockTeamService: TeamServiceProtocol, @unchecked Sendable {
    var stubbedTeams: [Team] = []
    var shouldThrow: Error? = nil

    var createCalled = false
    var lastCreatedTournamentId: String?
    var lastCreatedName: String?

    func getTeams(tournamentId: String) async throws -> [Team] {
        if let error = shouldThrow { throw error }
        return stubbedTeams
    }

    func createTeam(tournamentId: String, name: String) async throws -> Team {
        createCalled = true
        lastCreatedTournamentId = tournamentId
        lastCreatedName = name
        if let error = shouldThrow { throw error }
        let team = Team(id: "new-id", tournamentId: tournamentId, name: name,
                        createdBy: "user-1", createdAt: "2026-04-01T00:00:00Z")
        stubbedTeams.append(team)
        return team
    }
}
