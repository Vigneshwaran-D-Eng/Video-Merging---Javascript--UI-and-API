# 🎬 Video Merger Application - Complete Documentation

> A comprehensive Node.js application for merging multiple MP4 video files with both web interface and REST API capabilities.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Installation & Setup](#installation--setup)
5. [Usage Guide](#usage-guide)
6. [API Documentation](#api-documentation)
7. [Web Interface](#web-interface)
8. [File Structure](#file-structure)
9. [Development](#development)
10. [Testing](#testing)
11. [Configuration](#configuration)
12. [Troubleshooting](#troubleshooting)
13. [Contributing](#contributing)

---

## 🎯 Overview

The Video Merger Application is a full-stack solution that provides multiple ways to merge MP4 video files:

- **🌐 Web Interface**: Beautiful, responsive UI with drag-and-drop functionality
- **🔌 REST API**: Comprehensive API for programmatic access
- **📖 Interactive Documentation**: Swagger UI for API exploration
- **⚡ Dual Processing Modes**: Synchronous and asynchronous video processing
- **📊 Progress Tracking**: Real-time job monitoring and status updates

---

## ✨ Features

### 🎨 User Experience
- **Responsive Web UI**: Modern, mobile-friendly interface
- **Drag & Drop**: Intuitive file upload experience
- **Real-time Progress**: Live progress indicators and status updates
- **Automatic Downloads**: Seamless file delivery upon completion
- **File Validation**: Smart file type and size validation

### 🛠️ Technical Capabilities
- **Multiple Processing Modes**: 
  - Synchronous (immediate response)
  - Asynchronous (background processing with job tracking)
- **Job Management**: Create, monitor, and manage video processing jobs
- **REST API**: Full programmatic access with comprehensive endpoints
- **Interactive Documentation**: Swagger UI for API exploration and testing
- **Automatic Cleanup**: Intelligent file management and cleanup
- **Error Handling**: Comprehensive error handling and user feedback

### 🔧 Infrastructure
- **FFmpeg Integration**: Uses `ffmpeg-static` for reliable cross-platform video processing
- **File Upload Handling**: Robust multipart form data processing
- **Memory Management**: Efficient handling of large video files
- **Security**: File type validation and size limits
- **Cross-Platform**: Works on Windows, macOS, and Linux

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Web Browser   │◄───┤  Express Server │◄───┤    FFmpeg      │
│                 │    │                 │    │   (Static)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌────▼────┐              ┌───▼───┐              ┌────▼────┐
    │ Web UI  │              │ REST  │              │ Video   │
    │         │              │ API   │              │ Processing│
    └─────────┘              └───────┘              └─────────┘
                                 │
                            ┌────▼────┐
                            │ Swagger │
                            │   UI    │
                            └─────────┘
```

### Core Components

1. **Express Server** (`server.js`)
   - Main application server
   - Route handling and middleware
   - File upload management
   - Job scheduling and tracking

2. **Web Interface** (`public/index.html`)
   - Modern, responsive HTML5 interface
   - JavaScript for interactive functionality
   - CSS3 with gradient styling and animations

3. **REST API** (Express routes)
   - RESTful endpoints for all functionality
   - Synchronous and asynchronous processing
   - Job management and status tracking

4. **Swagger Documentation** (`swagger-config.js`)
   - OpenAPI 3.0 specification
   - Interactive API documentation
   - Request/response examples

5. **FFmpeg Integration**
   - Uses `ffmpeg-static` package
   - Cross-platform video processing
   - Automatic path configuration

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** v14.0.0 or higher
- **npm** v6.0.0 or higher

### Quick Start
```bash
# Clone or download the project
cd video-merger-app

# Install dependencies
npm install

# Start the application
npm start
```

### Development Setup
```bash
# Install development dependencies
npm install

# Start with auto-restart (development mode)
npm run dev
```

### Dependencies Overview
```json
{
  "production": {
    "express": "Web server framework",
    "multer": "File upload handling",
    "fluent-ffmpeg": "FFmpeg wrapper",
    "ffmpeg-static": "Static FFmpeg binary",
    "fs-extra": "Enhanced file system operations",
    "uuid": "Unique ID generation",
    "swagger-ui-express": "API documentation UI",
    "swagger-jsdoc": "OpenAPI specification generation"
  },
  "development": {
    "nodemon": "Auto-restart development server"
  }
}
```

---

## 📖 Usage Guide

### 🌐 Web Interface

1. **Access the Application**
   ```
   http://localhost:3000
   ```

2. **Upload Videos**
   - Click the upload area to select files
   - Or drag and drop MP4 files directly
   - Supports 2-10 videos per merge operation

3. **Monitor Progress**
   - Real-time file list with size information
   - Remove unwanted files before processing
   - Progress indicators during merge operation

4. **Download Result**
   - Automatic download upon completion
   - Files are automatically cleaned up

### 🔌 API Usage

#### Quick API Test
```bash
# Test synchronous merge
curl -X POST \
  -F "videos=@video1.mp4" \
  -F "videos=@video2.mp4" \
  "http://localhost:3000/api/merge" \
  -o merged-output.mp4

# Test asynchronous merge
curl -X POST \
  -F "videos=@video1.mp4" \
  -F "videos=@video2.mp4" \
  "http://localhost:3000/api/merge/async"
```

#### Using the JavaScript Client
```javascript
const VideoMergerAPIClient = require('./test-api');

const client = new VideoMergerAPIClient();

// Synchronous merge
const stream = await client.mergeVideosSync(['video1.mp4', 'video2.mp4']);

// Asynchronous merge
const job = await client.mergeVideosAsync(['video1.mp4', 'video2.mp4']);
const result = await client.waitForJobCompletion(job.jobId);
```

---

## 🔌 API Documentation

### 📊 Interactive Documentation
- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/swagger.json

### 🎯 Core Endpoints

| Method | Endpoint | Description | Type |
|--------|----------|-------------|------|
| `POST` | `/api/merge` | Synchronous video merge | Blocking |
| `POST` | `/api/merge/async` | Start async merge job | Non-blocking |
| `GET` | `/api/jobs/{jobId}` | Get job status | Monitoring |
| `GET` | `/api/jobs/{jobId}/download` | Download result | File delivery |
| `GET` | `/api/jobs` | List all jobs | Management |
| `DELETE` | `/api/jobs/{jobId}` | Delete/cancel job | Management |

### 📝 Request/Response Examples

#### Start Async Job
```bash
POST /api/merge/async
Content-Type: multipart/form-data

# Response
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "started",
  "message": "Video merge job started successfully",
  "statusUrl": "/api/jobs/550e8400-e29b-41d4-a716-446655440000",
  "downloadUrl": "/api/jobs/550e8400-e29b-41d4-a716-446655440000/download"
}
```

#### Check Job Status
```bash
GET /api/jobs/550e8400-e29b-41d4-a716-446655440000

# Response
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "progress": 75,
  "startTime": "2025-08-16T10:30:00.000Z"
}
```

---

## 🎨 Web Interface

### 🎯 Design Features
- **Modern UI**: Clean, professional design with gradient backgrounds
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Interactive Elements**: Hover effects, animations, and feedback
- **Accessibility**: Proper ARIA labels and keyboard navigation

### 🧩 Component Breakdown

#### Upload Area
```html
<div class="upload-area">
  <div class="upload-icon">📹</div>
  <div class="upload-text">Click to select videos or drag & drop here</div>
  <input type="file" multiple accept="video/mp4" />
</div>
```

#### File List Display
- Dynamic file list with remove functionality
- File size display in MB
- Visual file type indicators
- Progress tracking during upload

#### Status Feedback
- Success/error alerts with auto-dismiss
- Loading spinners and progress bars
- Real-time status updates

### 🎨 Styling Architecture
```css
/* Color Scheme */
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --background: #f8f9ff;
  --text-primary: #333;
  --text-secondary: #666;
  --success: #d4edda;
  --error: #f8d7da;
}

/* Component Structure */
.container > .header + .content > .upload-area + .file-list + .merge-button
```

---

## 📁 File Structure

```
video-merger-app/
├── 📄 server.js                 # Main server application
├── 📄 package.json             # Dependencies and scripts
├── 📄 swagger-config.js        # OpenAPI specification
├── 📄 test-api.js              # API client library
├── 📄 test-server.js           # Basic server test
├── 📄 examples.js              # Usage examples and demos
├── 📄 README.md                # Quick start guide
├── 📄 API_DOCUMENTATION.md     # Detailed API docs
├── 📄 COMPLETE_DOCUMENTATION.md # This file
├── 📁 public/
│   └── 📄 index.html           # Web interface
├── 📁 uploads/                 # Temporary file storage
├── 📁 output/                  # Merged video output
├── 📁 node_modules/            # Dependencies
└── 📁 *.mp4                    # Test video files
```

### 📋 File Descriptions

#### Core Application Files
- **`server.js`**: Main Express application with all routes, middleware, and FFmpeg integration
- **`public/index.html`**: Complete web interface with HTML, CSS, and JavaScript
- **`swagger-config.js`**: OpenAPI 3.0 specification for interactive documentation

#### API and Testing
- **`test-api.js`**: Full-featured API client library with all endpoint methods
- **`examples.js`**: Comprehensive usage examples and demonstrations
- **`test-server.js`**: Basic server functionality test

#### Documentation
- **`README.md`**: Quick start guide and basic usage
- **`API_DOCUMENTATION.md`**: Detailed API documentation with examples
- **`COMPLETE_DOCUMENTATION.md`**: This comprehensive documentation

#### Runtime Directories
- **`uploads/`**: Temporary storage for uploaded video files
- **`output/`**: Temporary storage for merged video files
- **`node_modules/`**: npm dependencies

---

## 🛠️ Development

### 🚀 Development Scripts
```bash
# Start development server with auto-restart
npm run dev

# Start production server
npm start

# Run API tests
node test-api.js

# Run usage examples
node examples.js
```

### 🧪 Testing Framework

#### API Client Testing
The `test-api.js` file provides a comprehensive test suite:

```javascript
// Available test functions
await testAPIInfo();        // Test API information retrieval
await testSyncMerge();      // Test synchronous video merge
await testAsyncMerge();     // Test asynchronous video merge
await testListJobs();       // Test job listing functionality
```

#### Running Tests
```bash
# Run all API tests
node test-api.js

# Run specific examples
node examples.js
```

### 🔧 Code Organization

#### Server Architecture (`server.js`)
```javascript
// Core setup
const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');

// Configuration
const app = express();
const jobStore = new Map();

// Middleware setup
app.use(express.static('public'));
app.use('/api-docs', swaggerUi.serve);

// Route organization
app.use('/api', apiRouter);        // API routes
app.get('/', serveWebInterface);   // Web interface
app.post('/merge-videos', legacy); // Legacy endpoint
```

#### API Client Architecture (`test-api.js`)
```javascript
class VideoMergerAPIClient {
  // Core functionality
  async mergeVideosSync(videoPaths, outputFileName)
  async mergeVideosAsync(videoPaths, outputFileName)
  
  // Job management
  async getJobStatus(jobId)
  async listJobs()
  async deleteJob(jobId)
  
  // Utilities
  async waitForJobCompletion(jobId, pollInterval)
  async downloadJobResult(jobId, outputPath)
}
```

---

## 🧪 Testing

### 🎯 Testing Strategy

#### 1. Unit Testing
- Individual function testing
- API endpoint validation
- Error handling verification

#### 2. Integration Testing
- Full workflow testing
- File upload and processing
- Job lifecycle management

#### 3. User Interface Testing
- Browser compatibility
- Responsive design validation
- User interaction testing

### 📊 Test Coverage

#### API Endpoints
```bash
✅ GET /api                    # API information
✅ POST /api/merge            # Synchronous merge
✅ POST /api/merge/async      # Asynchronous merge
✅ GET /api/jobs/:jobId       # Job status
✅ GET /api/jobs/:jobId/download # Download result
✅ GET /api/jobs              # List jobs
✅ DELETE /api/jobs/:jobId    # Delete job
```

#### Web Interface
```bash
✅ File upload (click)        # File selection dialog
✅ File upload (drag & drop)  # Drag and drop functionality
✅ File validation           # Type and size validation
✅ Progress indication       # Loading states and progress
✅ Error handling           # User-friendly error messages
✅ Responsive design        # Mobile and desktop layouts
```

### 🚀 Running Tests

#### Automated Testing
```bash
# Run all tests
npm test

# Run API tests only
node test-api.js

# Run example scenarios
node examples.js
```

#### Manual Testing
1. **Web Interface Testing**
   - Open http://localhost:3000
   - Test file upload (both click and drag-drop)
   - Test video merging with various file sizes
   - Test error scenarios (invalid files, etc.)

2. **API Testing**
   - Use Swagger UI at http://localhost:3000/api-docs
   - Test with curl commands
   - Use the provided JavaScript client

---

## ⚙️ Configuration

### 🔧 Environment Configuration

#### Server Configuration
```javascript
// server.js configuration options
const PORT = process.env.PORT || 3000;
const uploadsDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');

// File upload limits
const upload = multer({
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit per file
  }
});
```

#### Customizable Settings
```javascript
// File size limits
MAX_FILE_SIZE: 100MB per file
MAX_FILES: 10 files per request
MAX_TOTAL_SIZE: 1GB per request

// Processing settings
CLEANUP_DELAY: 5 seconds after download
JOB_RETENTION: 100 most recent jobs
POLL_INTERVAL: 2 seconds (async operations)

// Server settings
DEFAULT_PORT: 3000
CORS_ENABLED: true (for API access)
```

### 🎛️ Runtime Configuration

#### FFmpeg Configuration
```javascript
// Automatic FFmpeg setup
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);

// Processing options
.inputOptions('-f concat')
.inputOptions('-safe 0')
.outputOptions('-c copy')  // Stream copy for faster processing
```

#### Job Management
```javascript
// In-memory job storage
const jobStore = new Map();

// Job status tracking
const job = {
  status: 'processing',      // started, processing, completed, failed
  progress: 0,               // 0-100 percentage
  startTime: new Date(),     // Job start timestamp
  endTime: null,             // Job completion timestamp
  outputPath: null,          // Path to output file
  error: null                // Error message if failed
};
```

---

## 🐛 Troubleshooting

### 🔍 Common Issues

#### 1. **Server Won't Start**
```bash
# Check if port is in use
netstat -an | findstr :3000

# Use different port
PORT=3001 npm start

# Check Node.js version
node --version  # Should be v14+
```

#### 2. **FFmpeg Errors**
```bash
# Verify FFmpeg is working
node -e "console.log(require('ffmpeg-static'))"

# Check video file integrity
ffmpeg -i video.mp4 -f null -

# Common solutions:
# - Ensure input files are valid MP4
# - Check file permissions
# - Verify disk space for output
```

#### 3. **File Upload Issues**
```bash
# Check file size limits
# Default: 100MB per file, 10 files max

# Verify file types
# Only MP4 files are supported

# Browser console errors:
# Check Network tab for upload failures
# Verify server is responding
```

#### 4. **API Connection Issues**
```bash
# Test server accessibility
curl http://localhost:3000/api

# Check CORS issues (if accessing from browser)
# Server includes CORS headers by default

# Verify request format
# Use multipart/form-data for file uploads
```

### 🛠️ Debug Mode

#### Enable Detailed Logging
```javascript
// Add to server.js for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// FFmpeg debug output
ffmpeg()
  .on('start', (commandLine) => {
    console.log('FFmpeg command:', commandLine);
  })
  .on('stderr', (stderrLine) => {
    console.log('FFmpeg stderr:', stderrLine);
  });
```

#### Test Individual Components
```bash
# Test basic server
node test-server.js

# Test API client
node -e "const client = require('./test-api'); client.getApiInfo().then(console.log)"

# Test FFmpeg directly
node -e "console.log(require('ffmpeg-static'))"
```

### 📞 Getting Help

#### Error Messages Reference
```javascript
// Common error codes and solutions
{
  "INSUFFICIENT_FILES": "Upload at least 2 video files",
  "MERGE_FAILED": "Check video file formats and integrity",
  "JOB_NOT_FOUND": "Job may have expired or been deleted",
  "FILE_NOT_FOUND": "Output file may have been cleaned up",
  "JOB_NOT_READY": "Wait for job to complete before downloading"
}
```

#### Debug Checklist
- ✅ Server is running on correct port
- ✅ Video files are valid MP4 format
- ✅ File sizes are within limits
- ✅ Disk space is available
- ✅ FFmpeg is properly installed (via ffmpeg-static)
- ✅ Network connectivity (for API access)

---

## 🤝 Contributing

### 📋 Development Guidelines

#### Code Style
- Use consistent indentation (2 spaces)
- Follow JavaScript ES6+ conventions
- Add comments for complex logic
- Use meaningful variable names

#### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
git commit -m "Add: new feature description"
git push origin feature/new-feature

# Bug fixes
git checkout -b fix/bug-description
git commit -m "Fix: bug description"
git push origin fix/bug-description
```

#### Testing Requirements
- Test all new API endpoints
- Verify web interface changes
- Update documentation
- Add usage examples

### 🚀 Feature Requests

#### Potential Enhancements
1. **Video Format Support**
   - Add support for other video formats (AVI, MOV, etc.)
   - Automatic format conversion

2. **Advanced Processing**
   - Video quality options
   - Resolution scaling
   - Audio processing options

3. **User Management**
   - User authentication
   - Job history per user
   - Usage quotas

4. **Storage Options**
   - Cloud storage integration (AWS S3, etc.)
   - Persistent job storage
   - File sharing capabilities

5. **Performance Improvements**
   - Parallel processing
   - Queue management
   - Progress streaming

### 📝 Documentation Updates
- Keep API documentation current
- Update examples with new features
- Maintain troubleshooting guide
- Add performance tips

---

## 📜 License

MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments

- **FFmpeg** - Powerful video processing library
- **Express.js** - Fast, minimalist web framework
- **Swagger UI** - Interactive API documentation
- **Node.js Community** - Excellent ecosystem and packages

---

## 📞 Support

For issues, questions, or feature requests:

1. **Check Documentation**: Review this guide and API docs
2. **Search Issues**: Look for similar problems in troubleshooting
3. **Test Examples**: Run provided test scripts
4. **Create Issue**: Submit detailed bug reports or feature requests

---

**Happy Video Merging! 🎬✨**
