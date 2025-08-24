import { create } from 'zustand';
import { VideoJob, TextToVideoForm, ImageToVideoForm } from '../types/api';
import VideoApiService from '../services/api';

interface VideoStore {
  // State
  jobs: VideoJob[];
  activeJobs: VideoJob[];
  currentUser: string;
  isLoading: boolean;
  error: string | null;

  // Text-to-video form
  textForm: TextToVideoForm;
  setTextForm: (form: Partial<TextToVideoForm>) => void;
  resetTextForm: () => void;

  // Image-to-video form
  imageForm: ImageToVideoForm;
  setImageForm: (form: Partial<ImageToVideoForm>) => void;
  resetImageForm: () => void;

  // Actions
  setCurrentUser: (userId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // API actions
  generateTextToVideo: () => Promise<string | null>;
  generateImageToVideo: () => Promise<string | null>;
  refreshJobStatus: (jobId: string) => Promise<void>;
  loadUserJobs: () => Promise<void>;
  startJobPolling: (jobId: string) => void;
  stopJobPolling: (jobId: string) => void;
  
  // Utility
  addJob: (job: VideoJob) => void;
  updateJob: (jobId: string, updates: Partial<VideoJob>) => void;
}

const defaultTextForm: TextToVideoForm = {
  prompt: '',
  duration: 5,
  aspect_ratio: '16:9',
  style: 'realistic',
  quality: 'high'
};

const defaultImageForm: ImageToVideoForm = {
  prompt: '',
  duration: 5,
  motion_intensity: 'medium',
  camera_movement: 'none',
  image: null
};

// Generate a demo user ID
const generateUserId = () => `demo_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const pollingIntervals: Map<string, number> = new Map();

export const useVideoStore = create<VideoStore>((set, get) => ({
  // Initial state
  jobs: [],
  activeJobs: [],
  currentUser: generateUserId(),
  isLoading: false,
  error: null,
  textForm: { ...defaultTextForm },
  imageForm: { ...defaultImageForm },

  // Form actions
  setTextForm: (form) =>
    set((state) => ({
      textForm: { ...state.textForm, ...form }
    })),

  resetTextForm: () =>
    set({ textForm: { ...defaultTextForm } }),

  setImageForm: (form) =>
    set((state) => ({
      imageForm: { ...state.imageForm, ...form }
    })),

  resetImageForm: () =>
    set({ imageForm: { ...defaultImageForm } }),

  // Basic setters
  setCurrentUser: (userId) => set({ currentUser: userId }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // API actions
  generateTextToVideo: async () => {
    const { textForm, currentUser, addJob } = get();
    
    try {
      set({ isLoading: true, error: null });
      
      const response = await VideoApiService.generateVideoFromText({
        ...textForm,
        user_id: currentUser
      });

      // Add job to store
      const newJob: VideoJob = {
        id: response.job_id,
        user_id: currentUser,
        status: 'pending',
        input_type: 'text',
        input_data: textForm,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      addJob(newJob);
      get().startJobPolling(response.job_id);
      
      return response.job_id;
    } catch (error: any) {
      set({ error: error.detail || 'Failed to generate video' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  generateImageToVideo: async () => {
    const { imageForm, currentUser, addJob } = get();
    
    if (!imageForm.image) {
      set({ error: 'Please select an image file' });
      return null;
    }

    try {
      set({ isLoading: true, error: null });
      
      const { image, ...requestData } = imageForm;
      const response = await VideoApiService.generateVideoFromImage({
        ...requestData,
        user_id: currentUser
      }, image);

      // Add job to store
      const newJob: VideoJob = {
        id: response.job_id,
        user_id: currentUser,
        status: 'pending',
        input_type: 'image',
        input_data: { ...requestData, image_name: image.name },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      addJob(newJob);
      get().startJobPolling(response.job_id);
      
      return response.job_id;
    } catch (error: any) {
      set({ error: error.detail || 'Failed to generate video' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  refreshJobStatus: async (jobId) => {
    try {
      const job = await VideoApiService.getJobStatus(jobId);
      get().updateJob(jobId, job);
      
      // Stop polling if job is completed or failed
      if (job.status === 'completed' || job.status === 'failed') {
        get().stopJobPolling(jobId);
      }
    } catch (error: any) {
      console.error('Failed to refresh job status:', error);
    }
  },

  loadUserJobs: async () => {
    const { currentUser } = get();
    
    try {
      set({ isLoading: true, error: null });
      const jobs = await VideoApiService.getUserJobs(currentUser);
      set({ jobs });
    } catch (error: any) {
      set({ error: error.detail || 'Failed to load jobs' });
    } finally {
      set({ isLoading: false });
    }
  },

  startJobPolling: (jobId) => {
    // Clear existing interval if any
    if (pollingIntervals.has(jobId)) {
      clearInterval(pollingIntervals.get(jobId)!);
    }

    // Start new polling interval
    const interval = window.setInterval(() => {
      get().refreshJobStatus(jobId);
    }, 5000); // Poll every 5 seconds

    pollingIntervals.set(jobId, interval);
  },

  stopJobPolling: (jobId) => {
    if (pollingIntervals.has(jobId)) {
      window.clearInterval(pollingIntervals.get(jobId)!);
      pollingIntervals.delete(jobId);
    }
  },

  // Utility functions
  addJob: (job) =>
    set((state) => ({
      jobs: [job, ...state.jobs],
      activeJobs: job.status === 'pending' || job.status === 'in_progress' 
        ? [job, ...state.activeJobs] 
        : state.activeJobs
    })),

  updateJob: (jobId, updates) =>
    set((state) => ({
      jobs: state.jobs.map(job => 
        job.id === jobId ? { ...job, ...updates } : job
      ),
      activeJobs: state.activeJobs.map(job => 
        job.id === jobId ? { ...job, ...updates } : job
      ).filter(job => job.status === 'pending' || job.status === 'in_progress')
    })),
}));