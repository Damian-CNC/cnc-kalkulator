import type { ThreadLimits } from './bspThreadsData';

export interface BswThreadData {
  tpi: number;
  pitch: number;
  h3: number;
  external: { d: ThreadLimits; d2: ThreadLimits; d1: ThreadLimits };
  internal: { D: ThreadLimits; D2: ThreadLimits; D1: ThreadLimits; drill: number };
}

export const bswThreads: Record<string, BswThreadData> = {
  '1/8"-40': {
    tpi: 40, pitch: 0.635, h3: 0.407,
    external: {
      d:  { nom: 3.175, max: 3.175, min: 3.002 },
      d2: { nom: 2.769, max: 2.769, min: 2.659 },
      d1: { nom: 2.362, max: 2.362, min: 2.149 },
    },
    internal: {
      D:  { nom: 3.175, min: 3.175, max: 3.348 },
      D2: { nom: 2.769, min: 2.769, max: 2.879 },
      D1: { nom: 2.362, min: 2.362, max: 2.591 },
      drill: 2.55,
    },
  },
  '3/16"-24': {
    tpi: 24, pitch: 1.058, h3: 0.678,
    external: {
      d:  { nom: 4.763, max: 4.763, min: 4.524 },
      d2: { nom: 4.084, max: 4.084, min: 3.934 },
      d1: { nom: 3.406, max: 3.406, min: 3.106 },
    },
    internal: {
      D:  { nom: 4.763, min: 4.763, max: 5.002 },
      D2: { nom: 4.084, min: 4.084, max: 4.234 },
      D1: { nom: 3.406, min: 3.406, max: 3.744 },
      drill: 3.70,
    },
  },
  '1/4"-20': {
    tpi: 20, pitch: 1.270, h3: 0.813,
    external: {
      d:  { nom: 6.350, max: 6.350, min: 6.071 },
      d2: { nom: 5.537, max: 5.537, min: 5.367 },
      d1: { nom: 4.724, max: 4.724, min: 4.354 },
    },
    internal: {
      D:  { nom: 6.350, min: 6.350, max: 6.629 },
      D2: { nom: 5.537, min: 5.537, max: 5.707 },
      D1: { nom: 4.724, min: 4.724, max: 5.131 },
      drill: 5.10,
    },
  },
  '5/16"-18': {
    tpi: 18, pitch: 1.411, h3: 0.904,
    external: {
      d:  { nom: 7.938, max: 7.938, min: 7.633 },
      d2: { nom: 7.034, max: 7.034, min: 6.852 },
      d1: { nom: 6.131, max: 6.131, min: 5.724 },
    },
    internal: {
      D:  { nom: 7.938, min: 7.938, max: 8.243 },
      D2: { nom: 7.034, min: 7.034, max: 7.216 },
      D1: { nom: 6.131, min: 6.131, max: 6.581 },
      drill: 6.50,
    },
  },
  '3/8"-16': {
    tpi: 16, pitch: 1.588, h3: 1.017,
    external: {
      d:  { nom: 9.525, max: 9.525, min: 9.192 },
      d2: { nom: 8.509, max: 8.509, min: 8.311 },
      d1: { nom: 7.493, max: 7.493, min: 7.044 },
    },
    internal: {
      D:  { nom: 9.525, min: 9.525, max: 9.858 },
      D2: { nom: 8.509, min: 8.509, max: 8.707 },
      D1: { nom: 7.493, min: 7.493, max: 8.001 },
      drill: 7.90,
    },
  },
  '1/2"-12': {
    tpi: 12, pitch: 2.117, h3: 1.355,
    external: {
      d:  { nom: 12.700, max: 12.700, min: 12.296 },
      d2: { nom: 11.345, max: 11.345, min: 11.092 },
      d1: { nom: 9.990, max: 9.990, min: 9.454 },
    },
    internal: {
      D:  { nom: 12.700, min: 12.700, max: 13.104 },
      D2: { nom: 11.345, min: 11.345, max: 11.598 },
      D1: { nom: 9.990, min: 9.990, max: 10.668 },
      drill: 10.50,
    },
  },
  '5/8"-11': {
    tpi: 11, pitch: 2.309, h3: 1.479,
    external: {
      d:  { nom: 15.875, max: 15.875, min: 15.441 },
      d2: { nom: 14.397, max: 14.397, min: 14.130 },
      d1: { nom: 12.918, max: 12.918, min: 12.333 },
    },
    internal: {
      D:  { nom: 15.875, min: 15.875, max: 16.309 },
      D2: { nom: 14.397, min: 14.397, max: 14.664 },
      D1: { nom: 12.918, min: 12.918, max: 13.658 },
      drill: 13.50,
    },
  },
  '3/4"-10': {
    tpi: 10, pitch: 2.540, h3: 1.626,
    external: {
      d:  { nom: 19.050, max: 19.050, min: 18.583 },
      d2: { nom: 17.424, max: 17.424, min: 17.137 },
      d1: { nom: 15.799, max: 15.799, min: 15.172 },
    },
    internal: {
      D:  { nom: 19.050, min: 19.050, max: 19.517 },
      D2: { nom: 17.424, min: 17.424, max: 17.711 },
      D1: { nom: 15.799, min: 15.799, max: 16.612 },
      drill: 16.50,
    },
  },
  '1"-8': {
    tpi: 8, pitch: 3.175, h3: 2.033,
    external: {
      d:  { nom: 25.400, max: 25.400, min: 24.846 },
      d2: { nom: 23.368, max: 23.368, min: 23.033 },
      d1: { nom: 21.336, max: 21.336, min: 20.570 },
    },
    internal: {
      D:  { nom: 25.400, min: 25.400, max: 25.954 },
      D2: { nom: 23.368, min: 23.368, max: 23.703 },
      D1: { nom: 21.336, min: 21.336, max: 22.352 },
      drill: 22.00,
    },
  },
};

export const bswSizes = Object.keys(bswThreads);
