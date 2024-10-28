// Import the isValidMove function from SudokuGame
import { isValidMove } from '../components/SudokuGame'

// Function to generate a solved Sudoku grid
function generateSolvedGrid(): number[][] {
    const grid = Array(9).fill(null).map(() => Array(9).fill(0))
    
    function fillGrid(row: number, col: number): boolean {
      if (col === 9) {
        col = 0
        row++
        if (row === 9) return true
      }
  
      if (grid[row][col] !== 0) return fillGrid(row, col + 1)
  
      for (let num = 1; num <= 9; num++) {
        if (isValidMove(grid, row, col, num)) {
          grid[row][col] = num
          if (fillGrid(row, col + 1)) return true
        }
      }
  
      grid[row][col] = 0
      return false
    }
  
    fillGrid(0, 0)
    return grid
  }
  
  // Function to remove numbers from the grid to create a puzzle
  function generatePuzzle(difficulty: number): number[][] {
    const solvedGrid = generateSolvedGrid()
    const puzzle = solvedGrid.map(row => [...row])
    const cellsToRemove = difficulty * 20 // Adjust this formula as needed
  
    for (let i = 0; i < cellsToRemove; i++) {
      let row, col
      do {
        row = Math.floor(Math.random() * 9)
        col = Math.floor(Math.random() * 9)
      } while (puzzle[row][col] === 0)
      puzzle[row][col] = 0
    }
  
    return puzzle
  }
  
  // Export the generator function
  export function generateSudokuPuzzle(difficulty: number): number[][] {
    return generatePuzzle(difficulty)
  }
