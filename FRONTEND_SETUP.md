# 🎨 Frontend Development Setup

Complete guide to set up and develop the AI Video Creator frontend interface.

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js 18+** (recommend using [nvm](https://github.com/nvm-sh/nvm))
- **npm** or **yarn** package manager
- **Git** for version control

### 2. Clone and Navigate
```bash
git clone https://github.com/djyalu/ai_video_creator.git
cd ai_video_creator/frontend
```

### 3. Install Dependencies
```bash
npm install
# or
yarn install
```

### 4. Environment Setup
```bash
# Copy environment template (optional)
cp .env.example .env

# Configure API endpoint (optional - defaults to localhost:8000 for dev)
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
```

### 5. Start Development Server
```bash
npm run dev
# or
yarn dev
```

The frontend will be available at: **http://localhost:3000**

## 🧪 Testing & Quality

### Run E2E Tests
```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run specific test file
npx playwright test tests/e2e/text-to-video.spec.ts
```

### Type Checking
```bash
npm run type-check
```

### Code Linting
```bash
npm run lint
```

### Production Build
```bash
npm run build
npm run preview
```

## 🏗️ Development Workflow

### 1. Backend Integration
For full functionality, run the backend API server:

```bash
# Terminal 1: Backend API
cd ../ai_video_creator
source .venv/bin/activate
uvicorn app.main:app --reload

# Terminal 2: Frontend UI
cd ../frontend
npm run dev
```

### 2. Feature Development
The frontend is structured for easy development:

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── forms/           # Form components
│   └── status/          # Status and job tracking
├── services/api.ts      # API integration
├── stores/videoStore.ts # State management
└── types/api.ts         # TypeScript definitions
```

### 3. Making Changes
1. **UI Components**: Add new components in `src/components/`
2. **API Integration**: Extend `src/services/api.ts`
3. **State Management**: Update `src/stores/videoStore.ts`
4. **Types**: Add interfaces in `src/types/api.ts`
5. **Tests**: Add E2E tests in `tests/e2e/`

### 4. Testing Your Changes
```bash
# Type check
npm run type-check

# Lint code
npm run lint

# Run E2E tests
npm run test

# Build for production
npm run build
```

## 🔧 Configuration Options

### Environment Variables
```bash
# .env (optional)
VITE_API_BASE_URL=http://localhost:8000  # Backend API URL
NODE_ENV=development                     # Environment mode
```

### Vite Configuration
Edit `vite.config.ts` for:
- Proxy settings for API calls
- Build optimization
- Plugin configuration

### Tailwind Configuration
Edit `tailwind.config.js` for:
- Color schemes
- Typography
- Spacing and sizing
- Custom utilities

## 🚀 Deployment

### Automatic Deployment
The frontend automatically deploys to GitHub Pages on push to `main` branch.

**Live URL**: https://djyalu.github.io/ai_video_creator/

### Manual Deployment
```bash
# Build for production
npm run build

# Deploy dist/ folder to your hosting service
# The build output will be in frontend/dist/
```

### Production Environment Variables
For production deployment, configure:
```bash
VITE_API_BASE_URL=https://ai-video-creator-irf1.onrender.com
NODE_ENV=production
```

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── ui/         # Layout components (Header, Navigation)
│   │   ├── forms/      # Form components (TextToVideo, ImageToVideo)
│   │   └── status/     # Status components (JobCard, JobList)
│   ├── services/       # API services and HTTP client
│   ├── stores/         # Zustand state management
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles and Tailwind imports
├── tests/
│   └── e2e/           # Playwright E2E tests
├── package.json        # Dependencies and scripts
├── vite.config.ts     # Vite build configuration
├── tailwind.config.js # Tailwind CSS configuration
├── playwright.config.ts # Playwright test configuration
└── README.md          # Frontend documentation
```

## 🎯 Key Features to Understand

### 1. State Management (Zustand)
```typescript
// src/stores/videoStore.ts
const useVideoStore = create<VideoStore>((set, get) => ({
  // Form state
  textForm: { prompt: '', duration: 5, ... },
  
  // Actions
  generateTextToVideo: async () => { ... },
  loadUserJobs: async () => { ... }
}));
```

### 2. API Integration
```typescript
// src/services/api.ts
export class VideoApiService {
  static async generateVideoFromText(data: TextToVideoRequest) {
    const response = await api.post('/api/v1/video/generate/text', data);
    return response.data;
  }
}
```

### 3. Real-time Updates
```typescript
// Automatic polling for job status updates
startJobPolling: (jobId) => {
  const interval = setInterval(() => {
    get().refreshJobStatus(jobId);
  }, 5000); // Poll every 5 seconds
}
```

### 4. Form Validation
- Client-side validation with TypeScript
- Real-time error messages
- Character counting and limits
- File upload validation

### 5. Responsive Design
- Mobile-first Tailwind CSS approach
- Touch-friendly interactions
- Responsive layouts and typography
- Cross-browser compatibility

## 🔍 Troubleshooting

### Common Issues

**1. API Connection Issues**
```bash
# Check if backend is running
curl http://localhost:8000/ping

# Check proxy configuration in vite.config.ts
# Ensure VITE_API_BASE_URL is correct
```

**2. Build Issues**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npm run dev -- --force
```

**3. Test Issues**
```bash
# Reinstall Playwright browsers
npx playwright install --with-deps

# Run tests in headed mode for debugging
npx playwright test --headed
```

**4. TypeScript Errors**
```bash
# Run type checking
npm run type-check

# Check for missing type definitions
npm install @types/node @types/react @types/react-dom
```

## 📚 Learning Resources

### React + TypeScript
- [React Official Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tailwind CSS
- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)

### Testing
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)

### State Management
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## 🤝 Contributing

1. **Follow the existing code style**
2. **Add tests for new features**
3. **Update documentation**
4. **Ensure all tests pass**

### Code Style Guidelines
- Use TypeScript for all new code
- Follow React hooks patterns
- Use Tailwind CSS for styling
- Add proper error handling
- Include accessibility attributes
- Write descriptive component names

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run `npm run type-check && npm run lint && npm run test`
5. Submit a pull request with clear description

## 📄 License

This project is licensed under the MIT License - see the main project LICENSE file for details.