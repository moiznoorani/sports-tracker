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
  invite_token?: string
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

  async getLeague(id: string): Promise<League> {
    const { data, error } = await supabase
      .from('leagues')
      .select('id, name, sport, visibility, lat, lng, invite_token')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async joinByToken(token: string): Promise<void> {
    const { error } = await supabase.rpc('join_league_by_token', { p_token: token })
    if (error) throw error
  },

  async createLeague(params: CreateLeagueParams): Promise<League> {
    const { data, error } = await supabase
      .from('leagues')
      .insert(params)
      .select('id, name, sport, visibility, lat, lng')
      .single()
    if (error) throw error
    return data
  },
}
