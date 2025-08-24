import React from 'react';
import { Video, Zap, Github, ExternalLink } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-2 rounded-lg">
              <Video className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Video Creator</h1>
              <p className="text-sm text-gray-500">Powered by AI</p>
            </div>
          </div>

          {/* Status indicator and links */}
          <div className="flex items-center space-x-4">
            {/* Live status indicator */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>

            {/* API Documentation link */}
            <a
              href="https://ai-video-creator-irf1.onrender.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
            >
              <Zap className="h-4 w-4" />
              <span>API Docs</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            {/* GitHub link */}
            <a
              href="https://github.com/djyalu/ai_video_creator"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;