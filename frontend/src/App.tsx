import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/ui/Header';
import TabNavigation from './components/ui/TabNavigation';
import TextToVideoForm from './components/forms/TextToVideoForm';
import ImageToVideoForm from './components/forms/ImageToVideoForm';
import JobStatusList from './components/status/JobStatusList';
import { useVideoStore } from './stores/videoStore';
import VideoApiService from './services/api';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('text-to-video');
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  
  const { jobs } = useVideoStore();

  // Check backend health on app start
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await VideoApiService.ping();
        setHealthStatus('healthy');
      } catch (error) {
        console.error('Backend health check failed:', error);
        setHealthStatus('unhealthy');
      }
    };

    checkHealth();
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'text-to-video':
        return <TextToVideoForm />;
      case 'image-to-video':
        return <ImageToVideoForm />;
      case 'job-status':
        return <JobStatusList />;
      default:
        return <TextToVideoForm />;
    }
  };

  const getActiveJobCount = () => {
    return jobs.filter(job => job.status === 'pending' || job.status === 'in_progress').length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Header */}
      <Header />

      {/* Health status banner */}
      {healthStatus === 'unhealthy' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-error-500 text-white px-4 py-3 text-center"
        >
          <div className="flex items-center justify-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-medium">
              Backend service is currently unavailable. Some features may not work properly.
            </span>
          </div>
        </motion.div>
      )}

      {healthStatus === 'healthy' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-success-500 text-white px-4 py-3 text-center"
        >
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">
              🎬 AI Video Creator is online and ready to generate amazing videos!
            </span>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        jobCount={getActiveJobCount()}
      />

      {/* Main Content */}
      <main className="py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600">
              <p>© 2024 AI Video Creator. Powered by Google AI Studio & Kling AI.</p>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <a
                href="https://djyalu.github.io/ai_video_creator"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-600 transition-colors"
              >
                Documentation
              </a>
              <a
                href="https://ai-video-creator-irf1.onrender.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-600 transition-colors"
              >
                API Reference
              </a>
              <a
                href="https://github.com/djyalu/ai_video_creator"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-600 transition-colors"
              >
                Source Code
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;