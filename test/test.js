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
      assert.deepEqual(manager1.triggers, ['uncaughtException', 'unhandledRejection', 'SIGINT', 'SIGTERM', 'exit']);

      const manager2 = new ProcessManager({ process: 'node test.js', trigger: 'crash' });
      assert.deepEqual(manager2.triggers, ['uncaughtException', 'unhandledRejection', 'SIGSEGV', 'SIGABRT']);

      const manager3 = new ProcessManager({ process: 'node test.js', trigger: 'SIGINT,SIGTERM' });
      assert.deepEqual(manager3.triggers, ['SIGINT', 'SIGTERM']);
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
      assert.equal(manager2.shouldRestart(1, null), true);
      assert.equal(manager2.shouldRestart(null, 'SIGSEGV'), true);
    });

    it('should start the process correctly', (done) => {
      const manager = new ProcessManager({ process: 'node -e "console.log(\'Hello World\'); process.exit(1);"', timeout: 1000 });
      manager.start();

      setTimeout(() => {
        assert.equal(manager.isRunning, true);
        assert.equal(manager.restartCount, 1);
        done();
      }, 1500);
    });

  });

  // describe('CLI Binary', () => {
  //   const binPath = path.join(__dirname, '..', 'bin', 'wonder-boot.js');

  //   it('should show help when --help is passed', function(done) {
  //     this.timeout(5000);

  //     const child = spawn('node', [binPath, '--help']);
  //     let output = '';

  //     child.stdout.on('data', (data) => {
  //       output += data.toString();
  //     });

  //     child.on('exit', (code) => {
  //       assert.equal(code, 0);
  //       assert(output.includes('wonder-boot - A simple process manager'));
  //       assert(output.includes('--process='));
  //       assert(output.includes('--timeout='));
  //       assert(output.includes('--trigger='));
  //       done();
  //     });
  //   });

  //   it('should error when no process is provided', function(done) {
  //     this.timeout(5000);

  //     const child = spawn('node', [binPath]);
  //     let output = '';

  //     child.stderr.on('data', (data) => {
  //       output += data.toString();
  //     });

  //     child.on('exit', (code) => {
  //       assert.equal(code, 1);
  //       assert(output.includes('--process parameter is required'));
  //       done();
  //     });
  //   });
  // });
});
