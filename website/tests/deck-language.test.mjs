import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createDeckTranslator} from '../assets/keynote/deck-language.js';
import {buildKeynote} from './keynote-fixture.mjs';

const catalogue=JSON.parse(fs.readFileSync(new URL('../assets/keynote/translations-id.json',import.meta.url),'utf8'));
const translate=createDeckTranslator(catalogue.strings);

test('both languages preserve figures, names and the SIGNAL acronym',()=>{
 assert.equal(translate('Risk Management'),'Manajemen Risiko');
 assert.equal(translate('Risk Management','en'),'Risk Management');
 assert.equal(translate('  New evidence. New position.  '),'  Bukti baru. Posisi baru.  ');
 assert.equal(translate('Compare P and S'),'Bandingkan P dan S');
 assert.equal(translate('16 before. 12 projected after.'),'16 sebelum. Proyeksi 12 sesudah.');
 for(const text of ['SIGNAL','Sense','Interpret','Gauge','Notify','Act','Learn','Reza Rizky Pratama','Teuku Raja Irfan Radarma'])assert.equal(translate(text),text);
 assert.equal(translate('Slide 24: New evidence. New position.'),'Slide 24: Bukti baru. Posisi baru.');
 assert.equal(translate('Presenter now: 24 / New evidence. New position.'),'Posisi presenter: 24 / Bukti baru. Posisi baru.');
 assert.equal(translate('02 / AI IN RISK MANAGEMENT'),'02 / AI DALAM MANAJEMEN RISIKO');
});

test('every final slide has an Indonesian note and its designed title has an explicit translation',async()=>{
 const {reference,slides}=await buildKeynote();
 for(const entry of reference.slides){
  assert(catalogue.notes[entry.key]?.length>50,entry.key+' note');
  const title=slides[entry.key].title.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  assert(Object.hasOwn(catalogue.strings,title),entry.key+' title: '+title);
 }
 for(const key of ['evidence-risk-management','evidence-assurance','evidence-how-the-gap-happens']){
  assert(catalogue.contexts[key].context);assert(catalogue.contexts[key].connection);
 }
});
