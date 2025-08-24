// API Response Types matching backend schemas
export interface VideoJob {
  id: string;
  user_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  input_type: 'text' | 'image';
  input_data: Record<string, any>;
  output_data?: Record<string, any>;
  error_message?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  processing_time?: number;
}

export interface TextToVideoRequest {
  prompt: string;
  duration?: number;
  aspect_ratio?: string;
  style?: string;
  quality?: string;
  user_id: string;
}

export interface ImageToVideoRequest {
  prompt: string;
  duration?: number;
  motion_intensity?: string;
  camera_movement?: string;
  user_id: string;
}

export interface VideoJobResponse {
  job_id: string;
  status: string;
  message: string;
}

export interface HealthResponse {
  status: string;
  timestamp: number;
  services?: {
    database?: string;
    redis?: string;
    worker?: string;
  };
}

export interface ApiError {
  detail: string;
  error_code?: string;
  timestamp?: number;
}

// Form state types
export interface TextToVideoForm {
  prompt: string;
  duration: number;
  aspect_ratio: string;
  style: string;
  quality: string;
}

export interface ImageToVideoForm {
  prompt: string;
  duration: number;
  motion_intensity: string;
  camera_movement: string;
  image: File | null;
}