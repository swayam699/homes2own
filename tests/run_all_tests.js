/**
 * Root test orchestrator
 * Executes backend Jest & Supertest integration suite
 */
const { spawn } = require('child_process');
const path = require('path');

console.log('--- Executing Online Food Ordering System Test Suite ---');

const jest = spawn('npm', ['--prefix', path.resolve(__dirname, '../backend'), 'test'], {
  stdio: 'inherit',
  shell: true,
});

jest.on('close', (code) => {
  if (code === 0) {
    console.log('\n[SUCCESS] All 23 integration & unit tests passed successfully!');
    process.exit(0);
  } else {
    console.error(`\n[FAILURE] Test suite exited with error code ${code}`);
    process.exit(code);
  }
});
