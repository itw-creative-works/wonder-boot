#!/usr/bin/env node

console.log('EXIT-FAILURE: Process started');

setInterval(() => {
  console.log('ERROR-FAILURE: Still running...');
}, 100);

setTimeout(() => {
  console.log('EXIT-FAILURE: Exiting with error code 1');
  process.exit(1);
}, 150);
