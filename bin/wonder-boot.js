#!/usr/bin/env node

const ProcessManager = require('../dist/index.js');
const chalk = require('chalk');

function log(message) {
  const timestamp = new Date().toTimeString().split(' ')[0];
  console.log(`[${chalk.gray(timestamp)}] ${chalk.cyan("'wonder-boot'")}: ${message}`);
}

function logError(message) {
  const timestamp = new Date().toTimeString().split(' ')[0];
  console.error(`[${chalk.gray(timestamp)}] ${chalk.cyan("'wonder-boot'")}: ${chalk.red(message)}`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--process=')) {
      options.process = arg.substring('--process='.length);
    } else if (arg.startsWith('--timeout=')) {
      options.timeout = parseInt(arg.substring('--timeout='.length));
    } else if (arg.startsWith('--trigger=')) {
      options.trigger = arg.substring('--trigger='.length);
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }
  }

  if (!options.process) {
    logError('--process parameter is required');
    showHelp();
    process.exit(1);
  }

  return options;
}

function showHelp() {
  console.log(`
${chalk.cyan('wonder-boot')} - A simple process manager that restarts crashed processes

Usage:
  wonder-boot --process="path/to/process.js"
  wonder-boot --process="command to run"

Options:
  --process=<command>      The process or command to run (required)
  --timeout=<ms>          Restart delay in milliseconds (default: 1000)
  --trigger=<level>    Error level that triggers restart:
                          - crash: restart only on crashes (default)
                          - all: restart on any non-zero exit
                          - <comma-separated list>: specific error types
                            (uncaughtException, unhandledRejection, SIGINT, etc.)
  --help, -h              Show this help message

Examples:
  wonder-boot --process="node server.js"
  wonder-boot --process="npm start" --timeout=5000
  wonder-boot --process="./app.js" --trigger=crash
  wonder-boot --process="node app.js" --trigger="uncaughtException,unhandledRejection"
`);
}

const options = parseArgs();
const manager = new ProcessManager(options);

process.on('SIGINT', () => {
  log(chalk.yellow('Received SIGINT, shutting down gracefully...'));
  manager.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log(chalk.yellow('Received SIGTERM, shutting down gracefully...'));
  manager.stop();
  process.exit(0);
});

manager.start();
