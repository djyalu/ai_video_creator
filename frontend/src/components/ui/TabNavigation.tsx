import React from 'react';
import { Type, Image, Clock } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  jobCount?: number;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange, jobCount = 0 }) => {
  const tabs = [
    {
      id: 'text-to-video',
      name: 'Text to Video',
      icon: Type,
      description: 'Generate videos from text prompts'
    },
    {
      id: 'image-to-video',
      name: 'Image to Video',
      icon: Image,
      description: 'Animate images with AI'
    },
    {
      id: 'job-status',
      name: 'Job Status',
      icon: Clock,
      description: 'Track your video generation progress',
      badge: jobCount > 0 ? jobCount : undefined
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                  ${isActive
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
                {tab.badge && (
                  <span className="ml-2 bg-primary-100 text-primary-600 py-0.5 px-2 rounded-full text-xs font-medium">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default TabNavigation;