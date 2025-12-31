import { useState, useEffect } from 'react'
import { X, Clock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import StatusBadge from './StatusBadge'
import EditStatusModal from './EditStatusModal'
import PhotoGallery from './PhotoGallery'
import { formatDate, formatRelativeDate } from '../utils/helpers'
import { penetrationsAPI } from '../services/api'

export default function PenDetailModal({ pen, onClose }) {
  const [showEditStatus, setShowEditStatus] = useState(false)
  
  // Fetch activity history
  const { data: activities = [] } = useQuery({
    queryKey: ['pen-activities', pen.id],
    queryFn: () => penetrationsAPI.getActivities(pen.id).then(res => res.data),
    enabled: !!pen.id
  })
  
  if (!pen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Pen {pen.pen_id}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <StatusBadge status={pen.status} />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Deck</label>
                  <div className="mt-1 text-gray-900">{pen.deck}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Fire Zone</label>
                  <div className="mt-1 text-gray-900">{pen.fire_zone || '—'}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Frame</label>
                  <div className="mt-1 text-gray-900">{pen.frame || '—'}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <div className="mt-1 text-gray-900">{pen.location || '—'}</div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <div className="mt-1 text-gray-900">{pen.pen_type || '—'}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Size</label>
                  <div className="mt-1 text-gray-900">{pen.size || '—'}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Contractor</label>
                  <div className="mt-1 text-gray-900">{pen.contractor_name || '—'}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Opened At</label>
                  <div className="mt-1 text-gray-900">{formatDate(pen.opened_at)}</div>
                  {pen.opened_at && (
                    <div className="text-xs text-gray-500">{formatRelativeDate(pen.opened_at)}</div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Completed At</label>
                  <div className="mt-1 text-gray-900">{formatDate(pen.completed_at)}</div>
                  {pen.completed_at && (
                    <div className="text-xs text-gray-500">{formatRelativeDate(pen.completed_at)}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {pen.notes && (
              <div className="mt-6">
                <label className="text-sm font-medium text-gray-500">Notes</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg text-gray-900">
                  {pen.notes}
                </div>
              </div>
            )}

            {/* Activity Timeline */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Activity History
              </h3>
              
              {activities.length === 0 ? (
                <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-6 text-center">
                  No activity recorded yet
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-3">
                      {/* Timeline Line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          activity.action === 'status_changed' ? 'bg-blue-500' :
                          activity.action === 'note_added' ? 'bg-gray-400' :
                          'bg-green-500'
                        }`} />
                        {index < activities.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 my-1" />
                        )}
                      </div>

                      {/* Activity Content */}
                      <div className="flex-1 pb-4">
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex justify-between items-start mb-1">
                            <div className="font-medium text-gray-900">
                              {activity.action === 'status_changed' && (
                                <>
                                  Status changed: <span className="capitalize">{activity.previous_status?.replace('_', ' ')}</span> → <span className="capitalize">{activity.new_status?.replace('_', ' ')}</span>
                                </>
                              )}
                              {activity.action === 'note_added' && 'Note added'}
                              {activity.action === 'created' && 'Penetration created'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatRelativeDate(activity.timestamp)}
                            </div>
                          </div>
                          
                          {activity.notes && (
                            <div className="text-sm text-gray-600 mt-2">
                              "{activity.notes}"
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500 mt-2">
                            {activity.username || 'System'} • {formatDate(activity.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Photos */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Photos</h3>
              <PhotoGallery penetrationId={pen.id} canUpload={true} />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button 
              onClick={() => setShowEditStatus(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg"
            >
              Edit Status
            </button>
          </div>
        </div>
      </div>

      {/* Edit Status Modal */}
      {showEditStatus && (
        <EditStatusModal
          pen={pen}
          onClose={() => setShowEditStatus(false)}
          onSuccess={onClose}
        />
      )}
    </>
  )
}