export interface DENodeType {
  x: number;
  y: number;
  z: number;
  radius: number;
  color: string;
  speed: number;
  pulsePhase: number;
  pulseSpeed: number;
  angleX: number;
  angleY: number;
  moveSpeed: number;
}

export interface DEWaveType {
  y: number;
  amplitude: number;
  frequency: number;
  speed: number;
  color: string;
  lineWidth: number;
  startX: number;
}

export interface DEPoint2D {
  x: number;
  y: number;
}