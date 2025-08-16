const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Video Merger API',
    version: '1.0.0',
    description: 'A comprehensive API for uploading, merging, and managing video files using FFmpeg',
    contact: {
      name: 'Video Merger API Support',
      email: 'support@videomerger.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ],
  tags: [
    {
      name: 'Video Operations',
      description: 'Operations for uploading and merging videos'
    },
    {
      name: 'Job Management',
      description: 'Operations for managing async video processing jobs'
    },
    {
      name: 'Downloads',
      description: 'Operations for downloading merged videos'
    }
  ],
  components: {
    schemas: {
      JobResponse: {
        type: 'object',
        properties: {
          jobId: {
            type: 'string',
            format: 'uuid',
            description: 'Unique identifier for the job',
            example: '550e8400-e29b-41d4-a716-446655440000'
          },
          status: {
            type: 'string',
            enum: ['started', 'processing', 'completed', 'failed'],
            description: 'Current status of the job'
          },
          message: {
            type: 'string',
            description: 'Descriptive message about the job status'
          },
          statusUrl: {
            type: 'string',
            description: 'URL to check job status'
          },
          downloadUrl: {
            type: 'string',
            description: 'URL to download the result (available when completed)'
          }
        }
      },
      JobStatus: {
        type: 'object',
        properties: {
          jobId: {
            type: 'string',
            format: 'uuid',
            description: 'Unique identifier for the job'
          },
          status: {
            type: 'string',
            enum: ['started', 'processing', 'completed', 'failed'],
            description: 'Current status of the job'
          },
          progress: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Progress percentage (0-100)'
          },
          startTime: {
            type: 'string',
            format: 'date-time',
            description: 'When the job was started'
          },
          endTime: {
            type: 'string',
            format: 'date-time',
            description: 'When the job was completed (if finished)'
          },
          duration: {
            type: 'number',
            description: 'Duration in milliseconds (if finished)'
          },
          downloadUrl: {
            type: 'string',
            description: 'URL to download the result (if completed)'
          },
          outputFileName: {
            type: 'string',
            description: 'Name of the output file (if completed)'
          },
          error: {
            type: 'string',
            description: 'Error message (if failed)'
          }
        }
      },
      JobsList: {
        type: 'object',
        properties: {
          jobs: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                jobId: {
                  type: 'string',
                  format: 'uuid'
                },
                status: {
                  type: 'string',
                  enum: ['started', 'processing', 'completed', 'failed']
                },
                progress: {
                  type: 'number',
                  minimum: 0,
                  maximum: 100
                },
                startTime: {
                  type: 'string',
                  format: 'date-time'
                },
                endTime: {
                  type: 'string',
                  format: 'date-time'
                },
                outputFileName: {
                  type: 'string'
                }
              }
            }
          },
          total: {
            type: 'number',
            description: 'Total number of jobs returned'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message'
          },
          code: {
            type: 'string',
            description: 'Error code for programmatic handling'
          }
        }
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Success message'
          },
          jobId: {
            type: 'string',
            format: 'uuid',
            description: 'Job ID if applicable'
          }
        }
      }
    },
    responses: {
      BadRequest: {
        description: 'Bad request - invalid input',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            examples: {
              insufficient_files: {
                summary: 'Insufficient files',
                value: {
                  error: 'Please upload at least 2 video files',
                  code: 'INSUFFICIENT_FILES'
                }
              },
              job_not_ready: {
                summary: 'Job not ready for download',
                value: {
                  error: 'Job not completed yet',
                  code: 'JOB_NOT_READY'
                }
              }
            }
          }
        }
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            examples: {
              job_not_found: {
                summary: 'Job not found',
                value: {
                  error: 'Job not found',
                  code: 'JOB_NOT_FOUND'
                }
              },
              file_not_found: {
                summary: 'File not found',
                value: {
                  error: 'Output file not found',
                  code: 'FILE_NOT_FOUND'
                }
              }
            }
          }
        }
      },
      InternalServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            examples: {
              merge_failed: {
                summary: 'Video merge failed',
                value: {
                  error: 'Failed to merge videos: FFmpeg error',
                  code: 'MERGE_FAILED'
                }
              }
            }
          }
        }
      }
    }
  },
  paths: {
    '/api/merge': {
      post: {
        tags: ['Video Operations'],
        summary: 'Merge videos synchronously',
        description: 'Upload multiple video files and get the merged result immediately. This is a synchronous operation that returns the merged video file directly.',
        operationId: 'mergeVideosSync',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  videos: {
                    type: 'array',
                    items: {
                      type: 'string',
                      format: 'binary'
                    },
                    minItems: 2,
                    maxItems: 10,
                    description: 'Video files to merge (minimum 2, maximum 10)'
                  }
                },
                required: ['videos']
              }
            }
          }
        },
        parameters: [
          {
            name: 'outputFileName',
            in: 'query',
            description: 'Optional custom name for the output file',
            required: false,
            schema: {
              type: 'string',
              example: 'my-merged-video.mp4'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Successfully merged video file',
            content: {
              'video/mp4': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          },
          '400': {
            $ref: '#/components/responses/BadRequest'
          },
          '500': {
            $ref: '#/components/responses/InternalServerError'
          }
        }
      }
    },
    '/api/merge/async': {
      post: {
        tags: ['Video Operations'],
        summary: 'Start asynchronous video merge',
        description: 'Upload multiple video files and start an asynchronous merge job. Returns a job ID that can be used to track progress and download the result.',
        operationId: 'mergeVideosAsync',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  videos: {
                    type: 'array',
                    items: {
                      type: 'string',
                      format: 'binary'
                    },
                    minItems: 2,
                    maxItems: 10,
                    description: 'Video files to merge (minimum 2, maximum 10)'
                  }
                },
                required: ['videos']
              }
            }
          }
        },
        parameters: [
          {
            name: 'outputFileName',
            in: 'query',
            description: 'Optional custom name for the output file',
            required: false,
            schema: {
              type: 'string',
              example: 'my-merged-video.mp4'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Job started successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/JobResponse'
                },
                example: {
                  jobId: '550e8400-e29b-41d4-a716-446655440000',
                  status: 'started',
                  message: 'Video merge job started successfully',
                  statusUrl: '/api/jobs/550e8400-e29b-41d4-a716-446655440000',
                  downloadUrl: '/api/jobs/550e8400-e29b-41d4-a716-446655440000/download'
                }
              }
            }
          },
          '400': {
            $ref: '#/components/responses/BadRequest'
          },
          '500': {
            $ref: '#/components/responses/InternalServerError'
          }
        }
      }
    },
    '/api/jobs/{jobId}': {
      get: {
        tags: ['Job Management'],
        summary: 'Get job status',
        description: 'Get the current status and progress of a video merge job.',
        operationId: 'getJobStatus',
        parameters: [
          {
            name: 'jobId',
            in: 'path',
            required: true,
            description: 'Unique job identifier',
            schema: {
              type: 'string',
              format: 'uuid'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Job status retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/JobStatus'
                },
                examples: {
                  processing: {
                    summary: 'Job in progress',
                    value: {
                      jobId: '550e8400-e29b-41d4-a716-446655440000',
                      status: 'processing',
                      progress: 45,
                      startTime: '2025-08-16T10:30:00.000Z'
                    }
                  },
                  completed: {
                    summary: 'Job completed',
                    value: {
                      jobId: '550e8400-e29b-41d4-a716-446655440000',
                      status: 'completed',
                      progress: 100,
                      startTime: '2025-08-16T10:30:00.000Z',
                      endTime: '2025-08-16T10:35:30.000Z',
                      duration: 330000,
                      downloadUrl: '/api/jobs/550e8400-e29b-41d4-a716-446655440000/download',
                      outputFileName: 'merged-video-1755175145231.mp4'
                    }
                  },
                  failed: {
                    summary: 'Job failed',
                    value: {
                      jobId: '550e8400-e29b-41d4-a716-446655440000',
                      status: 'failed',
                      progress: 30,
                      startTime: '2025-08-16T10:30:00.000Z',
                      endTime: '2025-08-16T10:32:15.000Z',
                      error: 'FFmpeg encoding error: Invalid codec parameters'
                    }
                  }
                }
              }
            }
          },
          '404': {
            $ref: '#/components/responses/NotFound'
          }
        }
      },
      delete: {
        tags: ['Job Management'],
        summary: 'Delete job',
        description: 'Cancel or delete a video merge job and clean up associated files.',
        operationId: 'deleteJob',
        parameters: [
          {
            name: 'jobId',
            in: 'path',
            required: true,
            description: 'Unique job identifier',
            schema: {
              type: 'string',
              format: 'uuid'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Job deleted successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse'
                },
                example: {
                  message: 'Job deleted successfully',
                  jobId: '550e8400-e29b-41d4-a716-446655440000'
                }
              }
            }
          },
          '404': {
            $ref: '#/components/responses/NotFound'
          }
        }
      }
    },
    '/api/jobs/{jobId}/download': {
      get: {
        tags: ['Downloads'],
        summary: 'Download merged video',
        description: 'Download the result of a completed video merge job.',
        operationId: 'downloadMergedVideo',
        parameters: [
          {
            name: 'jobId',
            in: 'path',
            required: true,
            description: 'Unique job identifier',
            schema: {
              type: 'string',
              format: 'uuid'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Merged video file',
            content: {
              'video/mp4': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          },
          '400': {
            $ref: '#/components/responses/BadRequest'
          },
          '404': {
            $ref: '#/components/responses/NotFound'
          }
        }
      }
    },
    '/api/jobs': {
      get: {
        tags: ['Job Management'],
        summary: 'List all jobs',
        description: 'Get a list of all video merge jobs (recent 100).',
        operationId: 'listJobs',
        responses: {
          '200': {
            description: 'List of jobs retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/JobsList'
                },
                example: {
                  jobs: [
                    {
                      jobId: '550e8400-e29b-41d4-a716-446655440000',
                      status: 'completed',
                      progress: 100,
                      startTime: '2025-08-16T10:30:00.000Z',
                      endTime: '2025-08-16T10:35:30.000Z',
                      outputFileName: 'merged-video-1755175145231.mp4'
                    },
                    {
                      jobId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
                      status: 'processing',
                      progress: 65,
                      startTime: '2025-08-16T11:15:00.000Z',
                      outputFileName: 'my-custom-video.mp4'
                    }
                  ],
                  total: 2
                }
              }
            }
          }
        }
      }
    }
  }
};

const options = {
  definition: swaggerDefinition,
  apis: [], // We're defining everything in the definition above
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
