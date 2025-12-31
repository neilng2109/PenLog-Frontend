import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { photosAPI } from '../services/api'
import { Camera, X, Trash2, ZoomIn } from 'lucide-react'
import { formatDate } from '../utils/helpers'

export default function PhotoGallery({ penetrationId, canUpload = true }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  
  const queryClient = useQueryClient()

  // Fetch photos
  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['photos', penetrationId],
    queryFn: () => photosAPI.getByPenetration(penetrationId).then(res => res.data),
    enabled: !!penetrationId
  })

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('penetration_id', penetrationId)
      formData.append('photo_type', 'general')
      return photosAPI.upload(formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['photos', penetrationId])
      setUploading(false)
      setUploadError(null)
    },
    onError: (error) => {
      setUploadError(error.response?.data?.error || 'Upload failed')
      setUploading(false)
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (photoId) => photosAPI.delete(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries(['photos', penetrationId])
      setSelectedPhoto(null)
    }
  })

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file size (16MB max)
    if (file.size > 16 * 1024 * 1024) {
      setUploadError('File too large. Maximum size is 16MB.')
      return
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload a JPG, PNG, or GIF.')
      return
    }

    setUploading(true)
    setUploadError(null)
    uploadMutation.mutate(file)
  }

  const handleDelete = (photoId) => {
    if (confirm('Are you sure you want to delete this photo?')) {
      deleteMutation.mutate(photoId)
    }
  }

  const getPhotoUrl = (photo) => {
    // Backend stores photos in uploads/{pen_id}/{filename}
    // Photo endpoint at /api/photos/{id} serves the file
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    return `${apiUrl.replace('/api', '')}/api/photos/${photo.id}`
  }

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading photos...</div>
  }

  return (
    <div>
      {/* Upload Section */}
      {canUpload && (
        <div className="mb-4">
          <label 
            htmlFor="photo-upload" 
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-teal-50 hover:bg-teal-100 text-teal-700 border-2 border-dashed border-teal-300 rounded-lg cursor-pointer transition-colors"
          >
            <Camera className="w-5 h-5" />
            <span className="font-medium">
              {uploading ? 'Uploading...' : 'Add Photo'}
            </span>
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          {uploadError && (
            <div className="mt-2 text-sm text-red-600">{uploadError}</div>
          )}
        </div>
      )}

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No photos yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer group"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={getPhotoUrl(photo)}
                alt={photo.caption || 'Penetration photo'}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Size Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Delete Button */}
            {canUpload && (
              <button
                onClick={() => handleDelete(selectedPhoto.id)}
                className="absolute top-4 left-4 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors z-10"
                disabled={deleteMutation.isLoading}
              >
                <Trash2 className="w-6 h-6" />
              </button>
            )}

            {/* Photo */}
            <img
              src={getPhotoUrl(selectedPhoto)}
              alt={selectedPhoto.caption || 'Penetration photo'}
              className="w-full h-auto rounded-lg"
            />

            {/* Photo Info */}
            <div className="mt-4 bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600">
                Uploaded {formatDate(selectedPhoto.uploaded_at)}
              </div>
              {selectedPhoto.caption && (
                <div className="mt-2 text-gray-900">{selectedPhoto.caption}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}