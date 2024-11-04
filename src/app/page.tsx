import SudokuGame from "./components/SudokuGame";

export default function Home() {
  return (
    <main className="min-h-screen">
      <title>Sunday Sudoku</title>
      <meta name="description" content="A relaxing Sunday Sudoku puzzle game" />
      <SudokuGame />
    </main>
  );
}
