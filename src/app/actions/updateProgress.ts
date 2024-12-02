// app/actions/updateProgress.ts
'use server'

import { createClient } from '../utils/supabase/server'

type UpdateResult = {
  success: boolean
  completed_puzzles?: number
  easy_completed?: number
  medium_completed?: number
  hard_completed?: number
  error?: string
}

export async function updatePuzzleCompletion(
  userId: string, 
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<UpdateResult> {
  try {
    const supabase = await createClient()
    
    // First, get current progress
    const { data: currentProgress, error: fetchError } = await supabase
      .from('user_progress')
      .select('completed_puzzles, easy_completed, medium_completed, hard_completed')
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      // If no record exists, create one
      if (fetchError.code === 'PGRST116') {
        const initialData = {
          user_id: userId,
          easy_completed: difficulty === 'easy' ? 1 : 0,
          medium_completed: difficulty === 'medium' ? 1 : 0,
          hard_completed: difficulty === 'hard' ? 1 : 0,
          completed_puzzles: 1
        }

        const { error: insertError } = await supabase
          .from('user_progress')
          .insert([initialData])
          .select()
          .single()

        if (insertError) {
          console.error('Insert error:', insertError)
          throw insertError
        }
        return { 
          success: true, 
          ...initialData
        }
      }
      console.error('Fetch error:', fetchError)
      throw fetchError
    }

    // Update existing record
    const updatedData = {
      completed_puzzles: (currentProgress.completed_puzzles || 0) + 1,
      easy_completed: currentProgress.easy_completed + (difficulty === 'easy' ? 1 : 0),
      medium_completed: currentProgress.medium_completed + (difficulty === 'medium' ? 1 : 0),
      hard_completed: currentProgress.hard_completed + (difficulty === 'hard' ? 1 : 0)
    }

    const { error: updateError } = await supabase
      .from('user_progress')
      .update(updatedData)
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }

    return { 
      success: true, 
      ...updatedData
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
export async function testPuzzleCompletion(
  userId: string, 
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<UpdateResult> {
  return updatePuzzleCompletion(userId, difficulty)
}

