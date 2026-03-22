import Testing
@testable import SportsTracker

struct RosterError: Error { let message: String }

@MainActor
struct RosterViewModelTests {

    // MARK: - loadRoster

    @Test func loadRoster_exposesPlayersFromService() async {
        let mock = MockRosterService()
        mock.stubbedRoster = [
            RosterPlayer(id: "re-1", teamId: "t1", tournamentId: "tm-1",
                         playerId: "p1", displayName: "Alice"),
            RosterPlayer(id: "re-2", teamId: "t1", tournamentId: "tm-1",
                         playerId: "p2", displayName: "Bob"),
        ]
        let vm = RosterViewModel(service: mock)

        await vm.loadRoster(teamId: "t1")

        #expect(vm.roster.count == 2)
        #expect(vm.roster[0].displayName == "Alice")
        #expect(vm.roster[1].displayName == "Bob")
    }

    @Test func loadRoster_setsErrorOnFailure() async {
        let mock = MockRosterService()
        mock.shouldThrow = RosterError(message: "Network error")
        let vm = RosterViewModel(service: mock)

        await vm.loadRoster(teamId: "t1")

        #expect(vm.errorMessage != nil)
        #expect(vm.roster.isEmpty)
    }

    // MARK: - assignPlayer

    @Test func assignPlayer_callsServiceWithCorrectParams() async {
        let mock = MockRosterService()
        let vm = RosterViewModel(service: mock)

        await vm.assignPlayer(teamId: "t1", tournamentId: "tm-1", playerId: "p3")

        #expect(mock.assignCalled == true)
        #expect(mock.lastAssignedTeamId == "t1")
        #expect(mock.lastAssignedTournamentId == "tm-1")
        #expect(mock.lastAssignedPlayerId == "p3")
    }

    @Test func assignPlayer_reloadsRosterOnSuccess() async {
        let mock = MockRosterService()
        let vm = RosterViewModel(service: mock)

        await vm.assignPlayer(teamId: "t1", tournamentId: "tm-1", playerId: "p3")

        #expect(vm.roster.count == 1)
        #expect(vm.roster[0].playerId == "p3")
    }

    @Test func assignPlayer_setsErrorOnFailure() async {
        let mock = MockRosterService()
        mock.shouldThrow = RosterError(message: "Player already on a team")
        let vm = RosterViewModel(service: mock)

        await vm.assignPlayer(teamId: "t1", tournamentId: "tm-1", playerId: "p3")

        #expect(vm.errorMessage != nil)
        #expect(vm.roster.isEmpty)
    }

    // MARK: - removePlayer

    @Test func removePlayer_callsServiceWithCorrectId() async {
        let mock = MockRosterService()
        mock.stubbedRoster = [
            RosterPlayer(id: "re-1", teamId: "t1", tournamentId: "tm-1", playerId: "p1"),
        ]
        let vm = RosterViewModel(service: mock)
        vm.roster = mock.stubbedRoster

        await vm.removePlayer(id: "re-1", teamId: "t1")

        #expect(mock.removeCalled == true)
        #expect(mock.lastRemovedId == "re-1")
    }

    @Test func removePlayer_reloadsRosterOnSuccess() async {
        let mock = MockRosterService()
        mock.stubbedRoster = []
        let vm = RosterViewModel(service: mock)
        vm.roster = [RosterPlayer(id: "re-1", teamId: "t1", tournamentId: "tm-1", playerId: "p1")]

        await vm.removePlayer(id: "re-1", teamId: "t1")

        #expect(vm.roster.isEmpty)
    }

    // MARK: - setCaptain

    @Test func setCaptain_callsServiceWithCorrectParams() async {
        let mock = MockRosterService()
        let vm = RosterViewModel(service: mock)

        await vm.setCaptain(teamId: "t1", captainId: "p1")

        #expect(mock.setCaptainCalled == true)
        #expect(mock.lastCaptainTeamId == "t1")
        #expect(mock.lastCaptainPlayerId == "p1")
    }

    @Test func setCaptain_setsErrorOnFailure() async {
        let mock = MockRosterService()
        mock.shouldThrow = RosterError(message: "Not authorized")
        let vm = RosterViewModel(service: mock)

        await vm.setCaptain(teamId: "t1", captainId: "p1")

        #expect(vm.errorMessage != nil)
    }
}
