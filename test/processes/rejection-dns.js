console.log('REJECTION-DNS: Process started');
console.log('REJECTION-DNS: Simulating DNS error in async function');

// Simulate a DNS error similar to what happens with getApp()
async function simulateDNSError() {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const error = new Error('getaddrinfo ENOTFOUND example.invalid.domain');
  error.code = 'ENOTFOUND';
  error.errno = -3008;
  error.syscall = 'getaddrinfo';
  error.hostname = 'example.invalid.domain';
  
  throw error;
}

// Call without try-catch to create unhandled rejection
simulateDNSError();

// Keep process alive
setTimeout(() => {
  console.log('REJECTION-DNS: Should not reach here if --unhandled-rejections=strict');
}, 1000);