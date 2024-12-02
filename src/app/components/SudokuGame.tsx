"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import Image from "next/image";
import SundaySudokuIcon from "../../../public/SundaySudoku.png";
import { updatePuzzleCompletion } from "../actions/updateProgress";
import { User } from "@supabase/supabase-js";
// Add new type definitions at the top
type PuzzleType = "numbers" | "letters";
type PuzzleValue = number | string;
type Grid = PuzzleValue[][];

// Add new type for tracking user inputs
type UserInputs = Set<string>;

// Helper function to create an empty 9x9 Sudoku grid
const createEmptyGrid = () =>
  Array(9)
    .fill(null)
    .map(() => Array(9).fill(0));

// Update isValidMove to handle shake and color animation
export const isValidMove = (
  grid: Grid,
  row: number,
  col: number,
  value: PuzzleValue,
  setShakeCell?: (key: string | null) => void
): boolean => {
  const triggerShake = () => {
    if (setShakeCell) {
      const cellKey = `${row}-${col}`;
      setShakeCell(cellKey);
      setTimeout(() => setShakeCell(null), 500);
    }
    return false;
  };

  // Check row
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === value) return triggerShake();
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === value) return triggerShake();
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[boxRow + i][boxCol + j] === value) return triggerShake();
    }
  }

  return true;
};

// Helper function to check if the puzzle is solved
const isSolved = (grid: Grid) => {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (grid[i][j] === 0) return false;
    }
  }
  return true;
};

// Function to generate a solved Sudoku grid
const generateSolvedGrid = () => {
  const grid = createEmptyGrid();

  // Create a shuffled array of numbers 1-9
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  shuffleArray(numbers);

  const solve = (row: number, col: number): boolean => {
    if (col === 9) {
      col = 0;
      row++;
      if (row === 9) return true;
    }

    if (grid[row][col] !== 0) return solve(row, col + 1);

    // Try numbers in random order
    const shuffledNumbers = [...numbers];
    shuffleArray(shuffledNumbers);

    for (const num of shuffledNumbers) {
      if (isValidMove(grid, row, col, num)) {
        grid[row][col] = num;
        if (solve(row, col + 1)) return true;
      }
    }

    grid[row][col] = 0;
    return false;
  };

  solve(0, 0);
  return grid;
};

// Function to check if a puzzle has a unique solution
const hasUniqueSolution = (puzzle: number[][]): boolean => {
  let solutions = 0;
  const solve = (grid: number[][]): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValidMove(grid, row, col, num)) {
              grid[row][col] = num;
              if (solve(grid)) {
                solutions++;
                if (solutions > 1) return true;
              }
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  solve(puzzle.map((row) => [...row]));
  return solutions === 1;
};

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Function to generate a Sudoku puzzle
const generateSudokuPuzzle = (
  difficulty: "easy" | "medium" | "hard"
): number[][] => {
  const solvedGrid = generateSolvedGrid();
  const puzzle = solvedGrid.map((row) => [...row]);

  const cellsToRemove = {
    easy: 30,
    medium: 40,
    hard: 50,
  }[difficulty];

  const cellIndices = Array.from({ length: 81 }, (_, i) => i);
  shuffleArray(cellIndices);

  for (const index of cellIndices) {
    const row = Math.floor(index / 9);
    const col = index % 9;
    const temp = puzzle[row][col];
    puzzle[row][col] = 0;

    if (!hasUniqueSolution(puzzle)) {
      puzzle[row][col] = temp;
    }

    if (puzzle.flat().filter((cell) => cell === 0).length >= cellsToRemove) {
      break;
    }
  }

  return puzzle;
};

// Add helper function to get valid inputs based on puzzle type
const getValidInputs = (type: PuzzleType): PuzzleValue[] => {
  switch (type) {
    case "numbers":
      return Array.from({ length: 9 }, (_, i) => i + 1);
    case "letters":
      return Array.from({ length: 9 }, (_, i) => String.fromCharCode(65 + i)); // A-I
    default:
      return Array.from({ length: 9 }, (_, i) => i + 1);
  }
};

async function onPuzzleComplete(user: User) {
  if (!user) {
    console.error("No user found")
    return
  }

  try {
    const result = await updatePuzzleCompletion(user.id)
    
    if (result.success) {
      console.log(`Successfully updated! Total completed puzzles: ${result.completed_puzzles}`)
      // You could show this in the UI
      return true
    } else {
      console.error("Failed to update progress:", result.error)
      return false
    }
  } catch (error) {
    console.error("Error in onPuzzleComplete:", error)
    return false
  }
}

export default function SudokuGame({ user }: { user: User }) {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(
    null
  );
  const [isGameWon, setIsGameWon] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy"
  );
  const [puzzleType, setPuzzleType] = useState<PuzzleType>("numbers");
  const [userInputs, setUserInputs] = useState<UserInputs>(new Set());
  const [shakeCell, setShakeCell] = useState<string | null>(null);

  // Add useCallback to memoize startNewGame
  const startNewGame = useCallback(() => {
    const solved = generateSolvedGrid();
    setGrid(solved);
    const newPuzzle = generateSudokuPuzzle(difficulty);
    setGrid(newPuzzle);
    setSelectedCell(null);
    setIsGameWon(false);
    setUserInputs(new Set()); // Reset user inputs
  }, [difficulty]); // Added difficulty as a dependency

  // Add useEffect to start a new game when component mounts
  useEffect(() => {
    startNewGame();
  }, [startNewGame]); // No changes needed here

  useEffect(() => {
    if (isSolved(grid)) {
      setIsGameWon(true);
      onPuzzleComplete(user);
    }
  }, [grid, user]);

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell([row, col]);
  };

  // Update handleInput to use new isValidMove
  const handleInput = useCallback((value: PuzzleValue) => {
    if (!selectedCell) return;

    const [row, col] = selectedCell;
    const cellKey = `${row}-${col}`;
    
    if (isValidMove(grid, row, col, value, setShakeCell)) {
      const newGrid = grid.map((r) => [...r]);
      newGrid[row][col] = value;
      setGrid(newGrid);

      // Add to user inputs
      setUserInputs(prev => {
        const newSet = new Set(prev);
        newSet.add(cellKey);
        return newSet;
      });
    }
  }, [selectedCell, grid, setShakeCell]);

  const resetGame = () => {
    setGrid(createEmptyGrid());
    setSelectedCell(null);
    setIsGameWon(false);
    setUserInputs(new Set());
  };

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!selectedCell) return;

      const input = e.key.toUpperCase();
      // const validInputs = getValidInputs(puzzleType); // Removed this line

      if (puzzleType === "numbers" && /^[1-9]$/.test(input)) {
        handleInput(parseInt(input)); // Removed second argument
      } else if (puzzleType === "letters" && /^[A-I]$/.test(input)) {
        handleInput(input); // Removed second argument
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [selectedCell, puzzleType, handleInput]);

  // Add test function
  const handleTestCompletion = async () => {
    const success = await onPuzzleComplete(user)
    if (success) {
      setIsGameWon(true)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-xl bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-indigo-900">
            <Image src={SundaySudokuIcon} alt="Sunday Sudoku" className="w-full h-auto" width={250} height={250} />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6 flex flex-col gap-2">
          <div className="grid grid-cols-9 gap-[2px] bg-indigo-50/80 p-2 sm:p-4 rounded-lg shadow-inner aspect-square">
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`aspect-square flex items-center justify-center border text-sm sm:text-base
                    ${selectedCell && selectedCell[0] === rowIndex && selectedCell[1] === colIndex
                      ? "bg-indigo-200 border-indigo-400"
                      : "bg-white/90 hover:bg-indigo-50 border-indigo-100"
                    } 
                    ${colIndex % 3 === 2 && colIndex !== 8 ? "border-r-2 border-r-indigo-400" : ""}
                    ${rowIndex % 3 === 2 && rowIndex !== 8 ? "border-b-2 border-b-indigo-400" : ""}
                    ${shakeCell === `${rowIndex}-${colIndex}` ? "animate-shake bg-red-50" : ""}
                  `}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell !== 0 && (
                    <span className={`
                      ${userInputs.has(`${rowIndex}-${colIndex}`) 
                        ? "text-indigo-600 font-semibold" 
                        : "text-slate-700 font-medium"
                      }
                    `}>
                      {cell}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="flex justify-evenly gap-1 sm:gap-2 py-2">
            {getValidInputs(puzzleType).map((value) => (
              <Button
                key={value}
                onClick={() => handleInput(value)}
                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border border-indigo-200 
                  transition-colors duration-200 w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-lg text-sm sm:text-base"
              >
                {value}
              </Button>
            ))}
          </div>
          <div className="flex justify-between gap-1 sm:gap-2">
            <Button 
              onClick={resetGame}
              className="bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-200 text-sm sm:text-base"
            >
              Reset
            </Button>
            <Button 
              onClick={startNewGame}
              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200 text-sm sm:text-base"
            >
              New Game
            </Button>
            {process.env.NODE_ENV === 'development' && (
              <Button 
                onClick={handleTestCompletion}
                className="bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200 text-sm sm:text-base"
              >
                Test
              </Button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-indigo-50/50 p-2 sm:p-3 rounded-lg text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <span className="text-indigo-700 whitespace-nowrap">Difficulty:</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
                className="p-1 sm:p-2 border rounded bg-white/80 text-indigo-700 border-indigo-200 
                  focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-indigo-700">Type:</span>
              <select
                value={puzzleType}
                onChange={(e) => setPuzzleType(e.target.value as PuzzleType)}
                className="p-1 sm:p-2 border rounded bg-white/80 text-indigo-700 border-indigo-200 
                  focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none"
              >
                <option value="numbers">Numbers</option>
                {/* <option value="letters">Letters</option> */}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
      {isGameWon && (
        <div className="mt-2 sm:mt-4 text-xl sm:text-2xl font-bold text-emerald-600 bg-white/80 px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg">
          Congratulations! You solved the puzzle!
        </div>
      )}
    </div>
  );
}
