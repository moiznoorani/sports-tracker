import { supabase } from '../lib/supabase'

export type Sport = 'ultimate_frisbee' | 'basketball'
export type Visibility = 'private' | 'public'

export interface League {
  id: string
  name: string
  sport: Sport
  visibility: Visibility
  lat?: number | null
  lng?: number | null
}

export interface CreateLeagueParams {
  name: string
  sport: Sport
  visibility: Visibility
  lat?: number
  lng?: number
}

export const leagueService = {
  async getMyLeagues(): Promise<League[]> {
    const { data, error } = await supabase
      .from('leagues')
      .select('id, name, sport, visibility, lat, lng')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async createLeague(params: CreateLeagueParams): Promise<League> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { data, error } = await supabase
      .from('leagues')
      .insert({ ...params, created_by: user.id })
      .select('id, name, sport, visibility, lat, lng')
      .single()
    if (error) throw error
    return data
  },
}
