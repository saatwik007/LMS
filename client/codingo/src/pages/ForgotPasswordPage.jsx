import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/api/auth/user/forgot-password`, { email });
      setSent(true);
      if (res.data?.resetToken) setDevToken(res.data.resetToken);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0f1419] font-sans px-4 sm:px-6 py-8 sm:py-10 flex items-center justify-center">
      <div className="w-full max-w-md bg-[#1a2332] border border-[#2a3a4a] rounded-2xl shadow-lg p-5 sm:p-7">
        <button
          onClick={() => navigate('/login')}
          className="text-cyan-300 hover:text-white text-sm font-bold mb-5 inline-flex items-center gap-1 transition"
        >
          ← Back to Login
        </button>

        <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-2 bg-clip-text text-transparent bg-linear-to-r from-emerald-400 via-cyan-400 to-violet-400">
          Forgot Password
        </h1>
        <p className="text-center text-sm text-gray-400 mb-6">
          Enter your email and we'll generate a reset token
        </p>

        {error && (
          <div className="mb-4 text-center text-sm font-bold text-red-300 bg-red-900/30 border border-red-800/40 py-2 rounded-lg">
            {error}
          </div>
        )}

        {!sent ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              className="w-full bg-[#141b24] border border-[#1f2a38] text-white text-base p-3.5 rounded-lg font-semibold placeholder-gray-500 outline-none focus:border-cyan-500 transition"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              className="mt-1 w-full py-3 rounded-lg text-base font-extrabold bg-linear-to-r from-cyan-400 via-emerald-400 to-cyan-500 text-gray-950 hover:opacity-90 transition disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Token'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-emerald-400 text-5xl mb-2">✉️</div>
            <p className="text-sm text-gray-300">
              If an account exists for <span className="text-cyan-400">{email}</span>, a reset token has been generated.
            </p>

            {devToken && (
              <div className="p-4 rounded-lg bg-amber-900/30 border border-amber-800/40">
                <p className="text-xs text-amber-300 font-bold mb-1">Dev Mode — Your Reset Token:</p>
                <p className="font-mono text-amber-200 text-xs break-all select-all">{devToken}</p>
              </div>
            )}

            <button
              onClick={() => navigate('/reset-password')}
              className="w-full py-3 rounded-lg text-base font-extrabold bg-linear-to-r from-cyan-400 via-emerald-400 to-cyan-500 text-gray-950 hover:opacity-90 transition"
            >
              Go to Reset Password →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
