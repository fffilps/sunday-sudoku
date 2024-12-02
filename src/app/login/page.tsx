'use client'

import { createClient } from '../utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'The email or password you entered is incorrect. Please try again.'
          : 'Something went wrong. Please try again.'
      )
    } else {
      router.push('/')
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password.length < 6) {
      setError('Your password needs to be at least 6 characters long.')
      setIsLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(
        error.message === 'User already registered'
          ? 'This email is already registered. Try signing in instead.'
          : 'Something went wrong. Please try again.'
      )
    } else {
      setError('Success! Please check your email for the confirmation link.')
    }
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in to your account or create a new one
          </p>
        </div>
        <form className="mt-8 space-y-6">
          {error && (
            <div className={`p-4 rounded-md ${
              error.includes('Success')
                ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-200'
            }`}>
              {error}
            </div>
          )}
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Password must be at least 6 characters long
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleSignIn}
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md bg-gray-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 