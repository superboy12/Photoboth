import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: {
          code: string
          host_id: string
          selected_frame: string | null
          selected_background: BackgroundConfig | null
          current_take: number
          session_status: SessionStatus
          countdown_start_at: string | null
          max_participants: number
          expires_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['rooms']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['rooms']['Insert']>
      }
      participants: {
        Row: {
          id: string
          room_code: string
          name: string
          is_host: boolean
          is_ready: boolean
          joined_at: string
        }
        Insert: Omit<Database['public']['Tables']['participants']['Row'], 'joined_at'>
        Update: Partial<Database['public']['Tables']['participants']['Insert']>
      }
      room_events: {
        Row: {
          id: string
          room_code: string
          event_type: string
          payload: Record<string, unknown>
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['room_events']['Row'], 'id' | 'created_at'>
      }
    }
  }
}

export type SessionStatus = 'waiting' | 'frame_select' | 'background_select' | 'countdown' | 'capturing' | 'review' | 'editing' | 'complete'
export type BackgroundConfig = {
  type: 'original' | 'solid' | 'gradient' | 'image'
  value: string
}
