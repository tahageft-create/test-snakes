import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../lib/api';
const errorMessages: Record<string, string> = {
  missing_params:
    'Discord login failed: missing authorization parameters. Please try again.',
  invalid_state: 'Security check failed. Please try logging in again.',
  token_exchange_failed: 'Could not complete Discord login. Please try again.',
  profile_fetch_failed: 'Could not fetch your Discord profile.',
  user_creation_failed: 'Could not create your account. Please try again.',
  callback_error: 'An unexpected error occurred during Discord login.',
  discord_denied: 'Discord authorization was denied.',
};
export default function DiscordCallback() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const discordToken = searchParams.get('discord_token');
    const err = searchParams.get('error');
    if (err) {
      setError(errorMessages[err] || err);
      return;
    }
    if (discordToken) {
      localStorage.setItem('snakes_token', discordToken);
      api
        .get('/auth/verify')
        .then((res) => {
          if (res.data.valid) {
            localStorage.setItem('snakes_user', JSON.stringify(res.data.user));
            navigate('/admin', {
              replace: true,
            });
          } else {
            localStorage.removeItem('snakes_token');
            navigate('/login?error=discord_error', {
              replace: true,
            });
          }
        })
        .catch(() => {
          localStorage.removeItem('snakes_token');
          navigate('/login?error=discord_error', {
            replace: true,
          });
        });
    } else {
      navigate('/login', {
        replace: true,
      });
    }
  }, []);
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="text-red-400 text-5xl mb-4 font-bold">!</div>
          <h2 className="text-xl font-bold mb-2">Authentication Error</h2>
          <p className="text-dark-400 text-sm mb-4">{error}</p>
          <Link
            to="/login"
            className="btn-primary text-sm py-2 px-6 inline-block"
          >
            {' '}
            Back to Login{' '}
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="glass-card p-8 text-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

        <p className="text-dark-400">Completing Discord login...</p>
      </div>
    </div>
  );
}
