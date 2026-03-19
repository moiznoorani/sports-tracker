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
        Form {
            Section("Display Name") {
                TextField("Display name", text: $vm.displayName)
                    .autocorrectionDisabled()
            }

            Section("Profile Photo") {
                PhotosPicker(selection: $photosItem, matching: .images) {
                    Label("Choose Photo", systemImage: "person.crop.circle.badge.plus")
                }
                .onChange(of: photosItem) { _, newItem in
                    Task {
                        guard let newItem,
                              let data = try? await newItem.loadTransferable(type: Data.self)
                        else { return }
                        await vm.uploadAvatar(data: data, fileExtension: "jpg")
                    }
                }

                if let url = vm.avatarURL, let imageURL = URL(string: url) {
                    AsyncImage(url: imageURL) { image in
                        image.resizable().scaledToFill()
                    } placeholder: {
                        ProgressView()
                    }
                    .frame(width: 80, height: 80)
                    .clipShape(Circle())
                }
            }

            Section("Visibility") {
                Picker("Profile visibility", selection: $vm.privacySetting) {
                    Text("Private").tag(PrivacySetting.private)
                    Text("Public").tag(PrivacySetting.public)
                }
                .pickerStyle(.segmented)
            }

            if let error = vm.errorMessage {
                Section {
                    Text(error).foregroundStyle(.red)
                }
            }

            Section {
                Button("Save") {
                    Task {
                        await vm.updateDisplayName(vm.displayName)
                        await vm.updatePrivacy(vm.privacySetting)
                        saved = true
                    }
                }
            }
        }
        .navigationTitle("Profile")
        .task { await vm.loadProfile(userId: userId) }
        .alert("Saved", isPresented: $saved) {
            Button("OK", role: .cancel) {}
        }
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
