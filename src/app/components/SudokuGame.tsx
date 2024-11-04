"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";

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

// Change from const to export const
export const isValidMove = (
  grid: Grid,
  row: number,
  col: number,
  value: PuzzleValue
): boolean => {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === value) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === value) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[boxRow + i][boxCol + j] === value) return false;
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

export default function SudokuGame() {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(
    null
  );
  const [isGameWon, setIsGameWon] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy"
  );
  const [puzzleType, setPuzzleType] = useState<PuzzleType>("numbers");
  const [solvedGrid, setSolvedGrid] = useState<Grid>([]);
  const [incorrectCells, setIncorrectCells] = useState<string | null>(null);
  const [userInputs, setUserInputs] = useState<UserInputs>(new Set());
  const [shakeCell, setShakeCell] = useState<string | null>(null);

  // Add useCallback to memoize startNewGame
  const startNewGame = useCallback(() => {
    const solved = generateSolvedGrid();
    setSolvedGrid(solved);
    const newPuzzle = generateSudokuPuzzle(difficulty);
    setGrid(newPuzzle);
    setSelectedCell(null);
    setIsGameWon(false);
    setIncorrectCells(null);
    setUserInputs(new Set()); // Reset user inputs
  }, [difficulty]); // Added difficulty as a dependency

  // Add useEffect to start a new game when component mounts
  useEffect(() => {
    startNewGame();
  }, [startNewGame]); // No changes needed here

  useEffect(() => {
    if (isSolved(grid)) {
      setIsGameWon(true);
    }
  }, [grid]);

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell([row, col]);
  };

  const handleInput = useCallback((value: PuzzleValue) => {
    if (!selectedCell) return;

    const [row, col] = selectedCell;
    const cellKey = `${row}-${col}`;
    
    // Check if the input matches the solved grid
    const inputValue = value.toString();
    const solvedValue = solvedGrid[row][col].toString();

    if (isValidMove(grid, row, col, value)) {
      const newGrid = grid.map((r) => [...r]);
      newGrid[row][col] = value;
      setGrid(newGrid);

      // Add to user inputs
      setUserInputs(prev => {
        const newSet = new Set(prev);
        newSet.add(cellKey);
        return newSet;
      });

      if (inputValue !== solvedValue) {
        // Trigger shake animation only for incorrect inputs
        setShakeCell(cellKey);
        setTimeout(() => setShakeCell(null), 500);
      }
    }
  }, [selectedCell, grid, solvedGrid]);

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 shadow-lg shadow-black">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-black">
            Sudoku
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-9 gap-1 mb-4 text-black bg-white">
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-8 h-8 flex items-center justify-center border
                    ${selectedCell && selectedCell[0] === rowIndex && selectedCell[1] === colIndex
                      ? "bg-blue-200"
                      : "bg-slate-100"
                    } 
                    ${colIndex % 3 === 2 && colIndex !== 8 ? "border-r-2 border-r-black" : ""}
                    ${rowIndex % 3 === 2 && rowIndex !== 8 ? "border-b-2 border-b-black" : ""}
                    ${shakeCell === `${rowIndex}-${colIndex}` ? "animate-shake" : ""}
                  `}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell !== 0 && (
                    <span className={`
                      ${userInputs.has(`${rowIndex}-${colIndex}`) ? "text-blue-600" : "text-black"}
                      font-medium
                    `}>
                      {cell}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {getValidInputs(puzzleType).map((value) => (
              <Button key={value} onClick={() => handleInput(value)}>
                {value}
              </Button>
            ))}
          </div>
          <div className="flex justify-between mb-4">
            <Button onClick={resetGame}>Reset Game</Button>
            <Button onClick={startNewGame}>New Game</Button>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span>Difficulty:</span>
              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as "easy" | "medium" | "hard")
                }
                className="p-2 border rounded text-black"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span>Type:</span>
              <select
                value={puzzleType}
                onChange={(e) => setPuzzleType(e.target.value as PuzzleType)}
                className="p-2 border rounded text-black"
              >
                <option value="numbers">Numbers</option>
                {/* <option value="letters">Letters</option> */}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
      {isGameWon && (
        <div className="mt-4 text-2xl font-bold text-green-600">
          Congratulations! You solved the puzzle!
        </div>
      )}
    </div>
  );
}
