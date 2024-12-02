// app/actions/updateProgress.ts
'use server'

import { createClient } from '../utils/supabase/server'

type UpdateResult = {
  success: boolean
  completed_puzzles?: number
  error?: string
}

export async function updatePuzzleCompletion(userId: string): Promise<UpdateResult> {
  try {
    const supabase = await createClient()
    
    // First, get current progress
    const { data: currentProgress, error: fetchError } = await supabase
      .from('user_progress')
      .select('completed_puzzles')
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      // If no record exists, create one
      if (fetchError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('user_progress')
          .insert([{ user_id: userId, completed_puzzles: 1 }])
          .select()
          .single()

        if (insertError) {
          console.error('Insert error:', insertError)
          throw insertError
        }
        return { success: true, completed_puzzles: 1 }
      }
      console.error('Fetch error:', fetchError)
      throw fetchError
    }

    // Update existing record
    const { data, error: updateError } = await supabase
      .from('user_progress')
      .update({ 
        completed_puzzles: (currentProgress.completed_puzzles || 0) + 1 
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }

    return { 
      success: true, 
      completed_puzzles: data?.completed_puzzles 
    }

  } catch (error) {
    console.error('Error updating puzzle completion:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

// Test function to force completion
export async function testPuzzleCompletion(userId: string): Promise<UpdateResult> {
  return updatePuzzleCompletion(userId)
}

