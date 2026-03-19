import Supabase
@testable import SportsTracker

final class MockAuthService: AuthServiceProtocol, @unchecked Sendable {
    var stubbedSession: Session? = nil
    var shouldThrow: Error? = nil

    var signUpCalled = false
    var signInCalled = false
    var signOutCalled = false
    var resetPasswordCalled = false
    var updatePasswordCalled = false

    var lastEmail: String?
    var lastPassword: String?

    var currentSession: Session? {
        get async { stubbedSession }
    }

    func signUp(email: String, password: String) async throws {
        signUpCalled = true
        lastEmail = email
        lastPassword = password
        if let error = shouldThrow { throw error }
    }

    func signIn(email: String, password: String) async throws {
        signInCalled = true
        lastEmail = email
        lastPassword = password
        if let error = shouldThrow { throw error }
    }

    func signOut() async throws {
        signOutCalled = true
        if let error = shouldThrow { throw error }
        stubbedSession = nil
    }

    func resetPassword(email: String) async throws {
        resetPasswordCalled = true
        lastEmail = email
        if let error = shouldThrow { throw error }
    }

    func updatePassword(_ newPassword: String) async throws {
        updatePasswordCalled = true
        lastPassword = newPassword
        if let error = shouldThrow { throw error }
    }
}
