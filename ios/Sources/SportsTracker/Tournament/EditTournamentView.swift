import SwiftUI

public struct EditTournamentView: View {
    @Bindable var vm: TournamentViewModel
    let tournament: Tournament
    let leagueId: String
    @Environment(\.dismiss) private var dismiss

    @State private var name: String
    @State private var format: TournamentFormat
    @State private var sport: Sport
    @State private var startDate: Date
    @State private var endDate: Date
    @State private var submitting = false

    private let formatter: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f
    }()

    public init(vm: TournamentViewModel, tournament: Tournament, leagueId: String) {
        self.vm = vm
        self.tournament = tournament
        self.leagueId = leagueId
        _name = State(initialValue: tournament.name)
        _format = State(initialValue: tournament.format)
        _sport = State(initialValue: tournament.sport)
        _startDate = State(initialValue: DateFormatter().date(from: tournament.startDate) ?? Date())
        _endDate = State(initialValue: DateFormatter().date(from: tournament.endDate) ?? Date())
    }

    public var body: some View {
        ZStack {
            AppTheme.backgroundGradient.ignoresSafeArea()
            ScrollView {
                VStack(spacing: 20) {
                    if let error = vm.errorMessage {
                        ErrorBanner(error).padding(.horizontal, 20)
                    }

                    GlassCard {
                        VStack(spacing: 20) {
                            GlassTextField("Name", text: $name, placeholder: "Tournament name")

                            VStack(alignment: .leading, spacing: 8) {
                                Text("FORMAT")
                                    .font(.system(size: 11, weight: .semibold))
                                    .tracking(1.2)
                                    .foregroundStyle(AppTheme.subtleText)
                                Picker("Format", selection: $format) {
                                    ForEach(TournamentFormat.allCases, id: \.self) { f in
                                        Text(f.displayName).tag(f)
                                    }
                                }
                                .pickerStyle(.segmented)
                            }

                            VStack(alignment: .leading, spacing: 8) {
                                Text("SPORT")
                                    .font(.system(size: 11, weight: .semibold))
                                    .tracking(1.2)
                                    .foregroundStyle(AppTheme.subtleText)
                                Picker("Sport", selection: $sport) {
                                    ForEach(Sport.allCases, id: \.self) { s in
                                        Text(s.displayName).tag(s)
                                    }
                                }
                                .pickerStyle(.segmented)
                            }

                            VStack(alignment: .leading, spacing: 8) {
                                Text("START DATE")
                                    .font(.system(size: 11, weight: .semibold))
                                    .tracking(1.2)
                                    .foregroundStyle(AppTheme.subtleText)
                                DatePicker("Start Date", selection: $startDate, displayedComponents: .date)
                                    .datePickerStyle(.compact)
                                    .colorScheme(.dark)
                                    .labelsHidden()
                            }

                            VStack(alignment: .leading, spacing: 8) {
                                Text("END DATE")
                                    .font(.system(size: 11, weight: .semibold))
                                    .tracking(1.2)
                                    .foregroundStyle(AppTheme.subtleText)
                                DatePicker("End Date", selection: $endDate, in: startDate..., displayedComponents: .date)
                                    .datePickerStyle(.compact)
                                    .colorScheme(.dark)
                                    .labelsHidden()
                            }
                        }
                        .padding(20)
                    }
                    .padding(.horizontal, 20)

                    Button {
                        Task { await submit() }
                    } label: {
                        Group {
                            if submitting {
                                ProgressView().tint(.white)
                            } else {
                                Text("Save Changes")
                                    .font(.system(size: 16, weight: .semibold))
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                    }
                    .buttonStyle(PrimaryButtonStyle())
                    .padding(.horizontal, 20)
                    .disabled(name.isEmpty || submitting)
                }
                .padding(.vertical, 16)
            }
        }
        .navigationTitle("Edit Tournament")
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
    }

    private func submit() async {
        submitting = true
        vm.errorMessage = nil
        await vm.updateTournament(
            id: tournament.id,
            leagueId: leagueId,
            name: name,
            format: format,
            sport: sport,
            startDate: formatter.string(from: startDate),
            endDate: formatter.string(from: endDate)
        )
        submitting = false
        if vm.errorMessage == nil {
            dismiss()
        }
    }
}
