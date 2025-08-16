# 🎬 Video Merger Application

> A modern Node.js application for merging multiple MP4 videos with both web interface and REST API capabilities.

[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-Static-red.svg)](https://ffmpeg.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## ✨ Features

- **🌐 Modern Web Interface**: Beautiful, responsive UI with drag-and-drop functionality
- **🔌 Comprehensive REST API**: Full programmatic access with Swagger documentation
- **⚡ Dual Processing Modes**: Synchronous and asynchronous video processing
- **📊 Real-time Progress Tracking**: Live job monitoring and status updates
- **🛡️ Built-in Security**: File validation, size limits, and error handling
- **📱 Cross-Platform**: Works on Windows, macOS, and Linux

## 🚀 Quick Start

### Prerequisites
- **Node.js** v14.0.0 or higher

**Note**: FFmpeg is automatically included via the `ffmpeg-static` npm package - no manual installation required!

### Installation
```bash
# Clone or download this project
cd video-merger-app

# Install dependencies
npm install

# Start the application
npm start
```

### Access Points
- **Web Interface**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **OpenAPI Specification**: http://localhost:3000/swagger.json

## 🎯 Usage

### 🌐 Web Interface
1. Open http://localhost:3000 in your browser
2. Upload 2 or more MP4 video files (drag & drop or click to select)
3. Click "Merge Videos" and wait for processing
4. Download automatically starts when complete

### 🔌 API Usage
```bash
# Synchronous merge (immediate response)
curl -X POST \
  -F "videos=@video1.mp4" \
  -F "videos=@video2.mp4" \
  "http://localhost:3000/api/merge" \
  -o merged-video.mp4

# Asynchronous merge (background processing)
curl -X POST \
  -F "videos=@video1.mp4" \
  -F "videos=@video2.mp4" \
  "http://localhost:3000/api/merge/async"
```

### 📖 Interactive API Documentation
Visit http://localhost:3000/api-docs to:
- Explore all API endpoints
- Test requests directly in the browser
- View detailed request/response schemas
- Download the OpenAPI specification

## 📋 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/merge` | Synchronous video merge |
| `POST` | `/api/merge/async` | Start asynchronous merge job |
| `GET` | `/api/jobs/{jobId}` | Get job status and progress |
| `GET` | `/api/jobs/{jobId}/download` | Download merged video |
| `GET` | `/api/jobs` | List all jobs |
| `DELETE` | `/api/jobs/{jobId}` | Delete/cancel job |

## 📁 Project Structure

```
video-merger-app/
├── server.js                    # Main application server
├── package.json                 # Dependencies and scripts
├── swagger-config.js           # API documentation configuration
├── public/index.html           # Web interface
├── uploads/                    # Temporary file storage
└── output/                     # Merged video output
```

## ⚙️ Configuration

- **Port**: Default 3000 (configurable via `PORT` environment variable)
- **File Size Limit**: 100MB per video file
- **Maximum Files**: 10 videos per merge operation
- **Supported Formats**: MP4 only

## 🧪 Testing

```bash
# Run API tests
node test-api.js

# Run usage examples
node examples.js

# Development mode with auto-restart
npm run dev
```

## 📚 Documentation

- **[Complete Documentation](COMPLETE_DOCUMENTATION.md)** - Comprehensive guide covering all features
- **[API Documentation](API_DOCUMENTATION.md)** - Detailed API reference with examples
- **[Interactive Swagger UI](http://localhost:3000/api-docs)** - Test APIs in your browser

## 🐛 Troubleshooting

### Common Issues
1. **Server won't start**: Check if port 3000 is available
2. **Upload fails**: Ensure files are MP4 format and under 100MB
3. **API errors**: Check the interactive documentation for correct request format

For detailed troubleshooting, see [COMPLETE_DOCUMENTATION.md](COMPLETE_DOCUMENTATION.md#troubleshooting).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m "Add new feature"`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request
