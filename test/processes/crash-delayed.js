#!/usr/bin/env node

console.log('CRASH-DELAYED: Process started');

setTimeout(() => {
  console.log('CRASH-DELAYED: Throwing error after delay');
  throw new Error('Delayed crash');
}, 50);