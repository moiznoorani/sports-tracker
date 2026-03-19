import Testing
import Foundation
import Supabase
@testable import SportsTracker

// Helpers to build minimal Supabase value types for stubbing
private func makeSession() -> Session {
    let json = """
    {
      "accessToken": "test-token",
      "tokenType": "bearer",
      "expiresIn": 3600,
      "expiresAt": 9999999999,
      "refreshToken": "test-refresh",
      "user": {
        "id": "00000000-0000-0000-0000-000000000001",
        "aud": "authenticated",
        "role": "authenticated",
        "email": "user@example.com",
        "createdAt": 1751328000,
        "updatedAt": 1751328000,
        "appMetadata": {},
        "userMetadata": {}
      }
    }
    """.data(using: .utf8)!
    return try! JSONDecoder().decode(Session.self, from: json)
}

struct AuthError: Error { let message: String }

@MainActor
struct AuthViewModelTests {

    // MARK: - loadSession

    @Test func loadSession_setsAuthenticatedWhenSessionExists() async {
        let mock = MockAuthService()
        mock.stubbedSession = makeSession()
        let vm = AuthViewModel(service: mock)

        await vm.loadSession()

        if case .authenticated = vm.state { } else {
            Issue.record("Expected .authenticated state")
        }
    }

    @Test func loadSession_setsUnauthenticatedWhenNoSession() async {
        let mock = MockAuthService()
        mock.stubbedSession = nil
        let vm = AuthViewModel(service: mock)

        await vm.loadSession()

        if case .unauthenticated = vm.state { } else {
            Issue.record("Expected .unauthenticated state")
        }
    }

    // MARK: - signUp

    @Test func signUp_callsServiceWithCredentials() async {
        let mock = MockAuthService()
        let vm = AuthViewModel(service: mock)

        await vm.signUp(email: "user@example.com", password: "password123")

        #expect(mock.signUpCalled == true)
        #expect(mock.lastEmail == "user@example.com")
        #expect(mock.lastPassword == "password123")
    }

    @Test func signUp_setsErrorMessageOnFailure() async {
        let mock = MockAuthService()
        mock.shouldThrow = AuthError(message: "Email taken")
        let vm = AuthViewModel(service: mock)

        await vm.signUp(email: "user@example.com", password: "password123")

        #expect(vm.errorMessage != nil)
    }

    @Test func signUp_clearsErrorMessageBeforeAttempt() async {
        let mock = MockAuthService()
        let vm = AuthViewModel(service: mock)

        // Seed a prior error
        mock.shouldThrow = AuthError(message: "prior error")
        await vm.signUp(email: "a@b.com", password: "pass")

        // Now succeed
        mock.shouldThrow = nil
        await vm.signUp(email: "a@b.com", password: "pass")

        #expect(vm.errorMessage == nil)
    }

    // MARK: - signIn

    @Test func signIn_callsServiceWithCredentials() async {
        let mock = MockAuthService()
        let vm = AuthViewModel(service: mock)

        await vm.signIn(email: "user@example.com", password: "password123")

        #expect(mock.signInCalled == true)
        #expect(mock.lastEmail == "user@example.com")
        #expect(mock.lastPassword == "password123")
    }

    @Test func signIn_setsAuthenticatedStateOnSuccess() async {
        let mock = MockAuthService()
        mock.stubbedSession = makeSession()
        let vm = AuthViewModel(service: mock)

        await vm.signIn(email: "user@example.com", password: "password123")

        if case .authenticated = vm.state { } else {
            Issue.record("Expected .authenticated after successful sign in")
        }
    }

    @Test func signIn_setsErrorMessageOnFailure() async {
        let mock = MockAuthService()
        mock.shouldThrow = AuthError(message: "Invalid credentials")
        let vm = AuthViewModel(service: mock)

        await vm.signIn(email: "user@example.com", password: "wrongpass")

        #expect(vm.errorMessage != nil)
    }

    // MARK: - signOut

    @Test func signOut_setsUnauthenticatedState() async {
        let mock = MockAuthService()
        mock.stubbedSession = makeSession()
        let vm = AuthViewModel(service: mock)
        await vm.loadSession()

        await vm.signOut()

        if case .unauthenticated = vm.state { } else {
            Issue.record("Expected .unauthenticated after sign out")
        }
    }

    @Test func signOut_callsService() async {
        let mock = MockAuthService()
        let vm = AuthViewModel(service: mock)

        await vm.signOut()

        #expect(mock.signOutCalled == true)
    }

    @Test func signOut_setsErrorMessageOnFailure() async {
        let mock = MockAuthService()
        mock.shouldThrow = AuthError(message: "Network error")
        let vm = AuthViewModel(service: mock)

        await vm.signOut()

        #expect(vm.errorMessage != nil)
    }

    // MARK: - resetPassword

    @Test func resetPassword_callsServiceWithEmail() async {
        let mock = MockAuthService()
        let vm = AuthViewModel(service: mock)

        let sent = await vm.resetPassword(email: "user@example.com")

        #expect(mock.resetPasswordCalled == true)
        #expect(mock.lastEmail == "user@example.com")
        #expect(sent == true)
    }

    @Test func resetPassword_returnsFalseAndSetsErrorOnFailure() async {
        let mock = MockAuthService()
        mock.shouldThrow = AuthError(message: "Too many requests")
        let vm = AuthViewModel(service: mock)

        let sent = await vm.resetPassword(email: "user@example.com")

        #expect(sent == false)
        #expect(vm.errorMessage != nil)
    }

    // MARK: - updatePassword

    @Test func updatePassword_callsServiceWithNewPassword() async {
        let mock = MockAuthService()
        let vm = AuthViewModel(service: mock)

        let updated = await vm.updatePassword("newpassword123")

        #expect(mock.updatePasswordCalled == true)
        #expect(mock.lastPassword == "newpassword123")
        #expect(updated == true)
    }

    @Test func updatePassword_returnsFalseAndSetsErrorOnFailure() async {
        let mock = MockAuthService()
        mock.shouldThrow = AuthError(message: "Weak password")
        let vm = AuthViewModel(service: mock)

        let updated = await vm.updatePassword("123")

        #expect(updated == false)
        #expect(vm.errorMessage != nil)
    }

    // MARK: - signInWithApple

    @Test func signInWithApple_callsServiceWithTokenAndNonce() async {
        let mock = MockAuthService()
        let vm = AuthViewModel(service: mock)

        await vm.signInWithApple(idToken: "apple-id-token", nonce: "random-nonce")

        #expect(mock.signInWithAppleCalled == true)
        #expect(mock.lastIdToken == "apple-id-token")
        #expect(mock.lastNonce == "random-nonce")
    }

    @Test func signInWithApple_setsAuthenticatedStateOnSuccess() async {
        let mock = MockAuthService()
        mock.stubbedSession = makeSession()
        let vm = AuthViewModel(service: mock)

        await vm.signInWithApple(idToken: "apple-id-token", nonce: "random-nonce")

        if case .authenticated = vm.state { } else {
            Issue.record("Expected .authenticated after Apple sign in")
        }
    }

    @Test func signInWithApple_setsErrorMessageOnFailure() async {
        let mock = MockAuthService()
        mock.shouldThrow = AuthError(message: "Invalid Apple token")
        let vm = AuthViewModel(service: mock)

        await vm.signInWithApple(idToken: "bad-token", nonce: "nonce")

        #expect(vm.errorMessage != nil)
    }

    @Test func signInWithApple_clearsErrorMessageBeforeAttempt() async {
        let mock = MockAuthService()
        mock.shouldThrow = AuthError(message: "prior error")
        let vm = AuthViewModel(service: mock)
        await vm.signInWithApple(idToken: "t", nonce: "n")

        mock.shouldThrow = nil
        mock.stubbedSession = makeSession()
        await vm.signInWithApple(idToken: "t", nonce: "n")

        #expect(vm.errorMessage == nil)
    }

    // MARK: - unauthenticated requests blocked

    @Test func isAuthenticated_falseWhenUnauthenticated() async {
        let mock = MockAuthService()
        let vm = AuthViewModel(service: mock)
        await vm.loadSession()

        #expect(vm.isAuthenticated == false)
    }

    @Test func isAuthenticated_trueWhenSessionExists() async {
        let mock = MockAuthService()
        mock.stubbedSession = makeSession()
        let vm = AuthViewModel(service: mock)
        await vm.loadSession()

        #expect(vm.isAuthenticated == true)
    }
}
