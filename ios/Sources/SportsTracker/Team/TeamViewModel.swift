import Foundation
import Observation

@Observable
@MainActor
public final class TeamViewModel {
    public var teams: [Team] = []
    public var myTeamId: String? = nil
    public var errorMessage: String? = nil
    public var newName: String = ""
    public var isCreating = false

    private let service: TeamServiceProtocol
    private let rosterService: RosterServiceProtocol

    public init(service: TeamServiceProtocol = TeamService(client: .shared),
                rosterService: RosterServiceProtocol = RosterService(client: .shared)) {
        self.service = service
        self.rosterService = rosterService
    }

    public func loadTeams(tournamentId: String) async {
        errorMessage = nil
        do {
            teams = try await service.getTeams(tournamentId: tournamentId)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    public func loadMyTeamId(tournamentId: String, playerId: String) async {
        guard !playerId.isEmpty else { return }
        myTeamId = try? await rosterService.getMyTeamId(tournamentId: tournamentId, playerId: playerId)
    }

    public func createTeam(tournamentId: String, name: String) async {
        errorMessage = nil
        isCreating = true
        do {
            _ = try await service.createTeam(tournamentId: tournamentId, name: name)
            newName = ""
            await loadTeams(tournamentId: tournamentId)
        } catch {
            errorMessage = error.localizedDescription
        }
        isCreating = false
    }
}
