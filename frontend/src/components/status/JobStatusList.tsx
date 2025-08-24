import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle, Inbox, Filter } from 'lucide-react';
import { useVideoStore } from '../../stores/videoStore';
import { VideoJob } from '../../types/api';
import JobStatusCard from './JobStatusCard';
import VideoApiService from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const JobStatusList: React.FC = () => {
  const {
    jobs,
    currentUser,
    loadUserJobs,
    isLoading,
    error
  } = useVideoStore();

  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'failed'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Load user jobs on component mount
    loadUserJobs();
  }, [loadUserJobs]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadUserJobs();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDownload = async (job: VideoJob) => {
    if (!job.output_data?.video_url) return;

    try {
      const blob = await VideoApiService.downloadVideo(job.output_data.video_url);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video_${job.id}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download video:', error);
      // TODO: Show toast notification
    }
  };

  const handlePreview = (job: VideoJob) => {
    if (job.output_data?.video_url) {
      window.open(job.output_data.video_url, '_blank');
    }
  };

  const getFilteredJobs = () => {
    switch (filter) {
      case 'active':
        return jobs.filter(job => job.status === 'pending' || job.status === 'in_progress');
      case 'completed':
        return jobs.filter(job => job.status === 'completed');
      case 'failed':
        return jobs.filter(job => job.status === 'failed');
      default:
        return jobs;
    }
  };

  const filteredJobs = getFilteredJobs();

  const getFilterCounts = () => {
    return {
      all: jobs.length,
      active: jobs.filter(job => job.status === 'pending' || job.status === 'in_progress').length,
      completed: jobs.filter(job => job.status === 'completed').length,
      failed: jobs.filter(job => job.status === 'failed').length
    };
  };

  const counts = getFilterCounts();

  const filters = [
    { id: 'all', label: 'All Jobs', count: counts.all },
    { id: 'active', label: 'Active', count: counts.active },
    { id: 'completed', label: 'Completed', count: counts.completed },
    { id: 'failed', label: 'Failed', count: counts.failed }
  ] as const;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Video Generation Jobs</h2>
            <p className="text-gray-600">
              Track the progress of your video generation requests
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all
              ${isLoading || isRefreshing
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }
            `}
          >
            <RefreshCw className={`h-4 w-4 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Error display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-center space-x-3"
          >
            <AlertCircle className="h-5 w-5 text-error-600 flex-shrink-0" />
            <p className="text-error-700 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Filter tabs */}
        <div className="flex items-center space-x-1 mb-6 overflow-x-auto">
          <Filter className="h-4 w-4 text-gray-500 flex-shrink-0 mr-2" />
          {filters.map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap
                ${filter === filterOption.id
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              <span>{filterOption.label}</span>
              {filterOption.count > 0 && (
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-medium
                  ${filter === filterOption.id
                    ? 'bg-primary-200 text-primary-800'
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {filterOption.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* User info */}
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Current Session ID:</span> {currentUser}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Jobs are tracked for this session. Bookmark this page to return to your jobs later.
          </p>
        </div>

        {/* Job list */}
        <AnimatePresence mode="wait">
          {isLoading && jobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your jobs...</p>
            </motion.div>
          ) : filteredJobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No jobs yet' : `No ${filter} jobs`}
              </h3>
              <p className="text-gray-600 mb-4">
                {filter === 'all'
                  ? 'Start by creating your first video using the generation tabs above.'
                  : `You don't have any ${filter} jobs at the moment.`
                }
              </p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  View all jobs
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredJobs.map((job) => (
                <JobStatusCard
                  key={job.id}
                  job={job}
                  onDownload={handleDownload}
                  onPreview={handlePreview}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default JobStatusList;