import Foundation
import Observation

@Observable
@MainActor
public final class RosterViewModel {
    public var roster: [RosterPlayer] = []
    public var errorMessage: String? = nil
    public var selectedPlayerId: String = ""
    public var isAssigning = false

    private let service: RosterServiceProtocol

    public init(service: RosterServiceProtocol = RosterService(client: .shared)) {
        self.service = service
    }

    public func loadRoster(teamId: String) async {
        errorMessage = nil
        do {
            roster = try await service.getRoster(teamId: teamId)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    public func assignPlayer(teamId: String, tournamentId: String, playerId: String) async {
        errorMessage = nil
        isAssigning = true
        do {
            _ = try await service.assignPlayer(teamId: teamId, tournamentId: tournamentId, playerId: playerId)
            selectedPlayerId = ""
            await loadRoster(teamId: teamId)
        } catch {
            errorMessage = error.localizedDescription
        }
        isAssigning = false
    }

    public func removePlayer(id: String, teamId: String) async {
        errorMessage = nil
        do {
            try await service.removePlayer(id: id)
            await loadRoster(teamId: teamId)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    public func setCaptain(teamId: String, captainId: String) async {
        errorMessage = nil
        do {
            try await service.setCaptain(teamId: teamId, captainId: captainId)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
