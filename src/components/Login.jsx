import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { loginWithGoogle } = useAuth()

  return (
    <div className="min-h-screen bg-church-navy flex flex-col items-center justify-center px-4">
      {/* Logo / Header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-church-gold rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-3xl text-church-navy font-bold">✝</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-church-gold tracking-wide">
          Convocation Book Tracker
        </h1>
        <p className="text-gray-400 mt-2 text-sm md:text-base">
          Media Team Production Dashboard
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome</h2>
        <p className="text-gray-500 text-sm mb-6">
          Sign in with your Google account to access the team dashboard.
        </p>
        <button
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-church-gold hover:bg-church-cream rounded-xl px-4 py-3 transition-all duration-200 shadow-sm hover:shadow-md group"
        >
          {/* Google G icon */}
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span className="text-gray-700 font-medium group-hover:text-church-navy">
            Continue with Google
          </span>
        </button>
      </div>

      <p className="text-gray-600 text-xs mt-6 text-center max-w-xs">
        Access is restricted to approved team members. Contact your administrator if you need access.
      </p>
    </div>
  )
}
