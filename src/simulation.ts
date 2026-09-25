import { ROUTE_LENGTH } from './route';
export const tuning = { maxSpeed: 36, minSpeed: -9, pedalAcceleration: 24, wind: 8, energyDrain: 1.1, pedalCostPerSecond: .18, boostDuration: 3, pickupEnergy: 8, laneDuration: .2, collisionGrace: 1.4 };
export type Status = 'ready' | 'playing' | 'paused' | 'lost' | 'won';
export type Kind = 'puddle' | 'sheep' | 'tractor' | 'bread';
export type Obstacle = { id: number; at: number; lane: number; kind: Kind; consumed: boolean };
export type State = { status: Status; distance: number; furthest: number; speed: number; energy: number; lane: number; lanePosition: number; boost: number; grace: number; elapsed: number; rolls: number; hits: number };
export function newState(): State { return { status: 'ready', distance: 0, furthest: 0, speed: 0, energy: 100, lane: 1, lanePosition: 1, boost: 0, grace: 0, elapsed: 0, rolls: 0, hits: 0 }; }
export function pedal(s: State, dt = 1/120) { if (s.status !== 'playing') return; s.speed = Math.min(tuning.maxSpeed * (s.boost > 0 ? 1.25 : 1), s.speed + tuning.pedalAcceleration * dt * (s.boost > 0 ? 1.8 : 1)); s.energy = Math.max(0, s.energy - tuning.pedalCostPerSecond * dt); }
export function changeLane(s: State, delta: number) { if(s.status === 'playing') s.lane = Math.max(0, Math.min(2, s.lane + delta)); }
export function makeObstacles(seed = 718): Obstacle[] {
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const result: Obstacle[] = [];
  // Single blocked lane per row; minimum 2 seconds between rows at maximum boosted speed.
  for(let at = 220; at < ROUTE_LENGTH - 180; at += 115 - 20 * at / ROUTE_LENGTH) {
    const lane = Math.floor(random() * 3);
    const n = random();
    result.push({ id: result.length, at, lane, kind: n < .4 ? 'puddle' : n < .85 ? 'sheep' : 'tractor', consumed: false });
    if(result.length % 3 === 1) result.push({ id: result.length, at: at + 40, lane: (lane + 1) % 3, kind: 'bread', consumed: false });
  }
  return result;
}
export function step(s: State, dt: number, objects: Obstacle[], pedaling = false) {
  if(s.status !== 'playing') return;
  s.elapsed += dt;
  s.boost = Math.max(0, s.boost - dt); s.grace = Math.max(0, s.grace - dt);
  if(pedaling) pedal(s, dt);
  const laneStep = dt / tuning.laneDuration;
  s.lanePosition += Math.sign(s.lane - s.lanePosition) * Math.min(Math.abs(s.lane - s.lanePosition), laneStep);
  const prev = s.distance;
  s.speed = Math.max(tuning.minSpeed, s.speed - tuning.wind * (1 + .2 * s.distance / ROUTE_LENGTH) * dt);
  s.distance = Math.max(0, Math.min(ROUTE_LENGTH, s.distance + s.speed * dt));
  if(s.distance === 0 && s.speed < 0) s.speed = 0;
  s.furthest = Math.max(s.furthest, s.distance);
  s.energy = Math.max(0, s.energy - tuning.energyDrain * dt);
  for(const o of objects) {
    if(o.consumed || Math.abs(s.lanePosition - o.lane) > .36) continue;
    const radius = o.kind === 'tractor' ? 7 : 4;
    if(o.at < Math.min(prev, s.distance) - radius || o.at > Math.max(prev, s.distance) + radius) continue;
    if(o.kind === 'bread') { o.consumed = true; s.energy = Math.min(100, s.energy + tuning.pickupEnergy); s.boost = tuning.boostDuration; s.rolls++; }
    else if(s.grace <= 0) { o.consumed = true; s.energy = Math.max(0, s.energy - (o.kind === 'tractor' ? 18 : o.kind === 'sheep' ? 12 : 8)); s.speed *= .35; s.grace = tuning.collisionGrace; s.hits++; }
  }
  if(s.energy <= 0) s.status = 'lost';
  else if(s.distance >= ROUTE_LENGTH) s.status = 'won';
}
