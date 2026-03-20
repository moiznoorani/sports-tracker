import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { profileService } from '../../services/profileService'

export function ProfilePage() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [privacy, setPrivacy] = useState<'private' | 'public'>('private')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) return
    profileService.getProfile(user.id).then(p => {
      if (!p) return
      setDisplayName(p.display_name ?? '')
      setPrivacy(p.privacy_setting)
    })
  }, [user])

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError(null)
    setSaving(true)
    try {
      await profileService.updateProfile(user.id, { display_name: displayName, privacy_setting: privacy })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    try {
      await profileService.uploadAvatar(user.id, file)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div>
      <h1>Profile</h1>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        aria-label="Upload profile photo"
        style={{ display: 'none' }}
        onChange={handleAvatarChange}
      />
      <form onSubmit={handleSave}>
        <div>
          <label htmlFor="displayName">Display name</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="privacy">Profile visibility</label>
          <select id="privacy" value={privacy} onChange={e => setPrivacy(e.target.value as 'private' | 'public')}>
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </div>
        {error && <p role="alert">{error}</p>}
        {saved && <p role="status">Saved</p>}
        <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </form>
    </div>
  )
}
