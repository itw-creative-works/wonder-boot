#!/usr/bin/env node

console.log('ERROR-IMMEDIATE: Process started');

setInterval(() => {
  console.log('ERROR-IMMEDIATE: Still running...');
}, 100);

console.log('ERROR-IMMEDIATE: Throwing error immediately');

throw new Error('Immediate error');
