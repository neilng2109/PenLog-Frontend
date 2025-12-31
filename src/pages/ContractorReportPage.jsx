import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportAPI, photosAPI } from '../services/api'
import { Camera, Check, AlertCircle, X } from 'lucide-react'
import PenLogLogo from '../components/PenLogLogo'

export default function ContractorReportPage() {
  const { token } = useParams()
  
  const [selectedPen, setSelectedPen] = useState(null)
  const [action, setAction] = useState('')
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState([])
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState([])
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const queryClient = useQueryClient()

  // Fetch contractor form data
  const { data, isLoading, error } = useQuery({
    queryKey: ['contractor-report', token],
    queryFn: () => reportAPI.getForm(token).then(res => res.data),
    retry: 1,
    refetchInterval: 30000
  })

  const submitMutation = useMutation({
    mutationFn: async ({ penId, action, notes }) => {
      const statusResponse = await reportAPI.submit(token, {
        pen_id: penId,  // Backend expects pen_id not penId
        action,
        notes
      })
      
      if (photos.length > 0) {
        const uploadPromises = photos.map(photo => {
          const formData = new FormData()
          formData.append('file', photo)
          formData.append('penetration_id', penId)
          formData.append('photo_type', action === 'open' ? 'opening' : 'closing')
          return photosAPI.upload(formData)
        })
        await Promise.all(uploadPromises)
      }
      
      return statusResponse
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contractor-report', token])
      setSubmitSuccess(true)
    }
  })

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    
    setPhotos(prev => [...prev, ...files])
    const newPreviewUrls = files.map(file => URL.createObjectURL(file))
    setPhotoPreviewUrls(prev => [...prev, ...newPreviewUrls])
  }

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
    URL.revokeObjectURL(photoPreviewUrls[index])
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!action) return

    if (selectedPen.isNew) {
      if (!selectedPen.pen_id || !selectedPen.deck || !selectedPen.location) {
        alert('Please fill in Pen Number, Deck, and Location')
        return
      }
      
      try {
        const newPenData = {
          pen_id: selectedPen.pen_id,
          deck: selectedPen.deck,
          location: selectedPen.location,
          fire_zone: selectedPen.fire_zone || null,
          frame: selectedPen.frame || null,
          pen_type: selectedPen.pen_type || null
        }
        
        const createResponse = await reportAPI.createPen(token, newPenData)
        const createdPen = createResponse.data
        
        submitMutation.mutate({
          penId: createdPen.id,
          action,
          notes
        })
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to create pen')
      }
    } else {
      submitMutation.mutate({
        penId: selectedPen.id,
        action,
        notes
      })
    }
  }

  const resetForm = () => {
    setSelectedPen(null)
    setAction('')
    setNotes('')
    setPhotos([])
    setPhotoPreviewUrls([])
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Invalid Access Link
          </h1>
          <p className="text-gray-600 text-sm">
            This link is invalid or has expired. Please contact the project supervisor.
          </p>
        </div>
      </div>
    )
  }

  const { project, contractor, penetrations = [] } = data || {}

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-display">
            Submitted!
          </h2>
          <p className="text-gray-600 mb-6">
            {selectedPen?.isNew ? 'New pen created and ' : ''}Status updated successfully
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                setSubmitSuccess(false)
                setSelectedPen({ isNew: true })
                setAction('')
                setNotes('')
                setPhotos([])
                setPhotoPreviewUrls([])
              }}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 rounded-lg transition-colors"
            >
              + Report Another Pen
            </button>
            
            <button
              onClick={() => {
                setSubmitSuccess(false)
                resetForm()
              }}
              className="w-full bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition-colors"
            >
              Back to Pen List
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedPen) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-navy-800 text-white p-4 sticky top-0 shadow-lg z-10">
          <div className="flex items-center gap-3 mb-2">
            <PenLogLogo size="sm" showText={false} />
            <div className="text-xs opacity-90">{project?.ship_name}</div>
          </div>
          <h1 className="text-lg font-bold font-display">{contractor?.name}</h1>
          <div className="text-xs opacity-90 mt-1">
            {penetrations.length} penetrations assigned
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-gray-600">
              SELECT PENETRATION
            </h2>
            <button
              onClick={() => setSelectedPen({ isNew: true })}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg shadow-lg active:scale-95 transition-all"
            >
              + Report New Pen
            </button>
          </div>
          
          {penetrations.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500">No penetrations assigned yet</p>
              <p className="text-sm text-gray-400 mt-2">Use "Report New Pen" to add one</p>
            </div>
          ) : (
            penetrations.map((pen) => (
              <button
                key={pen.id}
                onClick={() => setSelectedPen(pen)}
                className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-left hover:shadow-md transition-shadow active:scale-98"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-lg text-gray-900">
                    Pen {pen.pen_id}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    pen.status === 'verified' ? 'bg-green-100 text-green-800' :
                    pen.status === 'closed' ? 'bg-blue-100 text-blue-800' :
                    pen.status === 'open' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {pen.status === 'not_started' ? 'Not Started' :
                     pen.status === 'open' ? 'Open' :
                     pen.status === 'closed' ? 'Closed' :
                     'Verified'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>{pen.deck} • {pen.fire_zone}</div>
                  <div className="font-medium">{pen.location}</div>
                  <div className="text-xs text-gray-500">{pen.pen_type}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-navy-800 text-white p-4 sticky top-0 shadow-lg z-10">
        <button
          onClick={resetForm}
          className="text-sm mb-2 opacity-90 hover:opacity-100"
        >
          ← Back to list
        </button>
        <h1 className="text-xl font-bold font-display">
          {selectedPen.isNew ? 'Report New Pen' : `Pen ${selectedPen.pen_id}`}
        </h1>
        {!selectedPen.isNew && selectedPen.location && (
          <div className="text-sm opacity-90">{selectedPen.location}</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {selectedPen.isNew && (
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-4">
            <h3 className="font-semibold text-gray-900">Pen Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pen Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={selectedPen.pen_id || ''}
                onChange={(e) => setSelectedPen({...selectedPen, pen_id: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., 001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deck <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={selectedPen.deck || ''}
                onChange={(e) => setSelectedPen({...selectedPen, deck: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., 5"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={selectedPen.location || ''}
                onChange={(e) => setSelectedPen({...selectedPen, location: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., Gym"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fire Zone
              </label>
              <input
                type="text"
                value={selectedPen.fire_zone || ''}
                onChange={(e) => setSelectedPen({...selectedPen, fire_zone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., FZ-4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frame
              </label>
              <input
                type="text"
                value={selectedPen.frame || ''}
                onChange={(e) => setSelectedPen({...selectedPen, frame: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., 144"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={selectedPen.pen_type || ''}
                onChange={(e) => setSelectedPen({...selectedPen, pen_type: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select type...</option>
                <option value="MCT">MCT</option>
                <option value="ROXTEC">Roxtec</option>
                <option value="GK">GK</option>
                <option value="Navicross">Navicross</option>
                <option value="Fire Seal">Fire Seal</option>
                <option value="BRATTBERG">Brattberg</option>
              </select>
            </div>
          </div>
        )}

        {!selectedPen.isNew && (
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500 text-xs">Deck</div>
                <div className="font-medium">{selectedPen.deck}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Fire Zone</div>
                <div className="font-medium">{selectedPen.fire_zone}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Type</div>
                <div className="font-medium">{selectedPen.pen_type}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Frame</div>
                <div className="font-medium">{selectedPen.frame}</div>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            WHAT ARE YOU DOING?
          </label>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setAction('open')}
              className={`w-full p-4 rounded-lg border-2 font-medium transition-all ${
                action === 'open'
                  ? 'border-red-500 bg-red-50 text-red-900'
                  : 'border-gray-300 bg-white text-gray-700 active:scale-98'
              }`}
            >
              🔓 Opening Pen
            </button>
            <button
              type="button"
              onClick={() => setAction('close')}
              className={`w-full p-4 rounded-lg border-2 font-medium transition-all ${
                action === 'close'
                  ? 'border-green-500 bg-green-50 text-green-900'
                  : 'border-gray-300 bg-white text-gray-700 active:scale-98'
              }`}
            >
              🔒 Closing Pen
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            NOTES (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-base"
            placeholder="Any comments..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            PHOTOS {photos.length > 0 && `(${photos.length})`}
          </label>
          
          {photoPreviewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {photoPreviewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <label
            htmlFor="photo-upload"
            className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 active:scale-98 transition-all"
          >
            <Camera className="w-6 h-6 text-gray-400" />
            <span className="text-gray-600 font-medium">
              {photos.length === 0 ? 'Add Photos' : 'Add More Photos'}
            </span>
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handlePhotoChange}
            className="hidden"
          />
          <p className="mt-1 text-xs text-gray-500 text-center">
            Tap to take photo or choose from gallery
          </p>
        </div>

        <button
          type="submit"
          disabled={!action || submitMutation.isLoading}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg sticky bottom-4 shadow-lg"
        >
          {submitMutation.isLoading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  )
}