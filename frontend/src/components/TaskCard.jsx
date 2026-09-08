import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, Edit2, Trash2, Eye, AlertTriangle } from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete, onMarkComplete }) => {
  const navigate = useNavigate();

  const statusConfig = {
    TODO: {
      label: 'To Do',
      color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
      dot: 'bg-amber-500',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
      dot: 'bg-blue-500',
    },
    COMPLETED: {
      label: 'Completed',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
      dot: 'bg-emerald-500',
    },
  };

  const priorityConfig = {
    LOW: {
      label: 'Low',
      badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    },
    MEDIUM: {
      label: 'Medium',
      badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    },
    HIGH: {
      label: 'High',
      badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    },
  };

  const status = statusConfig[task.status] || statusConfig.TODO;
  const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM;

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition duration-200 flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
            {status.label}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${priority.badge}`}>
            {task.priority === 'HIGH' && <AlertTriangle className="w-3 h-3 mr-1 text-rose-500" />}
            {priority.label}
          </span>
        </div>

        {/* Task Title */}
        <h4
          onClick={() => navigate(`/tasks/${task.id}`)}
          className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 cursor-pointer transition line-clamp-1 mb-2"
        >
          {task.title}
        </h4>

        {/* Task Description */}
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {task.description || 'No description provided.'}
        </p>
      </div>

      <div>
        {/* Dates Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mb-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          {task.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Due: {formatDate(task.due_date)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Created: {formatDate(task.created_at)}</span>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-1">
          {task.status !== 'COMPLETED' ? (
            <button
              onClick={() => onMarkComplete(task)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark Complete
            </button>
          ) : (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Done
            </span>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate(`/tasks/${task.id}`)}
              title="View details"
              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(task)}
              title="Edit task"
              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(task)}
              title="Delete task"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
