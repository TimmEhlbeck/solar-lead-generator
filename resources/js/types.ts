export enum AppState {
  SEARCHING = "SEARCHING",
  DRAWING = "DRAWING",
  CONFIGURING = "CONFIGURING",
  ANALYZING = "ANALYZING",
  RESULTS = "RESULTS",
}

export enum PanelType {
    STANDARD = "Standard Wohngebäude",
    PREMIUM = "Premium Hocheffizient",
    COMMERCIAL = "Großanlage Gewerbe"
}

export interface PanelDefinition {
    widthM: number;
    heightM: number;
    watts: number;
}

export interface SolarAnalysis {
    annualProductionKWh: number;
    annualSavingsEUR: number;
    notes: string;
    co2AvoidedKg: number;
}

export interface ExclusionZone {
    id: string;
    name: string;
    path: google.maps.LatLngLiteral[];
}

export interface RoofArea {
    id: string;
    name: string;
    path: google.maps.LatLngLiteral[];
    panelType: PanelType;
    tiltAngle: number;
    orientationAngle: number;
    panelCount: number;
    exclusionZones: ExclusionZone[];
}