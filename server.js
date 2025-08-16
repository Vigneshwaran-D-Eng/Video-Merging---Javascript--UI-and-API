const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger-config');

console.log('Starting video merger application...');
console.log('FFmpeg path:', ffmpegPath);

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const PORT = process.env.PORT || 3000;

// Store for tracking job progress
const jobStore = new Map();

// Create uploads and output directories
const uploadsDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');

fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(outputDir);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
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

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Video Merger API Documentation',
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    showRequestHeaders: true
  }
}));

// Serve swagger.json
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API Routes prefix
const apiRouter = express.Router();

// Helper function to process video merging
async function processVideoMerge(files, jobId = null, options = {}) {
  const outputFileName = options.outputFileName || `merged-video-${Date.now()}.mp4`;
  const outputPath = path.join(outputDir, outputFileName);
  
  // Update job status if jobId provided
  if (jobId) {
    jobStore.set(jobId, {
      status: 'processing',
      progress: 0,
      startTime: new Date(),
      outputFileName
    });
  }
  
  // Create a temporary file list for FFmpeg concat demuxer
  const fileListPath = path.join(__dirname, `filelist-${Date.now()}.txt`);
  const fileListContent = files.map(file => `file '${file.path}'`).join('\n');
  
  await fs.writeFile(fileListPath, fileListContent);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(fileListPath)
      .inputOptions('-f concat')
      .inputOptions('-safe 0')
      .outputOptions('-c copy')
      .save(outputPath)
      .on('start', (commandLine) => {
        console.log('FFmpeg process started:', commandLine);
        if (jobId) {
          const job = jobStore.get(jobId);
          if (job) {
            job.status = 'processing';
            job.commandLine = commandLine;
          }
        }
      })
      .on('progress', (progress) => {
        console.log('Processing: ' + progress.percent + '% done');
        if (jobId) {
          const job = jobStore.get(jobId);
          if (job) {
            job.progress = Math.round(progress.percent || 0);
          }
        }
      })
      .on('end', async () => {
        console.log('Video merging completed');
        
        // Clean up uploaded files and file list
        await Promise.all(files.map(file => fs.remove(file.path)));
        await fs.remove(fileListPath);
        
        if (jobId) {
          const job = jobStore.get(jobId);
          if (job) {
            job.status = 'completed';
            job.progress = 100;
            job.endTime = new Date();
            job.outputPath = outputPath;
          }
        }
        
        resolve({ outputPath, outputFileName });
      })
      .on('error', async (err, stdout, stderr) => {
        console.error('Error:', err.message);
        console.error('FFmpeg stderr:', stderr);
        
        // Clean up files on error
        await Promise.all(files.map(file => fs.remove(file.path).catch(() => {})));
        await fs.remove(fileListPath).catch(() => {});
        
        if (jobId) {
          const job = jobStore.get(jobId);
          if (job) {
            job.status = 'failed';
            job.error = err.message;
            job.endTime = new Date();
          }
        }
        
        reject(err);
      });
  });
}

// Route to serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Video Merger API',
    version: '1.0.0',
    description: 'API for merging multiple MP4 video files',
    endpoints: {
      'POST /api/merge': {
        description: 'Upload and merge multiple video files',
        parameters: {
          videos: 'Array of video files (multipart/form-data)',
          outputFileName: 'Optional output filename (query parameter)'
        },
        response: 'Binary video file download'
      },
      'POST /api/merge/async': {
        description: 'Start async video merge job',
        parameters: {
          videos: 'Array of video files (multipart/form-data)',
          outputFileName: 'Optional output filename (query parameter)'
        },
        response: 'Job information with jobId'
      },
      'GET /api/jobs/:jobId': {
        description: 'Get status of async merge job',
        response: 'Job status and progress information'
      },
      'GET /api/jobs/:jobId/download': {
        description: 'Download completed merge job result',
        response: 'Binary video file download'
      },
      'GET /api/jobs': {
        description: 'List all jobs (recent 100)',
        response: 'Array of job information'
      },
      'DELETE /api/jobs/:jobId': {
        description: 'Cancel or delete a job',
        response: 'Deletion status'
      }
    },
    examples: {
      curl_sync: 'curl -X POST -F "videos=@video1.mp4" -F "videos=@video2.mp4" http://localhost:3000/api/merge -o merged.mp4',
      curl_async: 'curl -X POST -F "videos=@video1.mp4" -F "videos=@video2.mp4" http://localhost:3000/api/merge/async'
    }
  });
});

// API Routes

// Synchronous merge - returns file directly
apiRouter.post('/merge', upload.array('videos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ 
        error: 'Please upload at least 2 video files',
        code: 'INSUFFICIENT_FILES'
      });
    }

    const outputFileName = req.query.outputFileName || `merged-video-${Date.now()}.mp4`;
    
    const result = await processVideoMerge(req.files, null, { outputFileName });

    // Send the merged video file
    res.download(result.outputPath, result.outputFileName, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up output file after download
      setTimeout(() => {
        fs.remove(result.outputPath).catch(console.error);
      }, 5000);
    });

  } catch (error) {
    console.error('Error merging videos:', error);
    res.status(500).json({ 
      error: 'Failed to merge videos: ' + error.message,
      code: 'MERGE_FAILED'
    });
  }
});

// Asynchronous merge - returns job ID for tracking
apiRouter.post('/merge/async', upload.array('videos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ 
        error: 'Please upload at least 2 video files',
        code: 'INSUFFICIENT_FILES'
      });
    }

    const jobId = uuidv4();
    const outputFileName = req.query.outputFileName || `merged-video-${Date.now()}.mp4`;
    
    // Start async processing
    processVideoMerge(req.files, jobId, { outputFileName }).catch(error => {
      console.error('Async merge error:', error);
    });

    res.json({
      jobId,
      status: 'started',
      message: 'Video merge job started successfully',
      statusUrl: `/api/jobs/${jobId}`,
      downloadUrl: `/api/jobs/${jobId}/download`
    });

  } catch (error) {
    console.error('Error starting merge job:', error);
    res.status(500).json({ 
      error: 'Failed to start merge job: ' + error.message,
      code: 'JOB_START_FAILED'
    });
  }
});

// Get job status
apiRouter.get('/jobs/:jobId', (req, res) => {
  const jobId = req.params.jobId;
  const job = jobStore.get(jobId);
  
  if (!job) {
    return res.status(404).json({ 
      error: 'Job not found',
      code: 'JOB_NOT_FOUND'
    });
  }

  const response = {
    jobId,
    status: job.status,
    progress: job.progress,
    startTime: job.startTime
  };

  if (job.endTime) {
    response.endTime = job.endTime;
    response.duration = job.endTime - job.startTime;
  }

  if (job.error) {
    response.error = job.error;
  }

  if (job.status === 'completed') {
    response.downloadUrl = `/api/jobs/${jobId}/download`;
    response.outputFileName = job.outputFileName;
  }

  res.json(response);
});

// Download completed job result
apiRouter.get('/jobs/:jobId/download', (req, res) => {
  const jobId = req.params.jobId;
  const job = jobStore.get(jobId);
  
  if (!job) {
    return res.status(404).json({ 
      error: 'Job not found',
      code: 'JOB_NOT_FOUND'
    });
  }

  if (job.status !== 'completed') {
    return res.status(400).json({ 
      error: 'Job not completed yet',
      code: 'JOB_NOT_READY',
      status: job.status,
      progress: job.progress
    });
  }

  if (!job.outputPath || !fs.existsSync(job.outputPath)) {
    return res.status(404).json({ 
      error: 'Output file not found',
      code: 'FILE_NOT_FOUND'
    });
  }

  res.download(job.outputPath, job.outputFileName, (err) => {
    if (err) {
      console.error('Download error:', err);
    }
    // Clean up output file after download
    setTimeout(() => {
      fs.remove(job.outputPath).catch(console.error);
      jobStore.delete(jobId);
    }, 5000);
  });
});

// List all jobs (recent 100)
apiRouter.get('/jobs', (req, res) => {
  const jobs = Array.from(jobStore.entries()).map(([jobId, job]) => ({
    jobId,
    status: job.status,
    progress: job.progress,
    startTime: job.startTime,
    endTime: job.endTime,
    outputFileName: job.outputFileName
  })).slice(-100); // Return last 100 jobs

  res.json({
    jobs,
    total: jobs.length
  });
});

// Cancel or delete a job
apiRouter.delete('/jobs/:jobId', (req, res) => {
  const jobId = req.params.jobId;
  const job = jobStore.get(jobId);
  
  if (!job) {
    return res.status(404).json({ 
      error: 'Job not found',
      code: 'JOB_NOT_FOUND'
    });
  }

  // Clean up output file if exists
  if (job.outputPath) {
    fs.remove(job.outputPath).catch(console.error);
  }

  jobStore.delete(jobId);

  res.json({
    message: 'Job deleted successfully',
    jobId
  });
});

// Mount API router
app.use('/api', apiRouter);

// Legacy route for UI compatibility - keep existing functionality
app.post('/merge-videos', upload.array('videos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'Please upload at least 2 video files' });
    }

    const result = await processVideoMerge(req.files);

    // Send the merged video file
    res.download(result.outputPath, result.outputFileName, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up output file after download
      setTimeout(() => {
        fs.remove(result.outputPath).catch(console.error);
      }, 5000);
    });

  } catch (error) {
    console.error('Error merging videos:', error);
    res.status(500).json({ error: 'Failed to merge videos: ' + error.message });
  }
});

// Route to get merge progress (for future enhancement)
app.get('/merge-status/:id', (req, res) => {
  // This can be implemented for real-time progress updates
  res.json({ status: 'processing' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large' });
    }
  }
  res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`Video merger app is running on http://localhost:${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`Swagger JSON available at http://localhost:${PORT}/swagger.json`);
  console.log('Make sure FFmpeg is installed and available in your system PATH');
});
