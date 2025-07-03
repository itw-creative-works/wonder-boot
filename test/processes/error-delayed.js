#!/usr/bin/env node

console.log('ERROR-DELAYED: Process started');

setInterval(() => {
  console.log('ERROR-DELAYED: Still running...');
}, 100);

setTimeout(() => {
  console.log('ERROR-DELAYED: Throwing error after delay');
  throw new Error('Delayed error');
}, 150);
