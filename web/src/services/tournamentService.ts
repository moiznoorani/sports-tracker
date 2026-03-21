import { supabase } from '../lib/supabase'
import type { Sport } from './leagueService'

export type TournamentFormat = 'round_robin' | 'single_elimination'
export type TournamentStatus = 'draft' | 'published'

export interface Tournament {
  id: string
  league_id: string
  name: string
  format: TournamentFormat
  sport: Sport
  start_date: string
  end_date: string
  status: TournamentStatus
  created_by: string
}

export interface CreateTournamentParams {
  leagueId: string
  name: string
  format: TournamentFormat
  sport: Sport
  startDate: string
  endDate: string
}

export interface UpdateTournamentParams {
  name?: string
  format?: TournamentFormat
  sport?: Sport
  startDate?: string
  endDate?: string
}

export const tournamentService = {
  async getTournaments(leagueId: string): Promise<Tournament[]> {
    const { data, error } = await supabase
      .from('tournaments')
      .select('id, league_id, name, format, sport, start_date, end_date, status, created_by')
      .eq('league_id', leagueId)
      .order('start_date')
    if (error) throw error
    return data ?? []
  },

  async getTournament(id: string): Promise<Tournament> {
    const { data, error } = await supabase
      .from('tournaments')
      .select('id, league_id, name, format, sport, start_date, end_date, status, created_by')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async createTournament(params: CreateTournamentParams): Promise<Tournament> {
    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        league_id: params.leagueId,
        name: params.name,
        format: params.format,
        sport: params.sport,
        start_date: params.startDate,
        end_date: params.endDate,
      })
      .select('id, league_id, name, format, sport, start_date, end_date, status, created_by')
      .single()
    if (error) throw error
    return data
  },

  async publishTournament(id: string): Promise<Tournament> {
    const { data, error } = await supabase
      .from('tournaments')
      .update({ status: 'published' })
      .eq('id', id)
      .select('id, league_id, name, format, sport, start_date, end_date, status, created_by')
      .single()
    if (error) throw error
    return data
  },

  async updateTournament(id: string, params: UpdateTournamentParams): Promise<Tournament> {
    const patch: Record<string, unknown> = {}
    if (params.name !== undefined) patch.name = params.name
    if (params.format !== undefined) patch.format = params.format
    if (params.sport !== undefined) patch.sport = params.sport
    if (params.startDate !== undefined) patch.start_date = params.startDate
    if (params.endDate !== undefined) patch.end_date = params.endDate

    const { data, error } = await supabase
      .from('tournaments')
      .update(patch)
      .eq('id', id)
      .select('id, league_id, name, format, sport, start_date, end_date, status, created_by')
      .single()
    if (error) throw error
    return data
  },
}
