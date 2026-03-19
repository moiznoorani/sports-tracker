import { supabase } from '../lib/supabase'

export interface UserProfile {
  id: string
  display_name: string | null
  avatar_url: string | null
  privacy_setting: 'private' | 'public'
}

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('id, display_name, avatar_url, privacy_setting')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  },

  async updateProfile(userId: string, updates: { display_name?: string; privacy_setting?: 'private' | 'public' }): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
    if (error) throw error
  },

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })
    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)

    await supabase
      .from('users')
      .update({ avatar_url: data.publicUrl })
      .eq('id', userId)

    return data.publicUrl
  },
}
