#!/usr/bin/env node

console.log('EXIT-SUCCESS: Process started');

setInterval(() => {
  console.log('ERROR-SUCCESS: Still running...');
}, 100);

setTimeout(() => {
  console.log('EXIT-SUCCESS: Exiting cleanly');
  process.exit(0);
}, 150);
