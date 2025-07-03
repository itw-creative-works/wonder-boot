const { spawn } = require('child_process');
const path = require('path');
const chalk = require('chalk');

class ProcessManager {
  constructor(options) {
    this.command = options.process;
    this.timeout = options.timeout || 1000;
    this.trigger = options.trigger || 'crash';
    this.isRunning = false;
    this.childProcess = null;
    this.restartCount = 0;
    this.triggers = this.parseTriggers(options.trigger);
  }

  _formatMessage(message, color = null) {
    const timestamp = new Date().toTimeString().split(' ')[0];
    const coloredMessage = color ? chalk[color](message) : message;
    return `${chalk.gray('[')}${chalk.magenta(timestamp)}${chalk.gray(']')} ${chalk.cyan("'wonder-boot'")}: ${coloredMessage}`;
  }

  log(message) {
    console.log(this._formatMessage(message));
  }

  logWarn(message) {
    console.warn(this._formatMessage(message, 'yellow'));
  }

  logError(message) {
    console.error(this._formatMessage(message, 'red'));
  }

  parseTriggers(trigger) {
    if (!trigger || trigger === 'crash') {
      return ['crash'];
    }

    if (trigger === 'all') {
      return ['all'];
    }

    if (trigger === 'error') {
      return ['error'];
    }

    if (typeof trigger === 'string') {
      return trigger.split(',').map(level => level.trim());
    }

    return ['crash'];
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

    if (this.trigger === 'all') {
      // Restart on any non-zero exit (errors or crashes)
      return true;
    }

    if (this.trigger === 'crash') {
      // Only restart on actual crashes: specific signals or crash exit codes
      const crashSignals = ['SIGSEGV', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGILL'];
      if (signal && crashSignals.includes(signal)) return true;
      
      // Exit codes that typically indicate crashes (segfault, abort, etc)
      // Node.js uses 134 for SIGABRT, 139 for SIGSEGV
      const crashExitCodes = [134, 139];
      if (crashExitCodes.includes(code)) return true;
      
      return false;
    }

    if (this.trigger === 'error') {
      // Only restart on error exit codes (not crashes or signals)
      const crashExitCodes = [134, 139];
      
      // Don't restart if there's ANY signal (crash or otherwise)
      if (signal) return false;
      
      // Don't restart on crash exit codes
      if (crashExitCodes.includes(code)) return false;
      
      // Any other non-zero exit is an error
      return code !== 0;
    }

    // Check for specific signals in custom trigger list
    if (Array.isArray(this.triggers) && this.triggers.length > 0) {
      if (signal && this.triggers.includes(signal)) return true;
      
      // Also check if the exit code matches a specific value in triggers
      if (code && this.triggers.includes(String(code))) return true;
    }

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
