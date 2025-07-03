#!/usr/bin/env node

console.log('SUCCESS: Process started');

setTimeout(() => {
  console.log('SUCCESS: Exiting cleanly');
  process.exit(0);
}, 50);