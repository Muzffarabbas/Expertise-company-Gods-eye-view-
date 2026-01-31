
export enum AssetStatus {
  ACTIVE = 'ACTIVE',     // Green
  IDLE = 'IDLE',       // Amber
  BREAKDOWN = 'BREAKDOWN', // Red
  GHOST = 'GHOST'       // Purple
}

export interface Asset {
  id: string;
  type: 'CRANE' | 'TRUCK' | 'GENERATOR';
  model: string;
  status: AssetStatus;
  coordinates: [number, number]; // [lat, lng]
  lastLoad: number; // timestamp
  stressScore: number; // 0-100
  tonnage: number;
  assignedProject?: string;
  siteName?: string;
  clientCompany?: string;
  assignedJob?: string;
  lmiValue: number; // Load Moment Indicator %
  idleTimeMinutes: number;
  regionId: string;
}

export interface ActivityEvent {
  id: string;
  assetId: string;
  type: 'LOAD_COMPLETE' | 'IDLE_START' | 'GHOST_DETECTED' | 'MAINTENANCE_ALERT';
  message: string;
  timestamp: Date;
}

export interface Region {
  id: string;
  name: string;
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  center: [number, number];
}
