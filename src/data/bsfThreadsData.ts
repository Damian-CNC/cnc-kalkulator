import type { ThreadLimits } from './bspThreadsData';

export interface BsfThreadData {
  tpi: number;
  pitch: number;
  h3: number;
  external: { d: ThreadLimits; d2: ThreadLimits; d1: ThreadLimits };
  internal: { D: ThreadLimits; D2: ThreadLimits; D1: ThreadLimits; drill: number };
}

export const bsfThreads: Record<string, BsfThreadData> = {
  '3/16"-32': {
    tpi: 32, pitch: 0.794, h3: 0.508,
    external: {
      d:  { nom: 4.763, max: 4.763, min: 4.567 },
      d2: { nom: 4.254, max: 4.254, min: 4.138 },
      d1: { nom: 3.745, max: 3.745, min: 3.489 },
    },
    internal: {
      D:  { nom: 4.763, min: 4.763, max: 4.959 },
      D2: { nom: 4.254, min: 4.254, max: 4.370 },
      D1: { nom: 3.745, min: 3.745, max: 4.002 },
      drill: 4.00,
    },
  },
  '1/4"-26': {
    tpi: 26, pitch: 0.977, h3: 0.626,
    external: {
      d:  { nom: 6.350, max: 6.350, min: 6.132 },
      d2: { nom: 5.725, max: 5.725, min: 5.591 },
      d1: { nom: 5.099, max: 5.099, min: 4.803 },
    },
    internal: {
      D:  { nom: 6.350, min: 6.350, max: 6.568 },
      D2: { nom: 5.725, min: 5.725, max: 5.859 },
      D1: { nom: 5.099, min: 5.099, max: 5.399 },
      drill: 5.30,
    },
  },
  '5/16"-22': {
    tpi: 22, pitch: 1.155, h3: 0.739,
    external: {
      d:  { nom: 7.938, max: 7.938, min: 7.691 },
      d2: { nom: 7.200, max: 7.200, min: 7.049 },
      d1: { nom: 6.460, max: 6.460, min: 6.121 },
    },
    internal: {
      D:  { nom: 7.938, min: 7.938, max: 8.185 },
      D2: { nom: 7.200, min: 7.200, max: 7.351 },
      D1: { nom: 6.460, min: 6.460, max: 6.801 },
      drill: 6.80,
    },
  },
  '3/8"-20': {
    tpi: 20, pitch: 1.270, h3: 0.813,
    external: {
      d:  { nom: 9.525, max: 9.525, min: 9.256 },
      d2: { nom: 8.712, max: 8.712, min: 8.542 },
      d1: { nom: 7.900, max: 7.900, min: 7.530 },
    },
    internal: {
      D:  { nom: 9.525, min: 9.525, max: 9.794 },
      D2: { nom: 8.712, min: 8.712, max: 8.882 },
      D1: { nom: 7.900, min: 7.900, max: 8.310 },
      drill: 8.20,
    },
  },
  '1/2"-16': {
    tpi: 16, pitch: 1.588, h3: 1.017,
    external: {
      d:  { nom: 12.700, max: 12.700, min: 12.367 },
      d2: { nom: 11.684, max: 11.684, min: 11.486 },
      d1: { nom: 10.667, max: 10.667, min: 10.218 },
    },
    internal: {
      D:  { nom: 12.700, min: 12.700, max: 13.033 },
      D2: { nom: 11.684, min: 11.684, max: 11.882 },
      D1: { nom: 10.667, min: 10.667, max: 11.176 },
      drill: 11.10,
    },
  },
  '5/8"-14': {
    tpi: 14, pitch: 1.814, h3: 1.162,
    external: {
      d:  { nom: 15.875, max: 15.875, min: 15.504 },
      d2: { nom: 14.713, max: 14.713, min: 14.498 },
      d1: { nom: 13.551, max: 13.551, min: 13.052 },
    },
    internal: {
      D:  { nom: 15.875, min: 15.875, max: 16.246 },
      D2: { nom: 14.713, min: 14.713, max: 14.928 },
      D1: { nom: 13.551, min: 13.551, max: 14.120 },
      drill: 14.00,
    },
  },
  '3/4"-12': {
    tpi: 12, pitch: 2.117, h3: 1.355,
    external: {
      d:  { nom: 19.050, max: 19.050, min: 18.646 },
      d2: { nom: 17.695, max: 17.695, min: 17.442 },
      d1: { nom: 16.340, max: 16.340, min: 15.804 },
    },
    internal: {
      D:  { nom: 19.050, min: 19.050, max: 19.454 },
      D2: { nom: 17.695, min: 17.695, max: 17.948 },
      D1: { nom: 16.340, min: 16.340, max: 17.018 },
      drill: 16.75,
    },
  },
  '1"-10': {
    tpi: 10, pitch: 2.540, h3: 1.626,
    external: {
      d:  { nom: 25.400, max: 25.400, min: 24.933 },
      d2: { nom: 23.774, max: 23.774, min: 23.487 },
      d1: { nom: 22.149, max: 22.149, min: 21.522 },
    },
    internal: {
      D:  { nom: 25.400, min: 25.400, max: 25.867 },
      D2: { nom: 23.774, min: 23.774, max: 24.061 },
      D1: { nom: 22.149, min: 22.149, max: 22.962 },
      drill: 22.70,
    },
  },
};

export const bsfSizes = Object.keys(bsfThreads);
