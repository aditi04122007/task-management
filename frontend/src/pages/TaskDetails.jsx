import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  CheckCheck,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import TaskModal from '../components/TaskModal';
import ConfirmModal from '../components/ConfirmModal';
import Loading from '../components/Loading';
import api from '../services/api';
import { useTask } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateTask, deleteTask, markComplete } = useTask();
  const { addToast } = useToast();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/tasks/${id}`);
        setTask(res.data.task);
      } catch (err) {
        addToast(err.response?.data?.message || 'Task not found', 'error');
        navigate('/tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, navigate, addToast]);

  const handleUpdate = async (taskData) => {
    await updateTask(id, taskData);
    setTask((prev) => ({ ...prev, ...taskData }));
    setModalOpen(false);
  };

  const handleDelete = async () => {
    await deleteTask(id);
    navigate('/tasks');
  };

  const handleToggleComplete = async () => {
    if (!task) return;
    await markComplete(task);
    setTask((prev) => ({ ...prev, status: 'COMPLETED' }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not specified';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar title="Task Details" onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto space-y-6">
          {/* Back button */}
          <div>
            <button
              onClick={() => navigate('/tasks')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tasks
            </button>
          </div>

          {loading ? (
            <Loading text="Loading task details..." />
          ) : !task ? (
            <div className="text-center py-12 text-slate-500">Task not found</div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {/* Header with Title and Badges */}
              <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {task.status.replace('_', ' ')}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        task.priority === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {task.status !== 'COMPLETED' && (
                      <button
                        onClick={handleToggleComplete}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 rounded-xl transition border border-emerald-200 dark:border-emerald-800"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Complete
                      </button>
                    )}
                    <button
                      onClick={() => setModalOpen(true)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-xl transition border border-indigo-200 dark:border-indigo-800"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 rounded-xl transition border border-rose-200 dark:border-rose-800"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {task.title}
                </h2>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    Description
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {task.description || 'No detailed description provided for this task.'}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      Due Date
                    </span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatDate(task.due_date)}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      Created At
                    </span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatDate(task.created_at)}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      Last Updated
                    </span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatDate(task.updated_at || task.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleUpdate}
        task={task}
        isEditing={true}
      />

      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${task?.title}"?`}
      />
    </div>
  );
};

export default TaskDetails;
