import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCheck,
  ArrowRight,
  Sparkles,
  Sliders,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <CheckCheck className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            TaskFlow
          </span>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Intelligent Task & Project Management
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
            Manage your work. <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              Stay organized.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed font-normal">
            Effortlessly organize tasks, prioritize what matters most, and gain instant visibility into your workflow with real-time statistics and smart filtering.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-base border border-slate-200 dark:border-slate-800 transition"
            >
              Sign In to TaskFlow
            </Link>
          </div>

          {/* Interactive Preview Mockup */}
          <div className="relative rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 p-4 shadow-2xl backdrop-blur-sm">
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-left space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="text-xs font-semibold text-slate-400 ml-2">TaskFlow Live Dashboard</span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                  Connected
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500">Total Tasks</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">12</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-200/50 dark:border-amber-900/40">
                  <p className="text-xs text-amber-600 dark:text-amber-400">In Progress</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">4</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-900/40">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Completed</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">6</p>
                </div>
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-200/50 dark:border-rose-900/40">
                  <p className="text-xs text-rose-600 dark:text-rose-400">High Priority</p>
                  <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">3</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
              Everything you need to deliver on time
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-base">
              Built for speed, clarity, and focus. Manage assignments without cluttered menus or steep learning curves.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Task Management
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Create, organize, and track status updates instantly. Transition smoothly across To Do, In Progress, and Completed stages.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Priority Management
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Highlight urgent milestones with Low, Medium, and High priority flags. Filter and sort so critical work never slips through.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Progress Tracking
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Gain real-time insights with user-isolated statistics cards. See completion metrics and track productivity at a glance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCheck className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">TaskFlow</span> &copy; {new Date().getFullYear()} All rights reserved.
        </div>
        <p>Built with React, Vite, Tailwind CSS, Express, and MySQL.</p>
      </footer>
    </div>
  );
};

export default Landing;
