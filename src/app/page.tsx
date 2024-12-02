import SudokuGame from "./components/SudokuGame";
import { redirect } from "next/navigation";
import { createClient } from "./utils/supabase/server";

export default async function Home() {
  
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect('/login')
  }

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen">
      <title>Sunday Sudoku</title>
      <meta name="description" content="A relaxing Sunday Sudoku puzzle game" />
      <SudokuGame user={user} />
    </main>
  );
}
