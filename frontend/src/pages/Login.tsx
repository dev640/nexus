import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { MarqueeBand } from '../components/ui/MarqueeBand'
import { MagneticButton } from '../components/ui/MagneticButton'

export function Login() {
  const navigate = useNavigate()
  const login = useAppStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      setError('Enter email and password.')
      return
    }
    setError('')
    login('MEMBER')
    navigate('/')
  }

  function handleAdminLogin() {
    if (email !== 'dev' || password !== 'ruhi') {
      setError('Invalid admin credentials.')
      return
    }
    setError('')
    login('ADMIN')
    navigate('/')
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-white md:grid-cols-2">
      <div className="flex flex-col justify-center bg-ink px-6 py-10 text-white sm:px-16 sm:py-12">
        <img
          src="/logo-wordmark.png"
          alt="Nexus"
          className="mb-10 h-8 w-auto self-start brightness-0 invert"
        />
        <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          BUILD BETTER.
          <br />
          TOGETHER.
        </h1>
        <p className="mt-6 max-w-md text-base text-white/70">
          One intelligent workspace for planning, building, documenting and
          shipping software.
        </p>
        <MarqueeBand
          className="mt-12 border-y border-white/15 py-3 text-white/60"
          items={['PLAN', 'BUILD', 'SHIP', 'ITERATE']}
        />
      </div>
      <div className="flex flex-col justify-center px-6 py-10 sm:px-16 sm:py-12">
        <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-sm flex-col gap-4">
          <img src="/logo-mark.png" alt="Nexus" className="mb-2 h-12 w-auto self-start" />
          <h2 className="text-xl font-semibold tracking-tight">Sign in to Nexus</h2>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-mute">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ink"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-mute">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ink"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <MagneticButton
            type="submit"
            className="mt-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-black"
          >
            Continue
          </MagneticButton>
          <MagneticButton
            type="button"
            onClick={handleAdminLogin}
            className="rounded-md border border-ink px-4 py-2 text-sm font-medium text-ink hover:bg-paper"
          >
            Login as Admin
          </MagneticButton>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-md border border-line px-4 py-2 text-sm font-medium hover:bg-paper"
            >
              Continue with Google
            </button>
            <button
              type="button"
              className="flex-1 rounded-md border border-line px-4 py-2 text-sm font-medium hover:bg-paper"
            >
              Continue with GitHub
            </button>
          </div>
          <div className="mt-2 flex justify-between text-xs text-mute">
            <a href="#" className="hover:text-ink">
              Forgot password
            </a>
            <a href="#" className="hover:text-ink">
              Create account
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
