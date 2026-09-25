// Compressed city route. Distances are game metres, not a measured journey.
export const ROUTE_LENGTH = 2000;
export const CITY_START = 550;
export const CITY_END = 1450;
export const chapters = [
  { at: 0, name: 'MCH Arena', road: 'Kaj Zartows Vej', note: 'Hold Space. Next stop: the city centre.' },
  { at: 300, name: 'Into Herning', road: 'Toward the city centre', note: 'A shorter commute. The same stubborn wind.' },
  { at: 550, name: 'Bredgade', road: 'Herning city centre', note: 'Shop windows. Strong coffee. Stronger headwind.' },
  { at: 800, name: 'Torvet · Herning Kirke', road: 'The town square', note: 'Past the church. Still no divine tailwind.' },
  { at: 1050, name: 'Østergade', road: 'Leaving the town centre', note: 'There is always time for a rundstykke.' },
  { at: 1450, name: 'Toward Birk', road: 'Silkeborgvej corridor', note: 'The campus coffee is getting closer.' },
  { at: 1800, name: 'AU Herning', road: 'Birk Centerpark', note: 'One last push. You are almost there.' },
];
export const landmarks = [
  { kind: 'stadium', at: 60 }, { kind: 'boxen', at: 240 },
  { kind: 'church', at: 900 }, { kind: 'campus', at: 1970 },
] as const;
export function chapterAt(distance: number) { return [...chapters].reverse().find(c => distance >= c.at) ?? chapters[0]; }
