import { supabase } from '../lib/supabase'

export interface Team {
  id: string
  tournament_id: string
  name: string
  captain_id: string | null
  created_by: string
  created_at: string
}

const TEAM_FIELDS = 'id, tournament_id, name, captain_id, created_by, created_at'

export const teamService = {
  async getTeams(tournamentId: string): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select(TEAM_FIELDS)
      .eq('tournament_id', tournamentId)
      .order('created_at')
    if (error) throw error
    return data ?? []
  },

  async getTeam(id: string): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .select(TEAM_FIELDS)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async createTeam(tournamentId: string, name: string): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .insert({ tournament_id: tournamentId, name })
      .select(TEAM_FIELDS)
      .single()
    if (error) throw error
    return data
  },
}
