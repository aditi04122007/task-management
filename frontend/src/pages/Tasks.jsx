import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  SlidersHorizontal,
  RotateCcw,
  ListTodo,
  Grid,
  List as ListIcon,
  Filter,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';
import { useTask } from '../context/TaskContext';

const Tasks = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const {
    tasks,
    loading,
    pagination,
    filters,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    markComplete,
    updateFilters,
    resetFilters,
  } = useTask();

  // Local state for debounced search input
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Debounce search effect (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        updateFilters({ search: searchInput, page: 1 });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch tasks whenever filters change
  useEffect(() => {
    fetchTasks();
  }, [filters, fetchTasks]);

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar
          title="Tasks"
          onMenuToggle={() => setSidebarOpen(true)}
          onCreateTask={() => {
            setEditingTask(null);
            setModalOpen(true);
          }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Controls Bar: Search, Filters, Sort, View Toggle */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
            {/* Top row: Search and Actions */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search tasks by title or description..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              {/* View Switcher and Reset */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={resetFilters}
                  title="Reset all filters"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition border border-slate-200 dark:border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                    title="Grid view"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === 'table'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                    title="Table view"
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter & Sorting Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0">Status:</span>
                <select
                  value={filters.status}
                  onChange={(e) => updateFilters({ status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0">Priority:</span>
                <select
                  value={filters.priority}
                  onChange={(e) => updateFilters({ priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">All Priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0">Sort By:</span>
                <select
                  value={`${filters.sort}_${filters.order}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('_');
                    updateFilters({ sort, order });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="created_at_desc">Newest First</option>
                  <option value="created_at_asc">Oldest First</option>
                  <option value="due_date_asc">Due Date (Earliest)</option>
                  <option value="due_date_desc">Due Date (Latest)</option>
                  <option value="title_asc">Title (A - Z)</option>
                  <option value="title_desc">Title (Z - A)</option>
                  <option value="priority_desc">Priority (High to Low)</option>
                  <option value="status_asc">Status</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tasks Container */}
          {loading ? (
            <Loading text="Fetching tasks..." />
          ) : tasks.length === 0 ? (
            /* Empty State */
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
                <ListTodo className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No tasks found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6">
                {filters.search || filters.status || filters.priority
                  ? 'No tasks match your active filters. Try clearing your filters or search terms.'
                  : 'Start by creating your first task to stay organized and boost productivity.'}
              </p>
              {filters.search || filters.status || filters.priority ? (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  Create your first task
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tasks.map((task) => (
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
          ) : (
            /* Table View */
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{task.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          task.priority === 'HIGH' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {task.status !== 'COMPLETED' && (
                          <button
                            onClick={() => markComplete(task)}
                            className="text-xs font-semibold text-emerald-600 hover:underline mr-2"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingTask(task);
                            setModalOpen(true);
                          }}
                          className="text-xs font-semibold text-indigo-600 hover:underline mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingTask(task)}
                          className="text-xs font-semibold text-rose-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <Pagination
            pagination={pagination}
            onPageChange={(page) => updateFilters({ page })}
            onLimitChange={(limit) => updateFilters({ limit, page: 1 })}
          />
        </main>
      </div>

      {/* Modals */}
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

      <ConfirmModal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"? This cannot be undone.`}
      />
    </div>
  );
};

export default Tasks;
