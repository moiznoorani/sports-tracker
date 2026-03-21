import { supabase } from '../lib/supabase'

export interface Team {
  id: string
  tournament_id: string
  name: string
  created_by: string
  created_at: string
}

export const teamService = {
  async getTeams(tournamentId: string): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('id, tournament_id, name, created_by, created_at')
      .eq('tournament_id', tournamentId)
      .order('created_at')
    if (error) throw error
    return data ?? []
  },

  async createTeam(tournamentId: string, name: string): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .insert({ tournament_id: tournamentId, name })
      .select('id, tournament_id, name, created_by, created_at')
      .single()
    if (error) throw error
    return data
  },
}
