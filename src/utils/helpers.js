import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';

// Tailwind class merger
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Status badge styling
export function getStatusColor(status) {
  const colors = {
    verified: 'bg-green-100 text-green-800',
    closed: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    open: 'bg-red-100 text-red-800',
    not_started: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || colors.not_started;
}

// Status display text
export function getStatusText(status) {
  const text = {
    verified: 'Verified',
    closed: 'Closed',
    pending: 'Pending',
    open: 'Open',
    not_started: 'Not Started',
  };
  return text[status] || status;
}

// Format date
export function formatDate(dateString) {
  if (!dateString) return '—';
  return format(new Date(dateString), 'MM/dd HH:mm');
}

// Format date relative (e.g., "2 days ago")
export function formatRelativeDate(dateString) {
  if (!dateString) return '—';
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

// Calculate days until embarkation
export function daysUntilEmbarkation(embarkationDate) {
  if (!embarkationDate) return null;
  const days = differenceInDays(new Date(embarkationDate), new Date());
  return days > 0 ? days : 0;
}

// Format completion percentage
export function formatPercentage(value) {
  return `${Math.round(value)}%`;
}

// Export to CSV
export function exportToCSV(data, filename) {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}