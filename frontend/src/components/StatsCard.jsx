import React from 'react';

const StatsCard = ({ title, count, icon: Icon, color, badgeText, onClick }) => {
  const colorStyles = {
    indigo: {
      bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-100 dark:border-indigo-900/40',
      badge: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300',
    },
    amber: {
      bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/40',
      badge: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
    },
    blue: {
      bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/40',
      badge: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
    },
    emerald: {
      bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/40',
      badge: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
    },
    rose: {
      bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      border: 'border-rose-100 dark:border-rose-900/40',
      badge: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300',
    },
  };

  const style = colorStyles[color] || colorStyles.indigo;

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border ${style.border} shadow-sm hover:shadow-md transition duration-200 cursor-pointer flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.bg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{count}</h3>
        {badgeText && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
