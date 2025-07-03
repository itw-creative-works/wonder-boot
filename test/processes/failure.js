#!/usr/bin/env node

console.log('FAILURE: Process started');

setTimeout(() => {
  console.log('FAILURE: Exiting with error code 1');
  process.exit(1);
}, 50);