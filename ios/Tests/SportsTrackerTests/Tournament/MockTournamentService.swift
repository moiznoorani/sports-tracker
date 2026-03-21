@testable import SportsTracker

final class MockTournamentService: TournamentServiceProtocol, @unchecked Sendable {
    var stubbedTournaments: [Tournament] = []
    var stubbedTournament: Tournament? = nil
    var shouldThrow: Error? = nil

    var createCalled = false
    var updateCalled = false
    var publishCalled = false
    var lastCreatedName: String?
    var lastCreatedFormat: TournamentFormat?
    var lastCreatedSport: Sport?
    var lastUpdatedId: String?
    var lastPublishedId: String?

    func getTournaments(leagueId: String) async throws -> [Tournament] {
        if let error = shouldThrow { throw error }
        return stubbedTournaments
    }

    func getTournament(id: String) async throws -> Tournament {
        if let error = shouldThrow { throw error }
        return stubbedTournament ?? Tournament(
            id: id, leagueId: "lg-1", name: "Test",
            format: .roundRobin, sport: .ultimateFrisbee,
            startDate: "2026-04-01", endDate: "2026-04-02"
        )
    }

    func createTournament(leagueId: String, name: String, format: TournamentFormat,
                           sport: Sport, startDate: String, endDate: String) async throws -> Tournament {
        createCalled = true
        lastCreatedName = name
        lastCreatedFormat = format
        lastCreatedSport = sport
        if let error = shouldThrow { throw error }
        let t = Tournament(id: "new-id", leagueId: leagueId, name: name,
                           format: format, sport: sport, startDate: startDate, endDate: endDate)
        stubbedTournaments.append(t)
        return t
    }

    func updateTournament(id: String, name: String?, format: TournamentFormat?,
                           sport: Sport?, startDate: String?, endDate: String?) async throws -> Tournament {
        updateCalled = true
        lastUpdatedId = id
        if let error = shouldThrow { throw error }
        return stubbedTournament ?? Tournament(
            id: id, leagueId: "lg-1", name: name ?? "Updated",
            format: format ?? .roundRobin, sport: sport ?? .ultimateFrisbee,
            startDate: startDate ?? "2026-04-01", endDate: endDate ?? "2026-04-02"
        )
    }

    func publishTournament(id: String) async throws -> Tournament {
        publishCalled = true
        lastPublishedId = id
        if let error = shouldThrow { throw error }
        let base = stubbedTournament ?? Tournament(
            id: id, leagueId: "lg-1", name: "Test",
            format: .roundRobin, sport: .ultimateFrisbee,
            startDate: "2026-04-01", endDate: "2026-04-02"
        )
        let published = Tournament(id: base.id, leagueId: base.leagueId, name: base.name,
                                   format: base.format, sport: base.sport,
                                   startDate: base.startDate, endDate: base.endDate,
                                   status: .published, createdBy: base.createdBy)
        // Update stubbedTournaments to reflect published status
        stubbedTournaments = stubbedTournaments.map { t in
            t.id == id ? published : t
        }
        return published
    }
}
