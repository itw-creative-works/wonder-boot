#!/usr/bin/env node

console.log('CRASH-IMMEDIATE: Process started');
console.log('CRASH-IMMEDIATE: Throwing error immediately');

throw new Error('Immediate crash');