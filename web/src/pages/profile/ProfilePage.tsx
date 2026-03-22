import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { profileService } from '../../services/profileService'
import { GlassCard } from '../../components/ui/GlassCard'
import { GlassInput } from '../../components/ui/GlassInput'
import { GlassSelect } from '../../components/ui/GlassSelect'
import { Button } from '../../components/ui/Button'
import { ErrorBanner } from '../../components/ui/ErrorBanner'

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
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Profile</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-subtle)' }}>Manage your account settings</p>
      </div>

      {/* Avatar */}
      <GlassCard className="mb-4" padding="p-5">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #7B3F85, #9B5AA6)' }}
          >
            <span className="text-white text-xl font-bold">
              {displayName ? displayName[0].toUpperCase() : user?.email?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{displayName || 'No display name'}</p>
            <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-subtle)' }}>{user?.email}</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            aria-label="Upload profile photo"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
          <Button variant="glass" size="sm" onClick={() => fileRef.current?.click()}>
            Change
          </Button>
        </div>
      </GlassCard>

      <GlassCard padding="p-6">
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <GlassInput
            id="displayName"
            label="Display Name"
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="How others see you"
          />

          <GlassSelect
            id="privacy"
            label="Profile Visibility"
            value={privacy}
            onChange={e => setPrivacy(e.target.value as 'private' | 'public')}
            options={[
              { value: 'private', label: 'Private' },
              { value: 'public', label: 'Public' },
            ]}
          />

          {error && <ErrorBanner message={error} size="xs" />}

          {saved && (
            <p role="status" className="text-xs px-3 py-2 rounded-lg text-center" style={{ background: 'rgba(52,168,83,0.1)', color: '#4ade80' }}>
              Saved
            </p>
          )}

          <Button type="submit" fullWidth loading={saving} disabled={saving}>
            Save changes
          </Button>
        </form>
      </GlassCard>
    </div>
  )
}
