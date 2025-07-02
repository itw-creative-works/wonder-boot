const { spawn } = require('child_process');
const path = require('path');
const chalk = require('chalk');

class ProcessManager {
  constructor(options) {
    this.command = options.process;
    this.timeout = options.timeout || 1000;
    this.trigger = options.trigger || 'all';
    this.isRunning = false;
    this.childProcess = null;
    this.restartCount = 0;
    this.triggers = this.parseTriggers(options.trigger);
  }

  log(message) {
    const timestamp = new Date().toTimeString().split(' ')[0];
    console.log(`[${chalk.gray(timestamp)}] ${chalk.cyan("'wonder-boot'")}: ${message}`);
  }

  logError(message) {
    const timestamp = new Date().toTimeString().split(' ')[0];
    console.error(`[${chalk.gray(timestamp)}] ${chalk.cyan("'wonder-boot'")}: ${chalk.red(message)}`);
  }

  parseTriggers(trigger) {
    if (!trigger || trigger === 'all') {
      return ['uncaughtException', 'unhandledRejection', 'SIGINT', 'SIGTERM', 'exit'];
    }

    if (trigger === 'crash') {
      return ['uncaughtException', 'unhandledRejection', 'SIGSEGV', 'SIGABRT'];
    }

    if (typeof trigger === 'string') {
      return trigger.split(',').map(level => level.trim());
    }

    return ['all'];
  }

  parseCommand() {
    if (this.command.endsWith('.js') && !this.command.includes(' ')) {
      return {
        cmd: 'node',
        args: [path.resolve(this.command)]
      };
    }

    const parts = this.command.split(' ');
    return {
      cmd: parts[0],
      args: parts.slice(1)
    };
  }

  shouldRestart(code, signal) {
    if (code === 0) return false;

    if (this.trigger === 'all') return true;

    if (this.trigger === 'crash' && (code !== 0 || signal)) return true;

    return false;
  }

  start() {
    if (this.isRunning) return;

    const { cmd, args } = this.parseCommand();

    this.log(`Starting process: ${chalk.cyan(cmd + ' ' + args.join(' '))}`);

    this.isRunning = true;
    this.childProcess = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true
    });

    this.childProcess.on('error', (error) => {
      this.logError(`Process error: ${error.message}`);
      this.handleExit(1, null);
    });

    this.childProcess.on('exit', (code, signal) => {
      this.handleExit(code, signal);
    });
  }

  handleExit(code, signal) {
    this.isRunning = false;

    this.log(`Process exited with code ${chalk.yellow(code)} and signal ${chalk.yellow(signal)}`);

    if (this.shouldRestart(code, signal)) {
      this.restartCount++;
      this.log(`Restarting process in ${chalk.cyan(this.timeout + 'ms')}... (restart #${chalk.yellow(this.restartCount)})`);

      setTimeout(() => {
        this.start();
      }, this.timeout);
    } else {
      this.log(chalk.green('Process exited cleanly, not restarting.'));
      process.exit(code || 0);
    }
  }

  stop() {
    if (this.childProcess) {
      this.childProcess.kill('SIGTERM');
      this.childProcess = null;
      this.isRunning = false;
    }
  }
}

module.exports = ProcessManager;
