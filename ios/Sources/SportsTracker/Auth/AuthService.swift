import Supabase
import Foundation

/// Errors surfaced by AuthService to callers.
enum AuthServiceError: Error, LocalizedError {
    case signUpFailed(Error)
    case signInFailed(Error)
    case signInWithAppleFailed(Error)
    case signOutFailed(Error)
    case resetPasswordFailed(Error)
    case updatePasswordFailed(Error)
    case sessionRefreshFailed(Error)

    var errorDescription: String? {
        switch self {
        case .signUpFailed(let e):          return e.localizedDescription
        case .signInFailed(let e):          return e.localizedDescription
        case .signInWithAppleFailed(let e): return e.localizedDescription
        case .signOutFailed(let e):         return e.localizedDescription
        case .resetPasswordFailed(let e):   return e.localizedDescription
        case .updatePasswordFailed(let e):  return e.localizedDescription
        case .sessionRefreshFailed(let e):  return e.localizedDescription
        }
    }
}

/// Protocol so AuthService can be mocked in tests.
protocol AuthServiceProtocol: Sendable {
    var currentSession: Session? { get async }
    func signUp(email: String, password: String) async throws
    func signIn(email: String, password: String) async throws
    func signInWithApple(idToken: String, nonce: String) async throws
    func signOut() async throws
    func resetPassword(email: String) async throws
    func updatePassword(_ newPassword: String) async throws
}

/// Live implementation backed by Supabase Auth.
final class AuthService: AuthServiceProtocol {
    private let client: SupabaseClient

    init(client: SupabaseClient = .shared) {
        self.client = client
    }

    var currentSession: Session? {
        get async {
            try? await client.auth.session
        }
    }

    func signUp(email: String, password: String) async throws {
        do {
            try await client.auth.signUp(email: email, password: password)
        } catch {
            throw AuthServiceError.signUpFailed(error)
        }
    }

    func signIn(email: String, password: String) async throws {
        do {
            try await client.auth.signIn(email: email, password: password)
        } catch {
            throw AuthServiceError.signInFailed(error)
        }
    }

    func signInWithApple(idToken: String, nonce: String) async throws {
        do {
            try await client.auth.signInWithIdToken(
                credentials: .init(provider: .apple, idToken: idToken, nonce: nonce)
            )
        } catch {
            throw AuthServiceError.signInWithAppleFailed(error)
        }
    }

    func signOut() async throws {
        do {
            try await client.auth.signOut()
        } catch {
            throw AuthServiceError.signOutFailed(error)
        }
    }

    func resetPassword(email: String) async throws {
        do {
            try await client.auth.resetPasswordForEmail(email)
        } catch {
            throw AuthServiceError.resetPasswordFailed(error)
        }
    }

    func updatePassword(_ newPassword: String) async throws {
        do {
            try await client.auth.update(user: UserAttributes(password: newPassword))
        } catch {
            throw AuthServiceError.updatePasswordFailed(error)
        }
    }
}
