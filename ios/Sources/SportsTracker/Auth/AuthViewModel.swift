import SwiftUI
import Supabase

@MainActor
@Observable
final class AuthViewModel {
    enum State {
        case loading
        case unauthenticated
        case authenticated(Session)
    }

    private(set) var state: State = .loading
    private(set) var errorMessage: String?

    private let service: any AuthServiceProtocol

    init(service: any AuthServiceProtocol = AuthService()) {
        self.service = service
    }

    var isAuthenticated: Bool {
        if case .authenticated = state { return true }
        return false
    }

    // MARK: - Session

    func loadSession() async {
        let session = await service.currentSession
        state = session.map { .authenticated($0) } ?? .unauthenticated
    }

    // MARK: - Actions

    func signUp(email: String, password: String) async {
        errorMessage = nil
        do {
            try await service.signUp(email: email, password: password)
            // After sign-up, session may not exist until email confirmation.
            // State stays unauthenticated until confirmed.
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func signIn(email: String, password: String) async {
        errorMessage = nil
        do {
            try await service.signIn(email: email, password: password)
            await loadSession()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func signOut() async {
        errorMessage = nil
        do {
            try await service.signOut()
            state = .unauthenticated
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func resetPassword(email: String) async -> Bool {
        errorMessage = nil
        do {
            try await service.resetPassword(email: email)
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }

    func updatePassword(_ newPassword: String) async -> Bool {
        errorMessage = nil
        do {
            try await service.updatePassword(newPassword)
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }
}
