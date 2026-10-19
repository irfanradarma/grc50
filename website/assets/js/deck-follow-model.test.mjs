import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createFollowState} from './deck-follow-model.mjs';

test('viewers follow the presenter until they choose their own slide',()=>{
 const state=createFollowState();assert.equal(state.receive('agenda'),'agenda');assert.equal(state.local,'agenda');
 state.browse('the-foundation');assert.equal(state.receive('the-solution-framework'),null);
 assert.equal(state.local,'the-foundation');assert.equal(state.presenter,'the-solution-framework');assert.equal(state.following,false);
 assert.equal(state.resume(),'the-solution-framework');assert.equal(state.following,true);
 assert.equal(state.receive('your-turn'),'your-turn');
});

test('independent reading remains independent even when presenter updates repeat',()=>{
 const state=createFollowState('agenda');state.receive('the-foundation');state.browse();
 for(const key of ['the-foundation','our-pain-point','the-foundation'])assert.equal(state.receive(key),null);
 assert.equal(state.local,'the-foundation');assert.equal(state.following,false);
 assert.equal(state.resume(),'the-foundation');
});
