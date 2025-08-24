# AI Video Creator Frontend

Modern React TypeScript frontend for the AI Video Creator platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🧪 Testing

### E2E Testing with Playwright

```bash
# Install Playwright browsers
npx playwright install

# Run tests
npm run test

# Run tests with UI
npm run test:ui
```

### Type Checking

```bash
npm run type-check
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code (if using Prettier)
npm run format
```

## 🏗️ Architecture

### Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # UI components (Header, Navigation)
│   ├── forms/           # Form components (TextToVideo, ImageToVideo)
│   └── status/          # Status components (JobStatus, JobCard)
├── services/            # API services
├── stores/              # Zustand state management
├── types/               # TypeScript type definitions
└── main.tsx             # Application entry point
```

### Key Technologies

- **React 18** - UI framework with hooks and concurrent features
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Zustand** - Lightweight state management
- **Axios** - HTTP client for API communication
- **Framer Motion** - Animation library
- **React Hot Toast** - Toast notifications
- **React Dropzone** - File upload handling
- **Playwright** - E2E testing framework

## 🎯 Features

### ✨ Text-to-Video Generation
- Rich text prompt input with character counting
- Configurable duration, aspect ratio, style, and quality
- Form validation and error handling
- Real-time preview of settings

### 🖼️ Image-to-Video Animation
- Drag-and-drop image upload
- Motion description input
- Configurable animation parameters
- File type and size validation

### 📊 Job Status Tracking
- Real-time job status updates
- Job filtering and search
- Download and preview capabilities
- Progress monitoring with polling

### 📱 Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Accessible navigation
- Cross-browser compatibility

## 🔗 API Integration

The frontend integrates with the FastAPI backend running at:
- **Development**: `http://localhost:8000`
- **Production**: `https://ai-video-creator-irf1.onrender.com`

### API Endpoints Used

```typescript
// Text-to-video generation
POST /api/v1/video/generate/text

// Image-to-video generation  
POST /api/v1/video/generate/image

// Job status checking
GET /api/v1/status/jobs/{job_id}

// User jobs listing
GET /api/v1/status/user/{user_id}/jobs

// Health checking
GET /health
GET /ping
```

## 🧪 Testing Strategy

### E2E Test Coverage
- **App Navigation** - Tab switching, header links, footer
- **Form Validation** - Required fields, input limits, error states
- **User Interactions** - Form submission, job creation, status updates
- **Accessibility** - ARIA labels, keyboard navigation, screen readers
- **Responsive Design** - Mobile/desktop layouts, touch interactions

### Test Files
- `tests/e2e/app.spec.ts` - General app functionality
- `tests/e2e/text-to-video.spec.ts` - Text-to-video form testing
- `tests/e2e/image-to-video.spec.ts` - Image-to-video form testing

## 🚀 Deployment

### GitHub Pages (Automatic)
The frontend is automatically deployed to GitHub Pages on push to main branch.

**Live URL**: https://djyalu.github.io/ai_video_creator/

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy dist/ folder to your hosting service
```

### Environment Variables

For production deployment, configure:

```env
VITE_API_BASE_URL=https://your-api-domain.com
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3b82f6, #2563eb)
- **Success**: Green (#22c55e, #16a34a) 
- **Warning**: Orange (#f59e0b, #d97706)
- **Error**: Red (#ef4444, #dc2626)

### Typography
- **Headers**: Font weight 700-900
- **Body**: Font weight 400-500
- **Labels**: Font weight 500-600

### Spacing
- Uses Tailwind's spacing scale (0.25rem increments)
- Consistent padding/margin patterns
- Responsive breakpoints

## 📦 Build Optimization

### Bundle Analysis
- Code splitting by route and vendor
- Dynamic imports for large components
- Tree shaking for unused code
- Asset optimization

### Performance Features
- Image lazy loading
- Component lazy loading
- Service worker caching (future enhancement)
- Progressive Web App features (future enhancement)

## 🔧 Development Tools

### VS Code Extensions (Recommended)
- TypeScript Importer
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- Playwright Test for VS Code

### Dev Dependencies
- **@vitejs/plugin-react** - Vite React support
- **@typescript-eslint/** - TypeScript linting
- **autoprefixer** - CSS prefixing
- **tailwindcss** - CSS framework

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting PR

### Code Style
- Use TypeScript for all new code
- Follow React hooks patterns
- Use Tailwind CSS for styling
- Add proper error handling
- Include accessibility attributes

## 📄 License

This project is licensed under the MIT License - see the main project LICENSE file for details.

## 🙏 Acknowledgments

- **React Team** - For the excellent React framework
- **Tailwind Labs** - For Tailwind CSS
- **Vercel** - For Vite build tooling
- **Microsoft** - For Playwright testing framework