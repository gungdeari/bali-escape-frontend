import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../contexts/AuthContext';

export function Register() {
  const [name, setName]                           = useState('');
  const [email, setEmail]                         = useState('');
  const [password, setPassword]                   = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError]                         = useState('');
  const [isLoading, setIsLoading]                 = useState(false);

  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register({ name, email, password });
      // redirect to login with success message
      navigate('/login', {
        state: { message: 'Account created! Please sign in.' }
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm overflow-hidden flex">

        {/* LEFT — image panel (flipped vs login) */}
        <div className="hidden lg:flex flex-1 bg-[#0e7490] items-center justify-center p-10">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-3">Join Us</h2>
            <p className="text-white/75 text-sm leading-relaxed">
              Thousands of travelers trust us<br />to find their perfect trip
            </p>
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="flex-1 flex flex-col justify-center px-10 py-12">

          {/* brand */}
          <Link to="/" className="flex items-center gap-2 mb-10 w-fit group">
            <MapPin className="w-5 h-5 text-[#17A2B8]" />
            <span className="font-bold text-lg text-gray-900">
              Bali<span className="text-[#17A2B8]">Escape</span>
            </span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-1">Create account</h1>
          <p className="text-gray-500 text-sm mb-8">Start your Bali adventure today</p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Full name
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 h-11 rounded-xl border-gray-200 text-sm focus:border-[#17A2B8] focus:ring-[#17A2B8]"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-11 rounded-xl border-gray-200 text-sm focus:border-[#17A2B8] focus:ring-[#17A2B8]"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 h-11 rounded-xl border-gray-200 text-sm focus:border-[#17A2B8] focus:ring-[#17A2B8]"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Confirm password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="pl-9 h-11 rounded-xl border-gray-200 text-sm focus:border-[#17A2B8] focus:ring-[#17A2B8]"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#17A2B8] hover:bg-[#138496] text-white rounded-xl text-sm font-medium mt-2"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#17A2B8] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}