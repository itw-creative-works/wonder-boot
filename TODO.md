Make new test files

test/processes/_wrapper.js = a wrapper fn for running the following
test/processes/success.js = exits successfully after 50 ms
test/processes/failure.js = exits with error after 50 ms
test/processes/crash-immediate.js = crashes immediately
test/processes/crash-delayed.js = crashes after 50 ms

test each process in test/test.js by running it and thru the wrapper and ensuring the wrapper either restarts it or not based on the options passed to the wrapper.

success.js should not restart.
failure.js should restart with error level 1.
crash-immediate.js should restart with error level 2.
crash-delayed.js should restart with error level 2.
