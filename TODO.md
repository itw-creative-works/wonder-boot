 this is our package. it helps node processes restart when crashed. i need to restart when a process  │
│   crashes such as with code 1, but not if the user forcibly closes it with like ctrl+c. right now,    │
│   i think it tries to handle more cases than it needs to. can you optimize it so it just simply       │
│   restarts.

in package.json i ahve some test scripts for this
for example, if i run

npm run dev:exit:all = process restarts normally with these logs (GOOD)
[19:17:47] 'wonder-boot': Starting process: node ./test/processes/exit-failure.js
[19:17:47] 'wonder-boot': Options: trigger=all, timeout=1000ms
EXIT-FAILURE: Process started
ERROR-FAILURE: Still running...
EXIT-FAILURE: Exiting with error code 1
[19:17:47] 'wonder-boot': Process exited with code 1 and signal null
[19:17:47] 'wonder-boot': Restarting process in 1000ms... (restart #1)

npm run dev:exit:error = process restarts normally with these logs (GOOD), same as ABOVE
[19:18:30] 'wonder-boot': Starting process: node ./test/processes/exit-failure.js
[19:18:30] 'wonder-boot': Options: trigger=error, timeout=1000ms
EXIT-FAILURE: Process started
ERROR-FAILURE: Still running...
EXIT-FAILURE: Exiting with error code 1
[19:18:30] 'wonder-boot': Process exited with code 1 and signal null
[19:18:30] 'wonder-boot': Restarting process in 1000ms... (restart #1)

npm run dev:exit:crash = process DOES NOT RESTART BAD, the process crashed why is not restarting???
[19:17:04] 'wonder-boot': Starting process: node ./test/processes/exit-failure.js
[19:17:04] 'wonder-boot': Options: trigger=crash, timeout=1000ms
EXIT-FAILURE: Process started
ERROR-FAILURE: Still running...
EXIT-FAILURE: Exiting with error code 1
[19:17:04] 'wonder-boot': Process exited with code 1 and signal null
[19:17:04] 'wonder-boot': Process exited cleanly, not restarting.

running
npm run dev:error:all = SAME AS npm run dev:exit:all
npm run dev:error:crash = SAME AS npm run dev:exit:crash
npm run dev:error:error = SAME AS npm run dev:exit:error



-----


OK after running
dev:error:all, dev:error:crash, dev:error:error

AND

dev:exit:all, dev:exit:crash, dev:exit:error

ALL THE ABOVE CASES SEEM TO CAUSE A RESTART OF THE PROCESS (Whether we throw an eror or exit with code 1)

SO MY QUESTION IS: WHAT IS THE DIFFERENCE BETWEEN "CRASH" AND "ERROR" TRIGGERS?

If the user can pass different options but they do the same things even if the process is .exit(1)'d or .throw()'d, what is the purpose of having separate triggers?
