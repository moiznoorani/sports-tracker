import { supabase } from '../lib/supabase'

export interface RosterPlayer {
  id: string
  team_id: string
  tournament_id: string
  player_id: string
  joined_at: string
  display_name: string | null
  avatar_url: string | null
}

export const rosterService = {
  async getRoster(teamId: string): Promise<RosterPlayer[]> {
    const { data, error } = await supabase
      .from('roster_entries')
      .select('id, team_id, tournament_id, player_id, joined_at, users(display_name, avatar_url)')
      .eq('team_id', teamId)
      .order('joined_at')
    if (error) throw error
    return (data ?? []).map(row => {
      const u = row.users as { display_name: string | null; avatar_url: string | null } | null
      return { ...row, users: undefined, display_name: u?.display_name ?? null, avatar_url: u?.avatar_url ?? null }
    })
  },

  async assignPlayer(teamId: string, tournamentId: string, playerId: string): Promise<RosterPlayer> {
    const { data, error } = await supabase
      .from('roster_entries')
      .insert({ team_id: teamId, tournament_id: tournamentId, player_id: playerId })
      .select('id, team_id, tournament_id, player_id, joined_at')
      .single()
    if (error) throw error
    return { ...data, display_name: null, avatar_url: null }
  },

  async removePlayer(id: string): Promise<void> {
    const { error } = await supabase
      .from('roster_entries')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async setCaptain(teamId: string, captainId: string): Promise<void> {
    const { error } = await supabase
      .from('teams')
      .update({ captain_id: captainId })
      .eq('id', teamId)
    if (error) throw error
  },

  async getMyRosterEntry(tournamentId: string, playerId: string): Promise<{ team_id: string } | null> {
    const { data } = await supabase
      .from('roster_entries')
      .select('team_id')
      .eq('tournament_id', tournamentId)
      .eq('player_id', playerId)
      .maybeSingle()
    return data
  },
}
