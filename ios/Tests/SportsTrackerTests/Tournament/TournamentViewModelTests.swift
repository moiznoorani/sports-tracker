import Testing
@testable import SportsTracker

struct TournamentError: Error { let message: String }

@MainActor
struct TournamentViewModelTests {

    // MARK: - loadTournaments

    @Test func loadTournaments_exposesTournamentsFromService() async {
        let mock = MockTournamentService()
        mock.stubbedTournaments = [
            Tournament(id: "t1", leagueId: "lg-1", name: "Spring Open",
                       format: .roundRobin, sport: .ultimateFrisbee,
                       startDate: "2026-04-01", endDate: "2026-04-02"),
        ]
        let vm = TournamentViewModel(service: mock)

        await vm.loadTournaments(leagueId: "lg-1")

        #expect(vm.tournaments.count == 1)
        #expect(vm.tournaments[0].name == "Spring Open")
        #expect(vm.isLoading == false)
    }

    @Test func loadTournaments_setsErrorOnFailure() async {
        let mock = MockTournamentService()
        mock.shouldThrow = TournamentError(message: "Network error")
        let vm = TournamentViewModel(service: mock)

        await vm.loadTournaments(leagueId: "lg-1")

        #expect(vm.errorMessage != nil)
        #expect(vm.tournaments.isEmpty)
    }

    // MARK: - loadTournament

    @Test func loadTournament_exposesSelectedTournament() async {
        let mock = MockTournamentService()
        mock.stubbedTournament = Tournament(
            id: "t1", leagueId: "lg-1", name: "Spring Open",
            format: .roundRobin, sport: .ultimateFrisbee,
            startDate: "2026-04-01", endDate: "2026-04-02", status: .draft
        )
        let vm = TournamentViewModel(service: mock)

        await vm.loadTournament(id: "t1")

        #expect(vm.selectedTournament?.name == "Spring Open")
        #expect(vm.selectedTournament?.status == .draft)
    }

    @Test func loadTournament_setsErrorOnFailure() async {
        let mock = MockTournamentService()
        mock.shouldThrow = TournamentError(message: "Not found")
        let vm = TournamentViewModel(service: mock)

        await vm.loadTournament(id: "bad-id")

        #expect(vm.errorMessage != nil)
        #expect(vm.selectedTournament == nil)
    }

    // MARK: - createTournament

    @Test func createTournament_callsServiceWithCorrectParams() async {
        let mock = MockTournamentService()
        let vm = TournamentViewModel(service: mock)

        await vm.createTournament(leagueId: "lg-1", name: "Summer Classic",
                                   format: .singleElimination, sport: .basketball,
                                   startDate: "2026-06-01", endDate: "2026-06-02")

        #expect(mock.createCalled == true)
        #expect(mock.lastCreatedName == "Summer Classic")
        #expect(mock.lastCreatedFormat == .singleElimination)
        #expect(mock.lastCreatedSport == .basketball)
    }

    @Test func createTournament_reloadsTournamentsOnSuccess() async {
        let mock = MockTournamentService()
        let vm = TournamentViewModel(service: mock)

        await vm.createTournament(leagueId: "lg-1", name: "New Tournament",
                                   format: .roundRobin, sport: .ultimateFrisbee,
                                   startDate: "2026-04-01", endDate: "2026-04-01")

        #expect(vm.tournaments.count == 1)
        #expect(vm.tournaments[0].name == "New Tournament")
    }

    @Test func createTournament_setsErrorOnFailure() async {
        let mock = MockTournamentService()
        mock.shouldThrow = TournamentError(message: "Not an organizer")
        let vm = TournamentViewModel(service: mock)

        await vm.createTournament(leagueId: "lg-1", name: "Bad", format: .roundRobin,
                                   sport: .ultimateFrisbee, startDate: "2026-04-01", endDate: "2026-04-01")

        #expect(vm.errorMessage != nil)
    }

    // MARK: - updateTournament

    @Test func updateTournament_callsServiceWithId() async {
        let mock = MockTournamentService()
        let vm = TournamentViewModel(service: mock)

        await vm.updateTournament(id: "t1", leagueId: "lg-1", name: "Renamed",
                                   format: nil, sport: nil, startDate: nil, endDate: nil)

        #expect(mock.updateCalled == true)
        #expect(mock.lastUpdatedId == "t1")
    }

    @Test func updateTournament_setsErrorOnFailure() async {
        let mock = MockTournamentService()
        mock.shouldThrow = TournamentError(message: "Not authorized")
        let vm = TournamentViewModel(service: mock)

        await vm.updateTournament(id: "t1", leagueId: "lg-1", name: nil,
                                   format: nil, sport: nil, startDate: nil, endDate: nil)

        #expect(vm.errorMessage != nil)
    }
}
