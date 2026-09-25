import test from 'node:test';
import assert from 'node:assert/strict';
import { GameAudio } from '../src/audio';

test('audio is gesture-gated, stops scheduling on pause/mute, and resumes without a backlog', () => {
  let contexts = 0, tones = 0;
  const saved = new Map<string, string>();
  const param = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, setTargetAtTime() {}, cancelScheduledValues() {} });
  class FakeContext {
    static last: FakeContext;
    currentTime = 0; state = 'running'; destination = {};
    constructor() { contexts++; FakeContext.last = this; }
    resume() { return Promise.resolve(); }
    createGain() { return { gain: param(), connect() {}, disconnect() {} }; }
    createOscillator() { return { frequency: param(), connect() {}, disconnect() {}, start() { tones++; }, stop() {}, type: 'sine', onended: null }; }
  }
  const originalContext = Object.getOwnPropertyDescriptor(globalThis, 'AudioContext');
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'AudioContext', { configurable: true, value: FakeContext });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => saved.get(key), setItem: (key: string, value: string) => saved.set(key, value) } });
  try {
    const audio = new GameAudio(); audio.update(false); audio.effect('pickup');
    assert.equal(contexts, 0);
    audio.unlock(); audio.setPlaying(true); audio.update(false);
    assert.ok(tones > 0);
    audio.setPlaying(false); const paused = tones;
    FakeContext.last.currentTime += 10; audio.update(false);
    assert.equal(tones, paused);
    audio.toggle(); audio.setPlaying(true); audio.update(false); audio.effect('hit');
    assert.equal(tones, paused);
    assert.equal(new GameAudio().muted, true);
    FakeContext.last.currentTime += 60; audio.toggle(); audio.update(true);
    assert.ok(tones > paused && tones - paused < 5, 'resume must not replay missed beats');
    audio.effect('pickup'); assert.ok(tones >= paused + 4);
    assert.equal(contexts, 1);
  } finally {
    if (originalContext) Object.defineProperty(globalThis, 'AudioContext', originalContext); else Reflect.deleteProperty(globalThis, 'AudioContext');
    if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage); else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});
