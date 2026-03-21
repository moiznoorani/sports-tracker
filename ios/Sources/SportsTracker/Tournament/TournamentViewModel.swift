import Foundation
import Observation

@Observable
@MainActor
public final class TournamentViewModel {
    public var tournaments: [Tournament] = []
    public var selectedTournament: Tournament? = nil
    public var isLoading = false
    public var errorMessage: String? = nil

    // Create form state
    public var newName: String = ""
    public var newFormat: TournamentFormat = .roundRobin
    public var newSport: Sport = .ultimateFrisbee
    public var newStartDate: String = ""
    public var newEndDate: String = ""

    private let service: TournamentServiceProtocol

    public init(service: TournamentServiceProtocol = TournamentService(client: .shared)) {
        self.service = service
    }

    public func loadTournaments(leagueId: String) async {
        isLoading = true
        errorMessage = nil
        do {
            tournaments = try await service.getTournaments(leagueId: leagueId)
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    public func loadTournament(id: String) async {
        errorMessage = nil
        do {
            selectedTournament = try await service.getTournament(id: id)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    public func createTournament(leagueId: String, name: String, format: TournamentFormat,
                                  sport: Sport, startDate: String, endDate: String) async {
        errorMessage = nil
        do {
            _ = try await service.createTournament(leagueId: leagueId, name: name, format: format,
                                                    sport: sport, startDate: startDate, endDate: endDate)
            await loadTournaments(leagueId: leagueId)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    public func updateTournament(id: String, leagueId: String, name: String?,
                                  format: TournamentFormat?, sport: Sport?,
                                  startDate: String?, endDate: String?) async {
        errorMessage = nil
        do {
            selectedTournament = try await service.updateTournament(
                id: id, name: name, format: format, sport: sport,
                startDate: startDate, endDate: endDate)
            await loadTournaments(leagueId: leagueId)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    public func publishTournament(id: String, leagueId: String) async {
        errorMessage = nil
        do {
            selectedTournament = try await service.publishTournament(id: id)
            await loadTournaments(leagueId: leagueId)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
