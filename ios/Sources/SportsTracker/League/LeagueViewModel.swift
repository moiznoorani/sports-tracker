import Foundation
import Observation

@Observable
@MainActor
public final class LeagueViewModel {
    public var leagues: [League] = []
    public var isLoading = false
    public var errorMessage: String? = nil

    // Detail
    public var selectedLeague: League? = nil

    // Create form state
    public var newName: String = ""
    public var newSport: Sport = .ultimateFrisbee
    public var newVisibility: Visibility = .private

    // Join form state
    public var joinToken: String = ""
    public var joinSuccess = false

    // Members
    public var members: [LeagueMember] = []

    // Browse
    public var publicLeagues: [PublicLeague] = []

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

    public func loadLeague(id: String) async {
        errorMessage = nil
        do {
            selectedLeague = try await service.getLeague(id: id)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    public func joinByToken() async {
        errorMessage = nil
        do {
            try await service.joinByToken(joinToken)
            joinSuccess = true
            await loadLeagues()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    public func loadMembers(leagueId: String) async {
        errorMessage = nil
        do {
            members = try await service.getMembers(leagueId: leagueId)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    public func removeMember(leagueId: String, userId: String) async {
        errorMessage = nil
        do {
            try await service.removeMember(leagueId: leagueId, userId: userId)
            await loadMembers(leagueId: leagueId)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    public func browseLeagues() async {
        errorMessage = nil
        do {
            publicLeagues = try await service.browseLeagues()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    public func joinLeague(leagueId: String) async {
        errorMessage = nil
        do {
            try await service.joinLeague(leagueId: leagueId)
            await loadLeagues()
            await browseLeagues()
        } catch {
            errorMessage = error.localizedDescription
        }
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
