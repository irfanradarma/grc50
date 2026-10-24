import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createBrowseReminderClock} from './deck-browse-reminder.mjs';
test('a different slide prompts immediately, then 90 seconds after choosing to keep browsing',()=>{
 let now=0;const clock=createBrowseReminderClock(()=>now);
 assert.equal(clock.update(false),false);assert.equal(clock.update(true),true);
 now=100_000;assert.equal(clock.update(true),false); // No duplicate while open.
 clock.dismiss();now=189_999;assert.equal(clock.update(true),false);
 now=190_000;assert.equal(clock.update(true),true);
});
test('returning to the presenter resets the reminder; changing independent slides does not',()=>{
 let now=0;const clock=createBrowseReminderClock(()=>now);
 clock.update(true);clock.dismiss();now=30_000;assert.equal(clock.update(true),false);
 assert.equal(clock.update(false),false);assert.equal(clock.update(true),true);
});
test('hidden or occupied views defer a due reminder until available',()=>{
 const clock=createBrowseReminderClock(()=>100);
 assert.equal(clock.update(true,false),false);assert.equal(clock.update(true,true),true);
 assert.equal(clock.update(true,false),false);assert.equal(clock.update(true,true),true);
});
