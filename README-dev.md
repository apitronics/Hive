
# Tests
To run tests make sure you have mocha installed globally `npm install -g mocha`. Each directory has its own `lib` and `tests` directory. Run `mocha` in each directory to test. There is probably a mocha config file where we can define where all the tests are so we can run all tests in one command.  Unfortunately `mocha --recursive` is running files that aren't tests. 
