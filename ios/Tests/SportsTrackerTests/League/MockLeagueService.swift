@testable import SportsTracker

final class MockLeagueService: LeagueServiceProtocol, @unchecked Sendable {
    var stubbedLeagues: [League] = []
    var stubbedLeague: League? = nil
    var shouldThrow: Error? = nil

    var createLeagueCalled = false
    var loadLeaguesCalled = false
    var joinByTokenCalled = false
    var lastJoinToken: String?

    var lastCreatedName: String?
    var lastCreatedSport: Sport?
    var lastCreatedVisibility: Visibility?

    func getMyLeagues() async throws -> [League] {
        loadLeaguesCalled = true
        if let error = shouldThrow { throw error }
        return stubbedLeagues
    }

    func getLeague(id: String) async throws -> League {
        if let error = shouldThrow { throw error }
        return stubbedLeague ?? League(id: id, name: "Test League", sport: .ultimateFrisbee, visibility: .private, inviteToken: "test-token")
    }

    func createLeague(name: String, sport: Sport, visibility: Visibility, lat: Double?, lng: Double?) async throws -> League {
        createLeagueCalled = true
        lastCreatedName = name
        lastCreatedSport = sport
        lastCreatedVisibility = visibility
        if let error = shouldThrow { throw error }
        let league = League(id: "new-id", name: name, sport: sport, visibility: visibility, lat: lat, lng: lng)
        stubbedLeagues.append(league)
        return league
    }

    func joinByToken(_ token: String) async throws {
        joinByTokenCalled = true
        lastJoinToken = token
        if let error = shouldThrow { throw error }
    }
}
