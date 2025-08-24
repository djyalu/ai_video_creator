import React, { useState, useCallback } from 'react';
import { Play, Image, Loader2, AlertCircle, Upload, X } from 'lucide-react';
import { useVideoStore } from '../../stores/videoStore';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

const ImageToVideoForm: React.FC = () => {
  const {
    imageForm,
    setImageForm,
    resetImageForm,
    generateImageToVideo,
    isLoading,
    error
  } = useVideoStore();

  const [localError, setLocalError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // TODO(human): Implement drag-and-drop image upload functionality
  // This should handle file validation, preview display, and proper error states
  // Consider file types (.jpg, .jpeg, .png, .webp, .gif), size limits (10MB max),
  // show image preview with ability to remove/replace, and integrate with form state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validation
    if (!imageForm.prompt.trim()) {
      setLocalError('Please enter a prompt describing the motion you want');
      return;
    }

    if (!imageForm.image) {
      setLocalError('Please upload an image to animate');
      return;
    }

    if (imageForm.prompt.length < 5) {
      setLocalError('Please provide a more detailed motion description (at least 5 characters)');
      return;
    }

    try {
      const jobId = await generateImageToVideo();
      if (jobId) {
        console.log('Image-to-video generation started:', jobId);
        // Reset form after successful submission
        handleReset();
      }
    } catch (error) {
      setLocalError('Failed to start video generation. Please try again.');
    }
  };

  const handleReset = () => {
    resetImageForm();
    setLocalError(null);
    setImagePreview(null);
  };

  const displayError = localError || error;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Image className="h-8 w-8 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Image to Video</h2>
          </div>
          <p className="text-gray-600">
            Upload an image and describe the motion you want to add
          </p>
        </div>

        {/* Error display */}
        {displayError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-center space-x-3"
          >
            <AlertCircle className="h-5 w-5 text-error-600 flex-shrink-0" />
            <p className="text-error-700 text-sm">{displayError}</p>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section - TODO(human) implementation needed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image *
            </label>
            
            {/* Placeholder dropzone - TODO(human): Replace with react-dropzone implementation */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Drag and drop an image here, or click to select</p>
              <p className="text-sm text-gray-500">Supports JPG, PNG, WEBP, GIF up to 10MB</p>
              
              {/* File input fallback */}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.gif"
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                Choose File
              </label>
            </div>
          </div>

          {/* Motion Prompt */}
          <div>
            <label htmlFor="motion-prompt" className="block text-sm font-medium text-gray-700 mb-2">
              Motion Description *
            </label>
            <textarea
              id="motion-prompt"
              value={imageForm.prompt}
              onChange={(e) => setImageForm({ prompt: e.target.value })}
              placeholder="Describe the motion you want to add... e.g., 'Gentle wind blowing through the trees, leaves rustling softly'"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-colors"
              rows={3}
              disabled={isLoading}
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Describe the motion, not the scene
              </p>
              <p className="text-xs text-gray-400">
                {imageForm.prompt.length}/500
              </p>
            </div>
          </div>

          {/* Configuration row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duration (seconds)
              </label>
              <select
                id="duration"
                value={imageForm.duration}
                onChange={(e) => setImageForm({ duration: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value={3}>3 seconds</option>
                <option value={5}>5 seconds</option>
                <option value={8}>8 seconds</option>
                <option value={10}>10 seconds</option>
              </select>
            </div>

            {/* Motion Intensity */}
            <div>
              <label htmlFor="motion_intensity" className="block text-sm font-medium text-gray-700 mb-2">
                Motion Intensity
              </label>
              <select
                id="motion_intensity"
                value={imageForm.motion_intensity}
                onChange={(e) => setImageForm({ motion_intensity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="subtle">Subtle</option>
                <option value="medium">Medium</option>
                <option value="strong">Strong</option>
                <option value="dramatic">Dramatic</option>
              </select>
            </div>
          </div>

          {/* Camera Movement */}
          <div>
            <label htmlFor="camera_movement" className="block text-sm font-medium text-gray-700 mb-2">
              Camera Movement
            </label>
            <select
              id="camera_movement"
              value={imageForm.camera_movement}
              onChange={(e) => setImageForm({ camera_movement: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="none">None</option>
              <option value="subtle_zoom">Subtle Zoom</option>
              <option value="pan_left">Pan Left</option>
              <option value="pan_right">Pan Right</option>
              <option value="tilt_up">Tilt Up</option>
              <option value="tilt_down">Tilt Down</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={isLoading || !imageForm.prompt.trim() || !imageForm.image}
              className={`
                flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium transition-all
                ${isLoading || !imageForm.prompt.trim() || !imageForm.image
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg transform hover:scale-[1.02]'
                }
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Animating Image...</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  <span>Animate Image</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">💡 Animation Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Focus on describing motion, not the scene content</li>
            <li>• Use natural movement descriptions (flowing, swaying, floating)</li>
            <li>• Consider the physics of your scene (wind, gravity, momentum)</li>
            <li>• Start with subtle motion and experiment with intensity</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default ImageToVideoForm;