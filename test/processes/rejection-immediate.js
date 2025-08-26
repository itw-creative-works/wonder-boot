console.log('REJECTION-IMMEDIATE: Process started');
console.log('REJECTION-IMMEDIATE: Creating unhandled promise rejection immediately');

// Create an unhandled promise rejection immediately
Promise.reject(new Error('Immediate unhandled rejection'));

// Keep process alive briefly then exit normally
setTimeout(() => {
  console.log('REJECTION-IMMEDIATE: Should not reach here if --unhandled-rejections=strict');
  process.exit(0);
}, 100);