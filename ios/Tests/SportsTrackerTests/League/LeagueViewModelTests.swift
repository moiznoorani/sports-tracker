import Testing
@testable import SportsTracker

struct LeagueError: Error { let message: String }

@MainActor
struct LeagueViewModelTests {

    // MARK: - loadLeagues

    @Test func loadLeagues_exposesEmptyArrayWhenNoneExist() async {
        let mock = MockLeagueService()
        let vm = LeagueViewModel(service: mock)

        await vm.loadLeagues()

        #expect(vm.leagues.isEmpty)
        #expect(vm.isLoading == false)
    }

    @Test func loadLeagues_exposesLeaguesFromService() async {
        let mock = MockLeagueService()
        mock.stubbedLeagues = [
            League(id: "1", name: "Tuesday Ultimate", sport: .ultimateFrisbee, visibility: .public, lat: nil, lng: nil),
            League(id: "2", name: "Weekend Hoops", sport: .basketball, visibility: .private, lat: nil, lng: nil),
        ]
        let vm = LeagueViewModel(service: mock)

        await vm.loadLeagues()

        #expect(vm.leagues.count == 2)
        #expect(vm.leagues[0].name == "Tuesday Ultimate")
        #expect(vm.leagues[1].name == "Weekend Hoops")
    }

    @Test func loadLeagues_setsErrorMessageOnFailure() async {
        let mock = MockLeagueService()
        mock.shouldThrow = LeagueError(message: "Network error")
        let vm = LeagueViewModel(service: mock)

        await vm.loadLeagues()

        #expect(vm.errorMessage != nil)
        #expect(vm.leagues.isEmpty)
    }

    // MARK: - createLeague

    @Test func createLeague_callsServiceWithCorrectParams() async {
        let mock = MockLeagueService()
        let vm = LeagueViewModel(service: mock)

        await vm.createLeague(name: "Friday Frisbee", sport: .ultimateFrisbee, visibility: .public)

        #expect(mock.createLeagueCalled == true)
        #expect(mock.lastCreatedName == "Friday Frisbee")
        #expect(mock.lastCreatedSport == .ultimateFrisbee)
        #expect(mock.lastCreatedVisibility == .public)
    }

    @Test func createLeague_reloadsLeaguesOnSuccess() async {
        let mock = MockLeagueService()
        let vm = LeagueViewModel(service: mock)

        await vm.createLeague(name: "New League", sport: .basketball, visibility: .private)

        #expect(vm.leagues.count == 1)
        #expect(vm.leagues[0].name == "New League")
    }

    @Test func createLeague_setsErrorMessageOnFailure() async {
        let mock = MockLeagueService()
        mock.shouldThrow = LeagueError(message: "Already exists")
        let vm = LeagueViewModel(service: mock)

        await vm.createLeague(name: "Bad", sport: .basketball, visibility: .private)

        #expect(vm.errorMessage != nil)
    }

    @Test func createLeague_defaultsVisibilityToPrivate() async {
        let mock = MockLeagueService()
        let vm = LeagueViewModel(service: mock)

        #expect(vm.newVisibility == .private)
    }
}
