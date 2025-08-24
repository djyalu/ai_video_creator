import axios, { AxiosResponse } from 'axios';
import {
  VideoJob,
  TextToVideoRequest,
  ImageToVideoRequest,
  VideoJobResponse,
  HealthResponse,
  ApiError
} from '../types/api';

// Configure axios base URL based on environment
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://ai-video-creator-irf1.onrender.com'
  : 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.detail) {
      const apiError: ApiError = {
        detail: error.response.data.detail,
        error_code: error.response.data.error_code,
        timestamp: Date.now()
      };
      return Promise.reject(apiError);
    }
    return Promise.reject({
      detail: error.message || 'An unexpected error occurred',
      timestamp: Date.now()
    } as ApiError);
  }
);

// API Service Class
export class VideoApiService {
  // Health check endpoints
  static async checkHealth(): Promise<HealthResponse> {
    const response: AxiosResponse<HealthResponse> = await api.get('/health');
    return response.data;
  }

  static async ping(): Promise<{ status: string; timestamp: number }> {
    const response = await api.get('/ping');
    return response.data;
  }

  // Video generation endpoints
  static async generateVideoFromText(data: TextToVideoRequest): Promise<VideoJobResponse> {
    const response: AxiosResponse<VideoJobResponse> = await api.post('/api/v1/video/generate/text', data);
    return response.data;
  }

  static async generateVideoFromImage(data: ImageToVideoRequest, imageFile: File): Promise<VideoJobResponse> {
    const formData = new FormData();
    
    // Append image file
    formData.append('image', imageFile);
    
    // Append other data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response: AxiosResponse<VideoJobResponse> = await api.post('/api/v1/video/generate/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Job management endpoints
  static async getJobStatus(jobId: string): Promise<VideoJob> {
    const response: AxiosResponse<VideoJob> = await api.get(`/api/v1/status/jobs/${jobId}`);
    return response.data;
  }

  static async getUserJobs(userId: string): Promise<VideoJob[]> {
    const response: AxiosResponse<VideoJob[]> = await api.get(`/api/v1/status/user/${userId}/jobs`);
    return response.data;
  }

  static async cancelJob(jobId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/api/v1/status/jobs/${jobId}/cancel`);
    return response.data;
  }

  // Utility methods
  static async downloadVideo(videoUrl: string): Promise<Blob> {
    const response = await api.get(videoUrl, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export default VideoApiService;