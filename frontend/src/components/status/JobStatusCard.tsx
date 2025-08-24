import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Download, 
  Eye, 
  Type, 
  Image as ImageIcon,
  Calendar,
  Timer
} from 'lucide-react';
import { VideoJob } from '../../types/api';
import { motion } from 'framer-motion';

interface JobStatusCardProps {
  job: VideoJob;
  onDownload?: (job: VideoJob) => void;
  onPreview?: (job: VideoJob) => void;
}

const JobStatusCard: React.FC<JobStatusCardProps> = ({ job, onDownload, onPreview }) => {
  const getStatusInfo = (status: VideoJob['status']) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          text: 'Pending'
        };
      case 'in_progress':
        return {
          icon: Loader2,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          text: 'Generating',
          animate: true
        };
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-success-600',
          bgColor: 'bg-success-50',
          borderColor: 'border-success-200',
          text: 'Completed'
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-error-600',
          bgColor: 'bg-error-50',
          borderColor: 'border-error-200',
          text: 'Failed'
        };
    }
  };

  const statusInfo = getStatusInfo(job.status);
  const StatusIcon = statusInfo.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  };

  const getInputTypeInfo = (inputType: VideoJob['input_type']) => {
    return inputType === 'text' 
      ? { icon: Type, label: 'Text to Video', color: 'text-purple-600' }
      : { icon: ImageIcon, label: 'Image to Video', color: 'text-blue-600' };
  };

  const inputInfo = getInputTypeInfo(job.input_type);
  const InputIcon = inputInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        p-6 rounded-lg border-2 transition-all hover:shadow-lg
        ${statusInfo.bgColor} ${statusInfo.borderColor}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
            <StatusIcon 
              className={`h-5 w-5 ${statusInfo.color} ${statusInfo.animate ? 'animate-spin' : ''}`} 
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <InputIcon className={`h-4 w-4 ${inputInfo.color}`} />
              <span className="text-sm font-medium text-gray-600">{inputInfo.label}</span>
            </div>
            <p className={`text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.text}
            </p>
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          ID: {job.id.slice(0, 8)}...
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-4">
        {job.input_type === 'text' ? (
          <div>
            <p className="text-sm text-gray-600 mb-1">Prompt:</p>
            <p className="text-sm text-gray-900 line-clamp-2">
              {job.input_data.prompt || 'No prompt available'}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-1">Motion Description:</p>
            <p className="text-sm text-gray-900 line-clamp-2">
              {job.input_data.prompt || 'No description available'}
            </p>
            {job.input_data.image_name && (
              <p className="text-xs text-gray-500 mt-1">
                Image: {job.input_data.image_name}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <Timer className="h-3 w-3" />
          <span>Duration: {job.input_data.duration || 'N/A'}s</span>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3" />
          <span>Created: {formatDate(job.created_at)}</span>
        </div>
      </div>

      {/* Error message for failed jobs */}
      {job.status === 'failed' && job.error_message && (
        <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg">
          <p className="text-sm text-error-800">
            <span className="font-medium">Error:</span> {job.error_message}
          </p>
        </div>
      )}

      {/* Progress for in-progress jobs */}
      {job.status === 'in_progress' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Processing...</span>
            <span className="text-xs text-gray-500">
              Started {formatDate(job.updated_at)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse-slow" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}

      {/* Completion info for completed jobs */}
      {job.status === 'completed' && (
        <div className="mb-4 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Completed: {job.completed_at ? formatDate(job.completed_at) : 'N/A'}</span>
            <span>Processing time: {formatDuration(job.processing_time)}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      {job.status === 'completed' && job.output_data?.video_url && (
        <div className="flex space-x-3">
          <button
            onClick={() => onPreview?.(job)}
            className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </button>
          
          <button
            onClick={() => onDownload?.(job)}
            className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default JobStatusCard;