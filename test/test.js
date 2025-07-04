const package = require('../package.json');
const assert = require('assert');
const { spawn } = require('child_process');
const path = require('path');

beforeEach(() => {
});

before(() => {
});

after(() => {
});

/*
 * ============
 *  Test Cases
 * ============
 */
describe(`${package.name}`, () => {
  const ProcessManager = require('../dist/index.js');

  describe('ProcessManager', () => {

    it('should instantiate with default options', () => {
      const manager = new ProcessManager({ process: 'node test.js' });
      assert.equal(manager.command, 'node test.js');
      assert.equal(manager.timeout, 1000);
      assert.equal(manager.trigger, 'all');
      assert.equal(manager.isRunning, false);
      assert.equal(manager.restartCount, 0);
    });

    it('should parse triggers correctly', () => {
      const manager1 = new ProcessManager({ process: 'node test.js', trigger: 'all' });
      assert.deepEqual(manager1.triggers, ['all']);

      const manager2 = new ProcessManager({ process: 'node test.js', trigger: 'crash' });
      assert.deepEqual(manager2.triggers, ['crash']);

      const manager3 = new ProcessManager({ process: 'node test.js', trigger: 'error' });
      assert.deepEqual(manager3.triggers, ['error']);

      const manager4 = new ProcessManager({ process: 'node test.js', trigger: 'SIGINT,SIGTERM' });
      assert.deepEqual(manager4.triggers, ['SIGINT', 'SIGTERM']);
    });

    it('should parse command correctly', () => {
      const manager1 = new ProcessManager({ process: 'test.js' });
      const parsed1 = manager1.parseCommand();
      assert.equal(parsed1.cmd, 'node');
      assert.equal(parsed1.args[0], path.resolve('test.js'));

      const manager2 = new ProcessManager({ process: 'npm run test' });
      const parsed2 = manager2.parseCommand();
      assert.equal(parsed2.cmd, 'npm');
      assert.deepEqual(parsed2.args, ['run', 'test']);
    });

    it('should determine restart conditions correctly', () => {
      const manager1 = new ProcessManager({ process: 'node test.js', trigger: 'all' });
      assert.equal(manager1.shouldRestart(0, null), false);
      assert.equal(manager1.shouldRestart(1, null), true);
      assert.equal(manager1.shouldRestart(null, 'SIGTERM'), true);

      const manager2 = new ProcessManager({ process: 'node test.js', trigger: 'crash' });
      assert.equal(manager2.shouldRestart(0, null), false);
      assert.equal(manager2.shouldRestart(1, null), false); // Regular exit code 1 should NOT restart
      assert.equal(manager2.shouldRestart(134, null), true); // SIGABRT exit code should restart
      assert.equal(manager2.shouldRestart(139, null), true); // SIGSEGV exit code should restart
      assert.equal(manager2.shouldRestart(null, 'SIGSEGV'), true);
      assert.equal(manager2.shouldRestart(null, 'SIGABRT'), true);

      const manager3 = new ProcessManager({ process: 'node test.js', trigger: 'error' });
      assert.equal(manager3.shouldRestart(0, null), false);
      assert.equal(manager3.shouldRestart(1, null), true); // Regular exit code 1 SHOULD restart
      assert.equal(manager3.shouldRestart(134, null), false); // SIGABRT exit code should NOT restart
      assert.equal(manager3.shouldRestart(139, null), false); // SIGSEGV exit code should NOT restart
      assert.equal(manager3.shouldRestart(null, 'SIGSEGV'), false);
      assert.equal(manager3.shouldRestart(null, 'SIGTERM'), false);
    });
  });

  describe('Process Tests with Wrapper', () => {
    const wrapperPath = path.join(__dirname, 'processes', '_wrapper.js');

    it('should NOT restart exit-success.js (exit code 0)', function(done) {
      this.timeout(5000);

      const processPath = path.join(__dirname, 'processes', 'exit-success.js');
      const options = JSON.stringify({ timeout: 200, trigger: 'all', maxRestarts: 2 });

      const child = spawn('node', [wrapperPath, processPath, options]);
      let output = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        output += data.toString();
      });

      child.on('exit', (code) => {
        assert.equal(code, 0);
        assert(output.includes('EXIT-SUCCESS: Process started'));
        assert(output.includes('EXIT-SUCCESS: Exiting cleanly'));
        assert(output.includes('Process exited with code 0'));
        assert(output.includes('Process exited cleanly, not restarting'));
        assert(!output.includes('Restart count: 1')); // Should NOT restart
        done();
      });
    });

    it('should restart exit-failure.js (exit code 1)', function(done) {
      this.timeout(5000);

      const processPath = path.join(__dirname, 'processes', 'exit-failure.js');
      const options = JSON.stringify({ timeout: 200, trigger: 'all', maxRestarts: 2 });

      const child = spawn('node', [wrapperPath, processPath, options]);
      let output = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        output += data.toString();
      });

      child.on('exit', (code) => {
        assert.equal(code, 0);
        assert(output.includes('EXIT-FAILURE: Process started'));
        assert(output.includes('EXIT-FAILURE: Exiting with error code 1'));
        assert(output.includes('Process exited with code 1'));
        assert(output.includes('Restarting process'));
        assert(output.includes('Restart count: 1'));
        assert(output.includes('Restart count: 2'));
        assert(output.includes('Max restarts reached'));
        done();
      });
    });

    it('should restart error-immediate.js (uncaught exception)', function(done) {
      this.timeout(5000);

      const processPath = path.join(__dirname, 'processes', 'error-immediate.js');
      const options = JSON.stringify({ timeout: 200, trigger: 'all', maxRestarts: 2 });

      const child = spawn('node', [wrapperPath, processPath, options]);
      let output = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        output += data.toString();
      });

      child.on('exit', (code) => {
        assert.equal(code, 0);
        assert(output.includes('ERROR-IMMEDIATE: Process started'));
        assert(output.includes('ERROR-IMMEDIATE: Throwing error immediately'));
        assert(output.includes('Error: Immediate error'));
        assert(output.includes('Restarting process'));
        assert(output.includes('Restart count: 1'));
        assert(output.includes('Restart count: 2'));
        assert(output.includes('Max restarts reached'));
        done();
      });
    });

    it('should restart error-delayed.js (uncaught exception after delay)', function(done) {
      this.timeout(5000);

      const processPath = path.join(__dirname, 'processes', 'error-delayed.js');
      const options = JSON.stringify({ timeout: 200, trigger: 'all', maxRestarts: 2 });

      const child = spawn('node', [wrapperPath, processPath, options]);
      let output = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        output += data.toString();
      });

      child.on('exit', (code) => {
        assert.equal(code, 0);
        assert(output.includes('ERROR-DELAYED: Process started'));
        assert(output.includes('ERROR-DELAYED: Throwing error after delay'));
        assert(output.includes('Error: Delayed error'));
        assert(output.includes('Restarting process'));
        assert(output.includes('Restart count: 1'));
        assert(output.includes('Restart count: 2'));
        assert(output.includes('Max restarts reached'));
        done();
      });
    });

    it('should NOT restart exit-failure.js with crash trigger (exit code 1)', function(done) {
      this.timeout(5000);

      const processPath = path.join(__dirname, 'processes', 'exit-failure.js');
      const options = JSON.stringify({ timeout: 200, trigger: 'crash', maxRestarts: 2 });

      const child = spawn('node', [wrapperPath, processPath, options]);
      let output = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        output += data.toString();
      });

      child.on('exit', (code) => {
        assert.equal(code, 1); // Should exit with the process exit code
        assert(output.includes('EXIT-FAILURE: Process started'));
        assert(output.includes('EXIT-FAILURE: Exiting with error code 1'));
        assert(output.includes('Process exited with code 1'));
        assert(output.includes('Process exited cleanly, not restarting'));
        assert(!output.includes('Restarting process')); // Should NOT restart
        assert(!output.includes('Restart count')); // Should NOT have any restarts
        done();
      });
    });

    it('should restart exit-failure.js with error trigger (exit code 1)', function(done) {
      this.timeout(5000);

      const processPath = path.join(__dirname, 'processes', 'exit-failure.js');
      const options = JSON.stringify({ timeout: 200, trigger: 'error', maxRestarts: 2 });

      const child = spawn('node', [wrapperPath, processPath, options]);
      let output = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        output += data.toString();
      });

      child.on('exit', (code) => {
        assert.equal(code, 0);
        assert(output.includes('EXIT-FAILURE: Process started'));
        assert(output.includes('EXIT-FAILURE: Exiting with error code 1'));
        assert(output.includes('Process exited with code 1'));
        assert(output.includes('Restarting process'));
        assert(output.includes('Restart count: 1'));
        assert(output.includes('Restart count: 2'));
        assert(output.includes('Max restarts reached'));
        done();
      });
    });
  });

  describe('CLI Binary', () => {
    const binPath = path.join(__dirname, '..', 'bin', 'wonder-boot.js');

    it('should show help when --help is passed', function(done) {
      this.timeout(5000);

      const child = spawn('node', [binPath, '--help']);
      let output = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.on('exit', (code) => {
        assert.equal(code, 0);
        assert(output.includes('wonder-boot') && output.includes('A simple process manager'));
        assert(output.includes('--process='));
        assert(output.includes('--timeout='));
        assert(output.includes('--trigger='));
        done();
      });
    });

    it('should error when no process is provided', function(done) {
      this.timeout(5000);

      const child = spawn('node', [binPath]);
      let output = '';

      child.stderr.on('data', (data) => {
        output += data.toString();
      });

      child.on('exit', (code) => {
        assert.equal(code, 1);
        assert(output.includes('--process parameter is required'));
        done();
      });
    });
  });
});
