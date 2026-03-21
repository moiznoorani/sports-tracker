@testable import SportsTracker

final class MockRosterService: RosterServiceProtocol, @unchecked Sendable {
    var stubbedRoster: [RosterPlayer] = []
    var shouldThrow: Error? = nil

    var assignCalled = false
    var lastAssignedTeamId: String?
    var lastAssignedTournamentId: String?
    var lastAssignedPlayerId: String?

    var removeCalled = false
    var lastRemovedId: String?

    var setCaptainCalled = false
    var lastCaptainTeamId: String?
    var lastCaptainPlayerId: String?

    func getRoster(teamId: String) async throws -> [RosterPlayer] {
        if let error = shouldThrow { throw error }
        return stubbedRoster
    }

    func assignPlayer(teamId: String, tournamentId: String, playerId: String) async throws -> RosterPlayer {
        assignCalled = true
        lastAssignedTeamId = teamId
        lastAssignedTournamentId = tournamentId
        lastAssignedPlayerId = playerId
        if let error = shouldThrow { throw error }
        let player = RosterPlayer(id: "re-new", teamId: teamId, tournamentId: tournamentId,
                                  playerId: playerId, joinedAt: "2026-04-01", displayName: nil)
        stubbedRoster.append(player)
        return player
    }

    func removePlayer(id: String) async throws {
        removeCalled = true
        lastRemovedId = id
        if let error = shouldThrow { throw error }
        stubbedRoster.removeAll { $0.id == id }
    }

    func setCaptain(teamId: String, captainId: String) async throws {
        setCaptainCalled = true
        lastCaptainTeamId = teamId
        lastCaptainPlayerId = captainId
        if let error = shouldThrow { throw error }
    }
}
