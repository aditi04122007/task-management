import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const { addToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    completed: 0,
    highPriority: 0,
  });
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 1,
  });

  // Filter, search, and sort parameters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    sort: 'created_at',
    order: 'desc',
    page: 1,
    limit: 9,
  });

  // Fetch task statistics
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await api.get('/tasks/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching task stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch tasks with current query filters
  const fetchTasks = useCallback(async (customParams = {}) => {
    try {
      setLoading(true);
      const currentParams = { ...filters, ...customParams };

      const queryParams = new URLSearchParams();
      if (currentParams.search) queryParams.append('search', currentParams.search);
      if (currentParams.status) queryParams.append('status', currentParams.status);
      if (currentParams.priority) queryParams.append('priority', currentParams.priority);
      if (currentParams.sort) queryParams.append('sort', currentParams.sort);
      if (currentParams.order) queryParams.append('order', currentParams.order);
      if (currentParams.page) queryParams.append('page', currentParams.page);
      if (currentParams.limit) queryParams.append('limit', currentParams.limit);

      const res = await api.get(`/tasks?${queryParams.toString()}`);
      setTasks(res.data.tasks || []);

      if (res.data.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      addToast(error.response?.data?.message || 'Failed to fetch tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, addToast]);

  // Create a new task
  const createTask = async (taskData) => {
    try {
      const res = await api.post('/tasks', taskData);
      addToast('Task created successfully!', 'success');
      fetchTasks();
      fetchStats();
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create task';
      addToast(errorMsg, 'error');
      throw error;
    }
  };

  // Update an existing task
  const updateTask = async (id, taskData) => {
    try {
      const res = await api.put(`/tasks/${id}`, taskData);
      addToast('Task updated successfully!', 'success');
      fetchTasks();
      fetchStats();
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update task';
      addToast(errorMsg, 'error');
      throw error;
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    try {
      const res = await api.delete(`/tasks/${id}`);
      addToast('Task deleted successfully!', 'success');
      // Optimistically update list or refetch
      setTasks((prev) => prev.filter((t) => t.id !== id));
      fetchTasks();
      fetchStats();
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete task';
      addToast(errorMsg, 'error');
      throw error;
    }
  };

  // Quick action: Mark complete
  const markComplete = async (task) => {
    try {
      await updateTask(task.id, {
        title: task.title,
        description: task.description,
        status: 'COMPLETED',
        priority: task.priority,
        due_date: task.due_date ? task.due_date.split('T')[0] : null,
      });
    } catch (error) {
      console.error('Error marking task as complete:', error);
    }
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: newFilters.page !== undefined ? newFilters.page : 1 }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      sort: 'created_at',
      order: 'desc',
      page: 1,
      limit: 9,
    });
  };

  const value = {
    tasks,
    stats,
    loading,
    statsLoading,
    pagination,
    filters,
    fetchTasks,
    fetchStats,
    createTask,
    updateTask,
    deleteTask,
    markComplete,
    updateFilters,
    resetFilters,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
