import SwiftUI
import PhotosUI

public struct ProfileView: View {
    @Bindable var vm: ProfileViewModel
    let userId: String

    @State private var photosItem: PhotosPickerItem?
    @State private var saved = false

    public init(vm: ProfileViewModel, userId: String) {
        self.vm = vm
        self.userId = userId
    }

    public var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Avatar card
                GlassCard {
                    HStack(spacing: 16) {
                        // Avatar
                        Group {
                            if let url = vm.avatarURL, let imageURL = URL(string: url) {
                                AsyncImage(url: imageURL) { image in
                                    image.resizable().scaledToFill()
                                } placeholder: {
                                    avatarPlaceholder
                                }
                                .frame(width: 64, height: 64)
                                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                            } else {
                                avatarPlaceholder
                            }
                        }

                        VStack(alignment: .leading, spacing: 3) {
                            Text(vm.displayName.isEmpty ? "No display name" : vm.displayName)
                                .font(.system(size: 17, weight: .semibold))
                                .foregroundStyle(AppTheme.primaryText)
                                .lineLimit(1)
                            GlassTag(vm.privacySetting == .public ? "Public" : "Private",
                                     color: vm.privacySetting == .public ? AppTheme.accentLight : AppTheme.subtleText)
                        }

                        Spacer()

                        PhotosPicker(selection: $photosItem, matching: .images) {
                            changePhotoLabel
                        }
                        .onChange(of: photosItem) { _, newItem in
                            Task {
                                guard let newItem,
                                      let data = try? await newItem.loadTransferable(type: Data.self)
                                else { return }
                                await vm.uploadAvatar(data: data, fileExtension: "jpg")
                            }
                        }
                    }
                    .padding(18)
                }

                // Edit form
                GlassCard {
                    VStack(spacing: 20) {
                        GlassTextField("Display Name", text: $vm.displayName, placeholder: "How others see you", autocorrection: false)

                        VStack(alignment: .leading, spacing: 6) {
                            Text("PROFILE VISIBILITY")
                                .font(.system(size: 11, weight: .semibold))
                                .tracking(1.2)
                                .foregroundStyle(AppTheme.subtleText)

                            Picker("Profile visibility", selection: $vm.privacySetting) {
                                Text("Private").tag(PrivacySetting.private)
                                Text("Public").tag(PrivacySetting.public)
                            }
                            .pickerStyle(.segmented)
                            .tint(AppTheme.accent)
                        }

                        if let error = vm.errorMessage {
                            ErrorBanner(error)
                        }

                        Button("Save changes") {
                            Task {
                                await vm.updateDisplayName(vm.displayName)
                                await vm.updatePrivacy(vm.privacySetting)
                                if vm.errorMessage == nil { saved = true }
                            }
                        }
                        .buttonStyle(PrimaryButtonStyle())
                    }
                    .padding(20)
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 24)
        }
        .navigationTitle("Profile")
        #if os(iOS)
        .navigationBarTitleDisplayMode(.large)
        #endif
        .background(AppTheme.backgroundGradient.ignoresSafeArea())
        .task { await vm.loadProfile(userId: userId) }
        .alert("Saved", isPresented: $saved) {
            Button("OK", role: .cancel) {}
        }
    }

    private var changePhotoLabel: some View {
        Text("Change")
            .font(.footnote)
            .fontWeight(.semibold)
            .foregroundStyle(AppTheme.accentLight)
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background {
                Capsule().fill(AppTheme.accent.opacity(0.15))
                    .overlay(Capsule().strokeBorder(AppTheme.accent.opacity(0.25), lineWidth: 0.5))
            }
    }

    private var avatarPlaceholder: some View {
        RoundedRectangle(cornerRadius: 16, style: .continuous)
            .fill(AppTheme.accentGradient)
            .frame(width: 64, height: 64)
            .overlay(
                Text(vm.displayName.isEmpty ? "?" : String(vm.displayName.prefix(1)).uppercased())
                    .font(.system(size: 24, weight: .bold))
                    .foregroundStyle(.white)
            )
    }
}

#Preview {
    NavigationStack {
        ProfileView(
            vm: ProfileViewModel(service: PreviewProfileService()),
            userId: "preview-user"
        )
    }
}
