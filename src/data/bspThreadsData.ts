export interface ThreadLimits {
  nom: number;
  min: number;
  max: number;
}

export interface BspThreadData {
  tpi: number;
  pitch: number;
  h3: number;
  external: { d: ThreadLimits; d2: ThreadLimits; d1: ThreadLimits };
  internal: { D: ThreadLimits; D2: ThreadLimits; D1: ThreadLimits; drill: number };
}

export const bspThreads: Record<string, BspThreadData> = {
  "G 1/8": {
    tpi: 28, pitch: 0.907, h3: 0.581,
    external: {
      d:  { nom: 9.728, max: 9.728, min: 9.514 },
      d2: { nom: 9.147, max: 9.147, min: 9.040 },
      d1: { nom: 8.566, max: 8.566, min: 8.400 }
    },
    internal: {
      D:  { nom: 9.728, min: 9.728, max: 9.900 },
      D2: { nom: 9.147, min: 9.147, max: 9.254 },
      D1: { nom: 8.566, min: 8.566, max: 8.848 },
      drill: 8.80
    }
  },
  "G 1/4": {
    tpi: 19, pitch: 1.337, h3: 0.856,
    external: {
      d:  { nom: 13.157, max: 13.157, min: 12.907 },
      d2: { nom: 12.301, max: 12.301, min: 12.176 },
      d1: { nom: 11.445, max: 11.445, min: 11.200 }
    },
    internal: {
      D:  { nom: 13.157, min: 13.157, max: 13.350 },
      D2: { nom: 12.301, min: 12.301, max: 12.426 },
      D1: { nom: 11.445, min: 11.445, max: 11.890 },
      drill: 11.80
    }
  },
  "G 3/8": {
    tpi: 19, pitch: 1.337, h3: 0.856,
    external: {
      d:  { nom: 16.662, max: 16.662, min: 16.412 },
      d2: { nom: 15.806, max: 15.806, min: 15.681 },
      d1: { nom: 14.950, max: 14.950, min: 14.700 }
    },
    internal: {
      D:  { nom: 16.662, min: 16.662, max: 16.850 },
      D2: { nom: 15.806, min: 15.806, max: 15.931 },
      D1: { nom: 14.950, min: 14.950, max: 15.395 },
      drill: 15.25
    }
  },
  "G 1/2": {
    tpi: 14, pitch: 1.814, h3: 1.162,
    external: {
      d:  { nom: 20.955, max: 20.955, min: 20.671 },
      d2: { nom: 19.793, max: 19.793, min: 19.651 },
      d1: { nom: 18.631, max: 18.631, min: 18.300 }
    },
    internal: {
      D:  { nom: 20.955, min: 20.955, max: 21.200 },
      D2: { nom: 19.793, min: 19.793, max: 19.935 },
      D1: { nom: 18.631, min: 18.631, max: 19.172 },
      drill: 19.00
    }
  },
  "G 5/8": {
    tpi: 14, pitch: 1.814, h3: 1.162,
    external: {
      d:  { nom: 22.911, max: 22.911, min: 22.627 },
      d2: { nom: 21.749, max: 21.749, min: 21.607 },
      d1: { nom: 20.587, max: 20.587, min: 20.200 }
    },
    internal: {
      D:  { nom: 22.911, min: 22.911, max: 23.150 },
      D2: { nom: 21.749, min: 21.749, max: 21.891 },
      D1: { nom: 20.587, min: 20.587, max: 21.128 },
      drill: 21.00
    }
  },
  "G 3/4": {
    tpi: 14, pitch: 1.814, h3: 1.162,
    external: {
      d:  { nom: 26.441, max: 26.441, min: 26.157 },
      d2: { nom: 25.279, max: 25.279, min: 25.137 },
      d1: { nom: 24.117, max: 24.117, min: 23.800 }
    },
    internal: {
      D:  { nom: 26.441, min: 26.441, max: 26.680 },
      D2: { nom: 25.279, min: 25.279, max: 25.421 },
      D1: { nom: 24.117, min: 24.117, max: 24.658 },
      drill: 24.50
    }
  },
  "G 7/8": {
    tpi: 14, pitch: 1.814, h3: 1.162,
    external: {
      d:  { nom: 30.201, max: 30.201, min: 29.917 },
      d2: { nom: 29.039, max: 29.039, min: 28.897 },
      d1: { nom: 27.877, max: 27.877, min: 27.500 }
    },
    internal: {
      D:  { nom: 30.201, min: 30.201, max: 30.450 },
      D2: { nom: 29.039, min: 29.039, max: 29.181 },
      D1: { nom: 27.877, min: 27.877, max: 28.418 },
      drill: 28.25
    }
  },
  "G 1": {
    tpi: 11, pitch: 2.309, h3: 1.479,
    external: {
      d:  { nom: 33.249, max: 33.249, min: 32.889 },
      d2: { nom: 31.770, max: 31.770, min: 31.590 },
      d1: { nom: 30.291, max: 30.291, min: 29.900 }
    },
    internal: {
      D:  { nom: 33.249, min: 33.249, max: 33.550 },
      D2: { nom: 31.770, min: 31.770, max: 31.950 },
      D1: { nom: 30.291, min: 30.291, max: 30.931 },
      drill: 30.75
    }
  },
  "G 1 1/4": {
    tpi: 11, pitch: 2.309, h3: 1.479,
    external: {
      d:  { nom: 41.910, max: 41.910, min: 41.550 },
      d2: { nom: 40.431, max: 40.431, min: 40.251 },
      d1: { nom: 38.952, max: 38.952, min: 38.500 }
    },
    internal: {
      D:  { nom: 41.910, min: 41.910, max: 42.200 },
      D2: { nom: 40.431, min: 40.431, max: 40.611 },
      D1: { nom: 38.952, min: 38.952, max: 39.592 },
      drill: 39.50
    }
  },
  "G 1 1/2": {
    tpi: 11, pitch: 2.309, h3: 1.479,
    external: {
      d:  { nom: 47.803, max: 47.803, min: 47.443 },
      d2: { nom: 46.324, max: 46.324, min: 46.144 },
      d1: { nom: 44.845, max: 44.845, min: 44.400 }
    },
    internal: {
      D:  { nom: 47.803, min: 47.803, max: 48.100 },
      D2: { nom: 46.324, min: 46.324, max: 46.504 },
      D1: { nom: 44.845, min: 44.845, max: 45.485 },
      drill: 45.25
    }
  },
  "G 2": {
    tpi: 11, pitch: 2.309, h3: 1.479,
    external: {
      d:  { nom: 59.614, max: 59.614, min: 59.254 },
      d2: { nom: 58.135, max: 58.135, min: 57.955 },
      d1: { nom: 56.656, max: 56.656, min: 56.200 }
    },
    internal: {
      D:  { nom: 59.614, min: 59.614, max: 59.900 },
      D2: { nom: 58.135, min: 58.135, max: 58.315 },
      D1: { nom: 56.656, min: 56.656, max: 57.296 },
      drill: 57.00
    }
  }
};

export const bspSizes = Object.keys(bspThreads);
