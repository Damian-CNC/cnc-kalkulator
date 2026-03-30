// src/utils/threadMath.ts

export interface ThreadNominalDimensions {
  nominalDiameter: number;
  pitch: number;
  pitchDiameter: number;         // d2 (śruba) / D2 (nakrętka)
  externalMinorDiameter: number; // d3 (średnica rdzenia śruby)
  internalMinorDiameter: number; // D1 (średnica otworu nakrętki)
  tapDrillSize: number;          // wiertło pod gwintownik klasyczny
  formTapDrillSize: number;      // wiertło pod wygniatak (bezwiórowy)
}

/**
 * Oblicza nominalne wymiary gwintu metrycznego (zwykłego i drobnozwojnego)
 * na podstawie średnicy nominalnej (d) i skoku (P).
 */
export function calculateMetricThread(d: number, P: number): ThreadNominalDimensions {
  // Wysokość trójkąta teoretycznego (H = P * sqrt(3)/2)
  const H = 0.866025 * P; 

  // Średnica podziałowa (d2 = D2)
  const pitchDiameter = d - 0.649519 * P;

  // Średnica rdzenia gwintu zewnętrznego (śruby) (d3)
  const externalMinorDiameter = d - 1.226869 * P;

  // Średnica wewnętrzna gwintu wewnętrznego (nakrętki) (D1)
  const internalMinorDiameter = d - 1.082532 * P;

  // Praktyczne rozmiary wierteł
  const tapDrillSize = d - P;
  
  // Wiertło pod wygniatak - współczynnik to zazwyczaj od 0.45 do 0.5 w zależności 
  // od plastyczności materiału. 0.49 to najbezpieczniejszy standard warsztatowy.
  const formTapDrillSize = d - (0.49 * P); 

  // Funkcja pomocnicza zaokrąglająca wyniki do 3 miejsc po przecinku (standard CNC)
  const round3 = (val: number) => Math.round(val * 1000) / 1000;

  return {
    nominalDiameter: round3(d),
    pitch: round3(P),
    pitchDiameter: round3(pitchDiameter),
    externalMinorDiameter: round3(externalMinorDiameter),
    internalMinorDiameter: round3(internalMinorDiameter),
    tapDrillSize: round3(tapDrillSize),
    formTapDrillSize: round3(formTapDrillSize),
  };
}