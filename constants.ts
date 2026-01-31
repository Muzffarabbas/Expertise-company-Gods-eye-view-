
import { AssetStatus, Region } from './types';

export const KSA_BOUNDS = {
  minLat: 16.5,
  maxLat: 31.5,
  minLng: 34.5,
  maxLng: 55.5
};

export const PROJECT_SITES = [
  { name: 'NEOM Site Alpha', regionId: 'neom', coords: [28.4, 35.1], client: 'NEOM Authority', job: 'Foundation Heavy Lift' },
  { name: 'NEOM The Line - Hub 1', regionId: 'neom', coords: [28.1, 34.8], client: 'Samsung C&T', job: 'Structural Assembly' },
  { name: 'Jubail Industrial 2', regionId: 'jubail', coords: [26.9, 49.6], client: 'SABIC', job: 'Reactor Installation' },
  { name: 'Riyadh Metro East', regionId: 'riyadh', coords: [24.7, 46.8], client: 'RCRC', job: 'Bridge Segment Placement' },
  { name: 'Red Sea Resort C', regionId: 'redsea', coords: [24.2, 37.8], client: 'Red Sea Global', job: 'Prefab Module Placing' },
  { name: 'Jeddah Waterfront', regionId: 'jeddah', coords: [21.6, 39.1], client: 'MOH', job: 'Coastal Defense reinforcement' },
];

export const REGIONS: Region[] = [
  {
    id: 'neom',
    name: 'NEOM SECTOR',
    bounds: { minLat: 27.5, maxLat: 29.5, minLng: 34.5, maxLng: 36.5 },
    center: [28.5, 35.5]
  },
  {
    id: 'jubail',
    name: 'JUBAIL INDUSTRIAL',
    bounds: { minLat: 26.5, maxLat: 27.5, minLng: 49.0, maxLng: 50.0 },
    center: [27.0, 49.5]
  },
  {
    id: 'riyadh',
    name: 'RIYADH HUB',
    bounds: { minLat: 24.0, maxLat: 25.5, minLng: 46.0, maxLng: 47.5 },
    center: [24.7, 46.7]
  },
  {
    id: 'redsea',
    name: 'RED SEA GLOBAL',
    bounds: { minLat: 23.5, maxLat: 26.0, minLng: 37.0, maxLng: 39.0 },
    center: [24.5, 38.0]
  },
  {
    id: 'jeddah',
    name: 'JEDDAH PORT',
    bounds: { minLat: 21.0, maxLat: 22.0, minLng: 39.0, maxLng: 40.0 },
    center: [21.5, 39.5]
  }
];

export const MOCK_PROJECTS = [
  'NEOM - Line Project',
  'Jubail Industrial Expansion',
  'Red Sea Global - Amaala',
  'Diriyah Gate Dev',
  'Qiddiya Infrastructure',
  'King Salman Park'
];

export const FAILURE_TYPES = [
  'Engine Oil Pressure Critical',
  'Hydraulic Seal Rupture',
  'Main Boom Stress Fracture',
  'Electrical Short in PLC',
  'Tire Puncture - Front Left',
  'Hoist Cable Fraying',
  'Outrigger Pressure Loss',
  'Cooling System Failure',
  'Fuel Pump Malfunction'
];

export const REVENUE_RATE_PER_HOUR = {
  [AssetStatus.ACTIVE]: 450,
  [AssetStatus.IDLE]: -850,
  [AssetStatus.BREAKDOWN]: -1200,
  [AssetStatus.GHOST]: -2500
};

export const INITIAL_ASSET_COUNT = 1200; 
