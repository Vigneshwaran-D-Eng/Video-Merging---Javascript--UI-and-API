#!/usr/bin/env node

/**
 * Simple example script demonstrating how to use the Video Merger API
 * Run with: node examples.js
 */

const VideoMergerAPIClient = require('./test-api');
const path = require('path');
const fs = require('fs');

async function example1_SynchronousMerge() {
  console.log('\n📹 Example 1: Synchronous Video Merge');
  console.log('=====================================');
  
  const client = new VideoMergerAPIClient();
  
  try {
    // Check if we have video files to work with
    const videoFiles = [
      path.join(__dirname, '2f2b345f7dca47f2a07e2c8289cafbda.mp4'),
      path.join(__dirname, '60fa7632eaa543008c055ad5f608042b.mp4')
    ];
    
    // Verify files exist
    const existingFiles = videoFiles.filter(file => fs.existsSync(file));
    if (existingFiles.length < 2) {
      console.log('⚠️  Need at least 2 video files in the directory to run this example');
      return;
    }
    
    console.log(`Merging ${existingFiles.length} videos synchronously...`);
    console.log('Files:', existingFiles.map(f => path.basename(f)));
    
    const stream = await client.mergeVideosSync(existingFiles, 'example1-output.mp4');
    
    const outputPath = path.join(__dirname, 'example1-merged.mp4');
    const writer = fs.createWriteStream(outputPath);
    stream.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`✅ Success! Merged video saved to: ${outputPath}`);
        console.log(`📄 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
        resolve();
      });
      writer.on('error', reject);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function example2_AsynchronousMerge() {
  console.log('\n🔄 Example 2: Asynchronous Video Merge with Progress Tracking');
  console.log('==============================================================');
  
  const client = new VideoMergerAPIClient();
  
  try {
    const videoFiles = [
      path.join(__dirname, '6f8affa92b3c428da5f5b730780b0741.mp4'),
      path.join(__dirname, '704b098c095048e885277a5a466688d9.mp4')
    ];
    
    const existingFiles = videoFiles.filter(file => fs.existsSync(file));
    if (existingFiles.length < 2) {
      console.log('⚠️  Need at least 2 video files in the directory to run this example');
      return;
    }
    
    console.log(`Starting async merge of ${existingFiles.length} videos...`);
    console.log('Files:', existingFiles.map(f => path.basename(f)));
    
    // Start the job
    const jobInfo = await client.mergeVideosAsync(existingFiles, 'example2-async-output.mp4');
    console.log(`🚀 Job started! Job ID: ${jobInfo.jobId}`);
    
    // Monitor progress
    console.log('📊 Monitoring progress...');
    let lastProgress = -1;
    
    const finalStatus = await client.waitForJobCompletion(jobInfo.jobId, 1000); // Poll every 1 second
    
    console.log('✅ Job completed successfully!');
    console.log(`⏱️  Duration: ${finalStatus.duration}ms`);
    
    // Download the result
    console.log('📥 Downloading result...');
    const outputPath = path.join(__dirname, 'example2-async-merged.mp4');
    await client.downloadJobResult(jobInfo.jobId, outputPath);
    
    console.log(`✅ Success! Merged video saved to: ${outputPath}`);
    console.log(`📄 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function example3_JobManagement() {
  console.log('\n📋 Example 3: Job Management');
  console.log('=============================');
  
  const client = new VideoMergerAPIClient();
  
  try {
    // List current jobs
    console.log('📝 Listing current jobs...');
    const jobs = await client.listJobs();
    
    if (jobs.total === 0) {
      console.log('📭 No jobs found');
    } else {
      console.log(`📊 Found ${jobs.total} jobs:`);
      jobs.jobs.forEach((job, index) => {
        console.log(`  ${index + 1}. Job ${job.jobId.substring(0, 8)}...`);
        console.log(`     Status: ${job.status} (${job.progress}%)`);
        console.log(`     Started: ${new Date(job.startTime).toLocaleString()}`);
        if (job.endTime) {
          console.log(`     Finished: ${new Date(job.endTime).toLocaleString()}`);
        }
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function example4_APIInfo() {
  console.log('\n📖 Example 4: API Information');
  console.log('==============================');
  
  const client = new VideoMergerAPIClient();
  
  try {
    const apiInfo = await client.getApiInfo();
    
    console.log(`📋 API: ${apiInfo.name} v${apiInfo.version}`);
    console.log(`📝 Description: ${apiInfo.description}`);
    console.log('\n🔗 Available endpoints:');
    
    Object.entries(apiInfo.endpoints).forEach(([endpoint, info]) => {
      console.log(`  ${endpoint}`);
      console.log(`    📄 ${info.description}`);
    });
    
    console.log('\n💡 Example cURL commands:');
    Object.entries(apiInfo.examples).forEach(([key, command]) => {
      console.log(`  ${key}:`);
      console.log(`    ${command}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function main() {
  console.log('🎬 Video Merger API Examples');
  console.log('============================');
  console.log('This script demonstrates how to use the Video Merger API programmatically.');
  console.log('Make sure the server is running on http://localhost:3000\n');
  
  try {
    // Test server connectivity
    const client = new VideoMergerAPIClient();
    await client.getApiInfo();
    console.log('✅ Server is running and accessible\n');
    
    // Run examples
    await example4_APIInfo();
    await example1_SynchronousMerge();
    await example2_AsynchronousMerge();
    await example3_JobManagement();
    
    console.log('\n🎉 All examples completed successfully!');
    console.log('\n💡 Tips:');
    console.log('  - Use synchronous merge for small files or when you need immediate results');
    console.log('  - Use asynchronous merge for large files or when processing multiple jobs');
    console.log('  - Monitor job progress to provide user feedback');
    console.log('  - Clean up completed jobs to save disk space');
    
  } catch (error) {
    console.error('\n💥 Examples failed to run:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('  1. Make sure the server is running: npm start');
    console.log('  2. Check if the server is accessible at http://localhost:3000');
    console.log('  3. Ensure you have video files in the directory for testing');
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  example1_SynchronousMerge,
  example2_AsynchronousMerge,
  example3_JobManagement,
  example4_APIInfo
};
