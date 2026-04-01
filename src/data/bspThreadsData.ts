export interface BspThread {
  size: string;
  tpi: number;
  pitch: number;
  majorDia: number;
  pitchDia: number;
  minorDia: number;
  tapDrill: number;
}

export const bspThreads: BspThread[] = [
  { size: 'G 1/8"',   tpi: 28, pitch: 0.907, majorDia: 9.728,  pitchDia: 9.147,  minorDia: 8.566,  tapDrill: 8.80  },
  { size: 'G 1/4"',   tpi: 19, pitch: 1.337, majorDia: 13.157, pitchDia: 12.301, minorDia: 11.445, tapDrill: 11.80 },
  { size: 'G 3/8"',   tpi: 19, pitch: 1.337, majorDia: 16.662, pitchDia: 15.806, minorDia: 14.950, tapDrill: 15.25 },
  { size: 'G 1/2"',   tpi: 14, pitch: 1.814, majorDia: 20.955, pitchDia: 19.793, minorDia: 18.631, tapDrill: 19.00 },
  { size: 'G 5/8"',   tpi: 14, pitch: 1.814, majorDia: 22.911, pitchDia: 21.749, minorDia: 20.587, tapDrill: 21.00 },
  { size: 'G 3/4"',   tpi: 14, pitch: 1.814, majorDia: 26.441, pitchDia: 25.279, minorDia: 24.117, tapDrill: 24.50 },
  { size: 'G 7/8"',   tpi: 14, pitch: 1.814, majorDia: 30.201, pitchDia: 29.039, minorDia: 27.877, tapDrill: 28.25 },
  { size: 'G 1"',     tpi: 11, pitch: 2.309, majorDia: 33.249, pitchDia: 31.770, minorDia: 30.291, tapDrill: 30.75 },
  { size: 'G 1 1/8"', tpi: 11, pitch: 2.309, majorDia: 37.897, pitchDia: 36.418, minorDia: 34.939, tapDrill: 35.30 },
  { size: 'G 1 1/4"', tpi: 11, pitch: 2.309, majorDia: 41.910, pitchDia: 40.431, minorDia: 38.952, tapDrill: 39.50 },
  { size: 'G 1 1/2"', tpi: 11, pitch: 2.309, majorDia: 47.803, pitchDia: 46.324, minorDia: 44.845, tapDrill: 45.25 },
  { size: 'G 1 3/4"', tpi: 11, pitch: 2.309, majorDia: 53.746, pitchDia: 52.267, minorDia: 50.788, tapDrill: 51.10 },
  { size: 'G 2"',     tpi: 11, pitch: 2.309, majorDia: 59.614, pitchDia: 58.135, minorDia: 56.656, tapDrill: 57.00 },
];
