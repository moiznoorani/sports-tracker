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
            League(id: "1", name: "Tuesday Ultimate", sport: .ultimateFrisbee, visibility: .public),
            League(id: "2", name: "Weekend Hoops", sport: .basketball, visibility: .private),
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

    // MARK: - loadLeague

    @Test func loadLeague_exposesSelectedLeagueWithToken() async {
        let mock = MockLeagueService()
        mock.stubbedLeague = League(id: "league-1", name: "Tuesday Ultimate", sport: .ultimateFrisbee, visibility: .private, inviteToken: "tok-abc")
        let vm = LeagueViewModel(service: mock)

        await vm.loadLeague(id: "league-1")

        #expect(vm.selectedLeague?.name == "Tuesday Ultimate")
        #expect(vm.selectedLeague?.inviteToken == "tok-abc")
    }

    @Test func loadLeague_setsErrorMessageOnFailure() async {
        let mock = MockLeagueService()
        mock.shouldThrow = LeagueError(message: "Not found")
        let vm = LeagueViewModel(service: mock)

        await vm.loadLeague(id: "bad-id")

        #expect(vm.errorMessage != nil)
        #expect(vm.selectedLeague == nil)
    }

    // MARK: - joinByToken

    @Test func joinByToken_callsServiceWithToken() async {
        let mock = MockLeagueService()
        let vm = LeagueViewModel(service: mock)
        vm.joinToken = "tok-abc"

        await vm.joinByToken()

        #expect(mock.joinByTokenCalled == true)
        #expect(mock.lastJoinToken == "tok-abc")
    }

    @Test func joinByToken_setsJoinSuccessOnSuccess() async {
        let mock = MockLeagueService()
        let vm = LeagueViewModel(service: mock)
        vm.joinToken = "tok-abc"

        await vm.joinByToken()

        #expect(vm.joinSuccess == true)
    }

    @Test func joinByToken_reloadsLeaguesOnSuccess() async {
        let mock = MockLeagueService()
        mock.stubbedLeagues = [
            League(id: "league-1", name: "Tuesday Ultimate", sport: .ultimateFrisbee, visibility: .private),
        ]
        let vm = LeagueViewModel(service: mock)
        vm.joinToken = "tok-abc"

        await vm.joinByToken()

        #expect(vm.leagues.count == 1)
        #expect(vm.leagues[0].name == "Tuesday Ultimate")
    }

    @Test func joinByToken_setsErrorMessageOnFailure() async {
        let mock = MockLeagueService()
        mock.shouldThrow = LeagueError(message: "Invalid invite token")
        let vm = LeagueViewModel(service: mock)
        vm.joinToken = "bad-token"

        await vm.joinByToken()

        #expect(vm.errorMessage != nil)
        #expect(vm.joinSuccess == false)
    }

    // MARK: - loadMembers

    @Test func loadMembers_exposesMembersFromService() async {
        let mock = MockLeagueService()
        mock.stubbedMembers = [
            LeagueMember(userId: "u1", role: "organizer", displayName: "Alice", avatarUrl: nil),
            LeagueMember(userId: "u2", role: "member", displayName: "Bob", avatarUrl: nil),
        ]
        let vm = LeagueViewModel(service: mock)

        await vm.loadMembers(leagueId: "league-1")

        #expect(vm.members.count == 2)
        #expect(vm.members[0].displayName == "Alice")
        #expect(vm.members[1].displayName == "Bob")
    }

    @Test func loadMembers_setsErrorMessageOnFailure() async {
        let mock = MockLeagueService()
        mock.shouldThrow = LeagueError(message: "Not authorized")
        let vm = LeagueViewModel(service: mock)

        await vm.loadMembers(leagueId: "league-1")

        #expect(vm.errorMessage != nil)
        #expect(vm.members.isEmpty)
    }

    // MARK: - removeMember

    @Test func removeMember_callsServiceWithCorrectArgs() async {
        let mock = MockLeagueService()
        let vm = LeagueViewModel(service: mock)

        await vm.removeMember(leagueId: "league-1", userId: "user-bob")

        #expect(mock.removeMemberCalled == true)
        #expect(mock.lastRemovedLeagueId == "league-1")
        #expect(mock.lastRemovedUserId == "user-bob")
    }

    @Test func removeMember_reloadsMembersOnSuccess() async {
        let mock = MockLeagueService()
        mock.stubbedMembers = [
            LeagueMember(userId: "u1", role: "organizer", displayName: "Alice", avatarUrl: nil),
        ]
        let vm = LeagueViewModel(service: mock)

        await vm.removeMember(leagueId: "league-1", userId: "user-bob")

        #expect(vm.members.count == 1)
        #expect(vm.members[0].displayName == "Alice")
    }

    @Test func removeMember_setsErrorMessageOnFailure() async {
        let mock = MockLeagueService()
        mock.shouldThrow = LeagueError(message: "Not authorized")
        let vm = LeagueViewModel(service: mock)

        await vm.removeMember(leagueId: "league-1", userId: "user-bob")

        #expect(vm.errorMessage != nil)
    }
}
