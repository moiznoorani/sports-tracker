import Foundation
import Observation

@Observable
@MainActor
public final class LeagueViewModel {
    public var leagues: [League] = []
    public var isLoading = false
    public var errorMessage: String? = nil

    // Create form state
    public var newName: String = ""
    public var newSport: Sport = .ultimateFrisbee
    public var newVisibility: Visibility = .private

    private let service: LeagueServiceProtocol

    public init(service: LeagueServiceProtocol = LeagueService(client: .shared)) {
        self.service = service
    }

    public func loadLeagues() async {
        isLoading = true
        errorMessage = nil
        do {
            leagues = try await service.getMyLeagues()
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    public func createLeague(name: String, sport: Sport, visibility: Visibility) async {
        errorMessage = nil
        do {
            _ = try await service.createLeague(name: name, sport: sport, visibility: visibility, lat: nil, lng: nil)
            await loadLeagues()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
