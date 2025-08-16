# Video Merger API Documentation

This document describes the REST API endpoints available for the Video Merger application.

## 🚀 Interactive API Documentation

**Visit the Swagger UI for interactive API documentation:**
```
http://localhost:3000/api-docs
```

The Swagger documentation provides:
- Interactive API testing interface
- Complete request/response examples
- Schema definitions
- Try-it-out functionality
- Download OpenAPI specification

## Base URL
```
http://localhost:3000
```

## API Documentation Links

- **Interactive Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI/Swagger JSON**: http://localhost:3000/swagger.json
- **Web Interface**: http://localhost:3000

## API Overview

The Video Merger API provides two main approaches for merging videos:
1. **Synchronous** - Upload and get the merged video immediately (blocking)
2. **Asynchronous** - Start a job and poll for completion (non-blocking)

## Authentication
No authentication is currently required.

## Content Types
- **Request**: `multipart/form-data` for file uploads
- **Response**: `application/json` for API responses, `video/mp4` for video downloads

---

## Endpoints

### 1. API Information
**GET** `/api`

Returns API documentation and available endpoints.

**Response:**
```json
{
  "name": "Video Merger API",
  "version": "1.0.0",
  "description": "API for merging multiple MP4 video files",
  "endpoints": { ... },
  "examples": { ... }
}
```

---

### 2. Synchronous Video Merge
**POST** `/api/merge`

Upload multiple video files and receive the merged video immediately.

**Parameters:**
- `videos` (form-data, required): Array of video files (minimum 2)
- `outputFileName` (query, optional): Custom output filename

**Example:**
```bash
curl -X POST \
  -F "videos=@video1.mp4" \
  -F "videos=@video2.mp4" \
  -F "videos=@video3.mp4" \
  "http://localhost:3000/api/merge?outputFileName=my-merged-video.mp4" \
  -o merged-video.mp4
```

**Response:**
- Success: Binary video file download
- Error: JSON error response

---

### 3. Asynchronous Video Merge (Start Job)
**POST** `/api/merge/async`

Start an asynchronous video merge job and receive a job ID for tracking.

**Parameters:**
- `videos` (form-data, required): Array of video files (minimum 2)
- `outputFileName` (query, optional): Custom output filename

**Example:**
```bash
curl -X POST \
  -F "videos=@video1.mp4" \
  -F "videos=@video2.mp4" \
  "http://localhost:3000/api/merge/async"
```

**Response:**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "started",
  "message": "Video merge job started successfully",
  "statusUrl": "/api/jobs/550e8400-e29b-41d4-a716-446655440000",
  "downloadUrl": "/api/jobs/550e8400-e29b-41d4-a716-446655440000/download"
}
```

---

### 4. Get Job Status
**GET** `/api/jobs/{jobId}`

Check the status and progress of an asynchronous merge job.

**Example:**
```bash
curl http://localhost:3000/api/jobs/550e8400-e29b-41d4-a716-446655440000
```

**Response (Processing):**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "progress": 45,
  "startTime": "2025-08-16T10:30:00.000Z"
}
```

**Response (Completed):**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "progress": 100,
  "startTime": "2025-08-16T10:30:00.000Z",
  "endTime": "2025-08-16T10:32:15.000Z",
  "duration": 135000,
  "downloadUrl": "/api/jobs/550e8400-e29b-41d4-a716-446655440000/download",
  "outputFileName": "merged-video-1723802400000.mp4"
}
```

**Response (Failed):**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "failed",
  "progress": 30,
  "startTime": "2025-08-16T10:30:00.000Z",
  "endTime": "2025-08-16T10:31:30.000Z",
  "error": "Input file format not supported"
}
```

---

### 5. Download Job Result
**GET** `/api/jobs/{jobId}/download`

Download the merged video file from a completed job.

**Example:**
```bash
curl http://localhost:3000/api/jobs/550e8400-e29b-41d4-a716-446655440000/download \
  -o merged-video.mp4
```

**Response:**
- Success: Binary video file download
- Error: JSON error response if job not ready or file not found

---

### 6. List All Jobs
**GET** `/api/jobs`

Get a list of all recent jobs (last 100).

**Example:**
```bash
curl http://localhost:3000/api/jobs
```

**Response:**
```json
{
  "jobs": [
    {
      "jobId": "550e8400-e29b-41d4-a716-446655440000",
      "status": "completed",
      "progress": 100,
      "startTime": "2025-08-16T10:30:00.000Z",
      "endTime": "2025-08-16T10:32:15.000Z",
      "outputFileName": "merged-video-1723802400000.mp4"
    }
  ],
  "total": 1
}
```

---

### 7. Delete Job
**DELETE** `/api/jobs/{jobId}`

Cancel or delete a job and clean up associated files.

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/jobs/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "message": "Job deleted successfully",
  "jobId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Status Codes

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (job or file not found)
- `500` - Internal Server Error

## Error Response Format

```json
{
  "error": "Error description",
  "code": "ERROR_CODE"
}
```

### Error Codes

- `INSUFFICIENT_FILES` - Less than 2 video files provided
- `MERGE_FAILED` - Video merge operation failed
- `JOB_START_FAILED` - Failed to start async job
- `JOB_NOT_FOUND` - Job ID not found
- `JOB_NOT_READY` - Job not completed yet
- `FILE_NOT_FOUND` - Output file not found

---

## File Upload Limits

- Maximum file size: 100MB per video
- Maximum number of files: 10 videos per request
- Supported formats: MP4 only
- Maximum total upload size: 1GB per request

---

## Usage Examples

### Python Example (Synchronous)

```python
import requests

url = "http://localhost:3000/api/merge"
files = [
    ('videos', open('video1.mp4', 'rb')),
    ('videos', open('video2.mp4', 'rb'))
]

response = requests.post(url, files=files)

if response.status_code == 200:
    with open('merged_video.mp4', 'wb') as f:
        f.write(response.content)
    print("Video merged successfully!")
else:
    print(f"Error: {response.json()}")
```

### Python Example (Asynchronous)

```python
import requests
import time

# Start job
url = "http://localhost:3000/api/merge/async"
files = [
    ('videos', open('video1.mp4', 'rb')),
    ('videos', open('video2.mp4', 'rb'))
]

response = requests.post(url, files=files)
job_data = response.json()
job_id = job_data['jobId']

# Poll for completion
while True:
    status_response = requests.get(f"http://localhost:3000/api/jobs/{job_id}")
    status = status_response.json()
    
    print(f"Progress: {status['progress']}%")
    
    if status['status'] == 'completed':
        # Download result
        download_response = requests.get(f"http://localhost:3000/api/jobs/{job_id}/download")
        with open('merged_video.mp4', 'wb') as f:
            f.write(download_response.content)
        print("Video merged and downloaded successfully!")
        break
    elif status['status'] == 'failed':
        print(f"Job failed: {status['error']}")
        break
    
    time.sleep(2)  # Wait 2 seconds before checking again
```

### JavaScript/Node.js Example

```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function mergeVideos() {
  const form = new FormData();
  form.append('videos', fs.createReadStream('video1.mp4'));
  form.append('videos', fs.createReadStream('video2.mp4'));

  try {
    const response = await axios.post('http://localhost:3000/api/merge/async', form, {
      headers: form.getHeaders()
    });
    
    const jobId = response.data.jobId;
    console.log('Job started:', jobId);
    
    // Poll for completion
    let completed = false;
    while (!completed) {
      const statusResponse = await axios.get(`http://localhost:3000/api/jobs/${jobId}`);
      const status = statusResponse.data;
      
      console.log(`Progress: ${status.progress}%`);
      
      if (status.status === 'completed') {
        // Download the result
        const downloadResponse = await axios.get(
          `http://localhost:3000/api/jobs/${jobId}/download`,
          { responseType: 'stream' }
        );
        
        downloadResponse.data.pipe(fs.createWriteStream('merged_video.mp4'));
        console.log('Video merged and downloaded successfully!');
        completed = true;
      } else if (status.status === 'failed') {
        console.error('Job failed:', status.error);
        completed = true;
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

mergeVideos();
```

---

## Rate Limiting

Currently, no rate limiting is implemented. It's recommended to implement rate limiting in production environments.

## Security Considerations

- File upload validation is performed (MP4 only)
- File size limits are enforced
- Temporary files are cleaned up automatically
- Consider implementing authentication and authorization for production use

---

## Support

For issues or questions, please refer to the application logs or contact the development team.
