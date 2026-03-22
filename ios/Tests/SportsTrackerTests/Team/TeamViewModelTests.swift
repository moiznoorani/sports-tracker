import Testing
@testable import SportsTracker

struct TeamError: Error { let message: String }

@MainActor
struct TeamViewModelTests {

    // MARK: - loadTeams

    @Test func loadTeams_exposesTeamsFromService() async {
        let mock = MockTeamService()
        mock.stubbedTeams = [
            Team(id: "t1", tournamentId: "tm-1", name: "Alpha"),
            Team(id: "t2", tournamentId: "tm-1", name: "Beta"),
        ]
        let vm = TeamViewModel(service: mock)

        await vm.loadTeams(tournamentId: "tm-1")

        #expect(vm.teams.count == 2)
        #expect(vm.teams[0].name == "Alpha")
        #expect(vm.teams[1].name == "Beta")
    }

    @Test func loadTeams_setsErrorOnFailure() async {
        let mock = MockTeamService()
        mock.shouldThrow = TeamError(message: "Network error")
        let vm = TeamViewModel(service: mock)

        await vm.loadTeams(tournamentId: "tm-1")

        #expect(vm.errorMessage != nil)
        #expect(vm.teams.isEmpty)
    }

    // MARK: - createTeam

    @Test func createTeam_callsServiceWithCorrectParams() async {
        let mock = MockTeamService()
        let vm = TeamViewModel(service: mock)

        await vm.createTeam(tournamentId: "tm-1", name: "Gamma")

        #expect(mock.createCalled == true)
        #expect(mock.lastCreatedTournamentId == "tm-1")
        #expect(mock.lastCreatedName == "Gamma")
    }

    @Test func createTeam_reloadsTeamsOnSuccess() async {
        let mock = MockTeamService()
        let vm = TeamViewModel(service: mock)

        await vm.createTeam(tournamentId: "tm-1", name: "Alpha")

        #expect(vm.teams.count == 1)
        #expect(vm.teams[0].name == "Alpha")
    }

    @Test func createTeam_setsErrorOnFailure() async {
        let mock = MockTeamService()
        mock.shouldThrow = TeamError(message: "Duplicate team name")
        let vm = TeamViewModel(service: mock)

        await vm.createTeam(tournamentId: "tm-1", name: "Alpha")

        #expect(vm.errorMessage != nil)
        #expect(vm.teams.isEmpty)
    }

    // MARK: - loadMyTeamId

    @Test func loadMyTeamId_exposesTeamIdWhenAssigned() async {
        let mockRoster = MockRosterService()
        mockRoster.stubbedMyTeamId = "t2"
        let vm = TeamViewModel(service: MockTeamService(), rosterService: mockRoster)

        await vm.loadMyTeamId(tournamentId: "tm-1", playerId: "p1")

        #expect(vm.myTeamId == "t2")
    }

    @Test func loadMyTeamId_isNilWhenNotAssigned() async {
        let mockRoster = MockRosterService()
        mockRoster.stubbedMyTeamId = nil
        let vm = TeamViewModel(service: MockTeamService(), rosterService: mockRoster)

        await vm.loadMyTeamId(tournamentId: "tm-1", playerId: "p1")

        #expect(vm.myTeamId == nil)
    }
}
