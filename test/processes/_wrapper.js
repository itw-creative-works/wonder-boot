#!/usr/bin/env node

const ProcessManager = require('../../dist/index.js');

// Parse command line arguments
const args = process.argv.slice(2);
const processPath = args[0];
const options = JSON.parse(args[1] || '{}');

// Create and start the process manager
const manager = new ProcessManager({
  process: processPath,
  timeout: options.timeout || 1000,
  trigger: options.trigger || 'crash'
});

// Track restart count for testing
let restartCount = 0;
const maxRestarts = options.maxRestarts || 2;

// Override handleExit to limit restarts during testing
const originalHandleExit = manager.handleExit.bind(manager);
manager.handleExit = function(code, signal) {
  console.log(`WRAPPER: Process exited with code ${code}`);
  
  if (manager.shouldRestart(code, signal)) {
    restartCount++;
    console.log(`WRAPPER: Restart count: ${restartCount}`);
    
    if (restartCount >= maxRestarts) {
      console.log(`WRAPPER: Max restarts reached, exiting`);
      process.exit(0);
    }
  }
  
  originalHandleExit(code, signal);
};

// Handle wrapper shutdown
process.on('SIGINT', () => {
  manager.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  manager.stop();
  process.exit(0);
});

// Start the process
manager.start();