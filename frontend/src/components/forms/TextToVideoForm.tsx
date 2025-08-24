import React, { useState } from 'react';
import { Play, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useVideoStore } from '../../stores/videoStore';
import { motion } from 'framer-motion';

const TextToVideoForm: React.FC = () => {
  const {
    textForm,
    setTextForm,
    resetTextForm,
    generateTextToVideo,
    isLoading,
    error
  } = useVideoStore();

  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validation
    if (!textForm.prompt.trim()) {
      setLocalError('Please enter a prompt for your video');
      return;
    }

    if (textForm.prompt.length < 10) {
      setLocalError('Please provide a more detailed prompt (at least 10 characters)');
      return;
    }

    try {
      const jobId = await generateTextToVideo();
      if (jobId) {
        // Success - form will be reset by store if needed
        console.log('Video generation started:', jobId);
      }
    } catch (error) {
      setLocalError('Failed to start video generation. Please try again.');
    }
  };

  const handleReset = () => {
    resetTextForm();
    setLocalError(null);
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
            <Sparkles className="h-8 w-8 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Text to Video</h2>
          </div>
          <p className="text-gray-600">
            Describe your vision and let AI create a stunning video for you
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
          {/* Prompt input */}
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
              Video Prompt *
            </label>
            <textarea
              id="prompt"
              value={textForm.prompt}
              onChange={(e) => setTextForm({ prompt: e.target.value })}
              placeholder="Describe the video you want to create... e.g., 'A serene sunset over calm ocean waters with gentle waves and seabirds flying in the distance'"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-colors"
              rows={4}
              disabled={isLoading}
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Be specific and descriptive for better results
              </p>
              <p className="text-xs text-gray-400">
                {textForm.prompt.length}/1000
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
                value={textForm.duration}
                onChange={(e) => setTextForm({ duration: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value={3}>3 seconds</option>
                <option value={5}>5 seconds</option>
                <option value={8}>8 seconds</option>
                <option value={10}>10 seconds</option>
                <option value={15}>15 seconds</option>
              </select>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label htmlFor="aspect_ratio" className="block text-sm font-medium text-gray-700 mb-2">
                Aspect Ratio
              </label>
              <select
                id="aspect_ratio"
                value={textForm.aspect_ratio}
                onChange={(e) => setTextForm({ aspect_ratio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="16:9">16:9 (Landscape)</option>
                <option value="9:16">9:16 (Portrait)</option>
                <option value="1:1">1:1 (Square)</option>
                <option value="4:3">4:3 (Classic)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Style */}
            <div>
              <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-2">
                Style
              </label>
              <select
                id="style"
                value={textForm.style}
                onChange={(e) => setTextForm({ style: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="realistic">Realistic</option>
                <option value="cinematic">Cinematic</option>
                <option value="anime">Anime</option>
                <option value="cartoon">Cartoon</option>
                <option value="artistic">Artistic</option>
              </select>
            </div>

            {/* Quality */}
            <div>
              <label htmlFor="quality" className="block text-sm font-medium text-gray-700 mb-2">
                Quality
              </label>
              <select
                id="quality"
                value={textForm.quality}
                onChange={(e) => setTextForm({ quality: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="standard">Standard</option>
                <option value="high">High Quality</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={isLoading || !textForm.prompt.trim()}
              className={`
                flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium transition-all
                ${isLoading || !textForm.prompt.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg transform hover:scale-[1.02]'
                }
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Generating Video...</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  <span>Generate Video</span>
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
          <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Be specific about what you want to see in the video</li>
            <li>• Include details about lighting, camera angles, and movement</li>
            <li>• Mention the setting, time of day, and atmosphere</li>
            <li>• For better results, describe actions and emotions</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default TextToVideoForm;