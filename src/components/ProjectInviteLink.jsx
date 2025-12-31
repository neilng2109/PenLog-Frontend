// Create this as src/components/ProjectInviteLink.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProjectInviteLink({ projectId }) {
  const [inviteUrl, setInviteUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInviteCode();
  }, [projectId]);

  const fetchInviteCode = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/projects/${projectId}/invite-code`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setInviteUrl(response.data.invite_url);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load invite link');
    } finally {
      setLoading(false);
    }
  };

  const regenerateCode = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/projects/${projectId}/invite-code`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setInviteUrl(response.data.invite_url);
      alert('New invite link generated!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to regenerate link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Loading invite link...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Contractor Registration Link
      </h3>
      
      <p className="text-sm text-gray-600 mb-4">
        Share this link with contractors to register for this project. They'll be added to your pending approvals list.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={inviteUrl}
          readOnly
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
        />
        
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium"
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={regenerateCode}
          className="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          Regenerate Link
        </button>
        <span className="text-sm text-gray-400">
          (This will invalidate the old link)
        </span>
      </div>
    </div>
  );
}