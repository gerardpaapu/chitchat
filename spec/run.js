var assert = require('assert'),
    run = require('../runtime/evaluate.js').run;

assert.equal(run('(3 + 4)'), 7);
assert.deepEqual(run('(#{foo 1 bar 2} keys)'), ['foo', 'bar']);
assert.equal(run('((function (a) (a + a)) call null 4)'), 8);
assert.equal(run('null.null?'), true); 
assert.equal(run('#{}.null?'), false); 
assert.equal(run('3.zero?'), false);
assert.equal(run('0.zero?'), true);
