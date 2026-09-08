import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ListTodo,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import ConfirmModal from '../components/ConfirmModal';
import Loading from '../components/Loading';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  const {
    tasks,
    stats,
    loading,
    statsLoading,
    fetchTasks,
    fetchStats,
    createTask,
    updateTask,
    deleteTask,
    markComplete,
    updateFilters,
  } = useTask();

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchTasks({ limit: 4, page: 1, sort: 'created_at', order: 'desc' });
  }, [fetchStats, fetchTasks]);

  const handleCreateTask = async (taskData) => {
    await createTask(taskData);
  };

  const handleUpdateTask = async (taskData) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
      setEditingTask(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingTask) {
      await deleteTask(deletingTask.id);
      setDeletingTask(null);
    }
  };

  // Completion percentage
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar
          title="Dashboard"
          onMenuToggle={() => setSidebarOpen(true)}
          onCreateTask={() => {
            setEditingTask(null);
            setModalOpen(true);
          }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 sm:p-8 text-white shadow-lg shadow-indigo-500/20">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
                <TrendingUp className="w-3.5 h-3.5" />
                Productivity Overview
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.name || 'Explorer'}! 👋
              </h2>
              <p className="text-indigo-100 text-sm sm:text-base mt-2 leading-relaxed">
                You have <span className="font-bold underline decoration-amber-300">{stats.todo} tasks to do</span> and{' '}
                <span className="font-bold underline decoration-blue-300">{stats.inProgress} in progress</span> today. Keep the momentum going!
              </p>
            </div>

            {/* Progress metric in banner */}
            <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="w-full sm:w-64">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span>Overall Completion</span>
                  <span>{completionRate}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingTask(null);
                  setModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 text-xs sm:text-sm font-bold shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                Create New Task
              </button>
            </div>
          </div>

          {/* Statistics Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Performance Metrics</h3>
              {statsLoading && <span className="text-xs text-slate-400">Refreshing stats...</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatsCard
                title="Total Tasks"
                count={stats.total}
                icon={Layers}
                color="indigo"
                badgeText="All tasks"
                onClick={() => {
                  updateFilters({ status: '', priority: '' });
                  navigate('/tasks');
                }}
              />
              <StatsCard
                title="To Do"
                count={stats.todo}
                icon={ListTodo}
                color="amber"
                badgeText="Pending"
                onClick={() => {
                  updateFilters({ status: 'TODO', priority: '' });
                  navigate('/tasks');
                }}
              />
              <StatsCard
                title="In Progress"
                count={stats.inProgress}
                icon={Clock}
                color="blue"
                badgeText="Active"
                onClick={() => {
                  updateFilters({ status: 'IN_PROGRESS', priority: '' });
                  navigate('/tasks');
                }}
              />
              <StatsCard
                title="Completed"
                count={stats.completed}
                icon={CheckCircle2}
                color="emerald"
                badgeText="Finished"
                onClick={() => {
                  updateFilters({ status: 'COMPLETED', priority: '' });
                  navigate('/tasks');
                }}
              />
              <StatsCard
                title="High Priority"
                count={stats.highPriority}
                icon={AlertTriangle}
                color="rose"
                badgeText="Urgent"
                onClick={() => {
                  updateFilters({ status: '', priority: 'HIGH' });
                  navigate('/tasks');
                }}
              />
            </div>
          </div>

          {/* Recent Tasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Tasks</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Your latest created milestones</p>
              </div>
              <button
                onClick={() => navigate('/tasks')}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition"
              >
                View all tasks
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <Loading text="Loading recent tasks..." />
            ) : tasks.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                  <ListTodo className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">No tasks created yet</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6">
                  Get started by creating your first task to plan assignments and monitor progress.
                </p>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  Create your first task
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {tasks.slice(0, 4).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={(t) => {
                      setEditingTask(t);
                      setModalOpen(true);
                    }}
                    onDelete={(t) => setDeletingTask(t)}
                    onMarkComplete={(t) => markComplete(t)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create / Edit Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        isEditing={!!editingTask}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default Dashboard;
