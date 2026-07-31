import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../hooks/useAuth'
import { ArrowRight, Lock, Mail, User as UserIcon, AlertCircle, UserPlus } from 'lucide-react'

export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await register(name, email, password)
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      console.error('Registration error:', err)
      let msg = 'Registration failed. Please try again.'
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        msg = String(err.response.data.message)
      } else if (err instanceof Error) {
        msg = err.message
      }
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await loginWithGoogle()
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      console.error('Google registration error:', err)
      setError('Google authentication failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-neutral-100 border border-neutral-200 shadow-sm">
          <img src="/mascot.png" alt="ClearSight Mascot" className="w-12 h-12 object-contain" />
        </div>
        <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
          Create Account
        </h2>
        <p className="text-xs text-neutral-500 max-w-xs mx-auto">
          Register to start automated glaucoma screening and track research evaluation metrics
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-neutral-200 rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3.5 bg-neutral-100 border border-neutral-300 rounded-xl text-xs text-neutral-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-neutral-800 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full inline-flex items-center justify-center gap-3 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold py-3 px-4 border border-neutral-300 rounded-xl transition-all shadow-sm hover:shadow"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              <span>Sign up with Google</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-neutral-200 w-full" />
            <span className="bg-white px-3 text-[10px] uppercase font-mono text-neutral-400 font-semibold tracking-wider relative">
              Or register with email
            </span>
          </div>

          {/* Email/Password Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Alex Morgan"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all text-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all text-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all text-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all text-neutral-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold py-3 rounded-xl transition-all shadow hover:shadow-md disabled:opacity-50 mt-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create ClearSight Account</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-neutral-100">
            <p className="text-xs text-neutral-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-neutral-900 hover:underline">
                Sign In <ArrowRight className="w-3 h-3 inline" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
