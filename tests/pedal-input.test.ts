import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PedalInput } from '../src/pedal-input';
import { newState, step, changeLane } from '../src/simulation';
test('holding Space continuously accelerates while steering; releasing allows drift',()=>{
  const input=new PedalInput(),s=newState();s.status='playing';input.setKeyboard(true);
  for(let i=0;i<600;i++){if(i===200)changeLane(s,-1);step(s,1/120,[],input.held);}
  assert.ok(s.distance>100);assert.equal(s.lanePosition,0);assert.ok(s.speed>30);
  input.setKeyboard(false);for(let i=0;i<720;i++)step(s,1/120,[],input.held);
  assert.ok(s.speed<0);assert.ok(s.distance<s.furthest);
});
test('multiple input sources release independently and lifecycle clearing prevents stuck input',()=>{
  const input=new PedalInput();input.pressPointer(1);input.releasePointer(2);assert.equal(input.held,true);
  input.setKeyboard(true);input.releasePointer(1);assert.equal(input.held,true);
  input.setKeyboard(false);assert.equal(input.held,false);
  input.setKeyboard(true);input.pressPointer(3);input.clear();assert.equal(input.held,false);
});
