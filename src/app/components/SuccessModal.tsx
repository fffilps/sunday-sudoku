import { Button } from "./ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card"

interface SuccessModalProps {
  completedPuzzles: number
  easyCompleted?: number
  mediumCompleted?: number
  hardCompleted?: number
  currentDifficulty: 'easy' | 'medium' | 'hard'
  onClose: () => void
}

export function SuccessModal({ 
  completedPuzzles, 
  easyCompleted = 0,
  mediumCompleted = 0,
  hardCompleted = 0,
  currentDifficulty,
  onClose 
}: SuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white/95 shadow-xl transform transition-all">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-emerald-600">
            Congratulations!
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 p-6">
          <div className="text-center space-y-4">
            <p className="text-xl font-medium text-slate-700">
              You solved the {currentDifficulty} puzzle!
            </p>
            <div className="space-y-2">
              <p className="text-indigo-600 font-semibold">
                Total Puzzles Completed: {completedPuzzles}
              </p>
              <div className="text-sm text-slate-600">
                <p>Easy: {easyCompleted}</p>
                <p>Medium: {mediumCompleted}</p>
                <p>Hard: {hardCompleted}</p>
              </div>
            </div>
          </div>
          <Button 
            onClick={onClose}
            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200 px-8"
          >
            Play Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 