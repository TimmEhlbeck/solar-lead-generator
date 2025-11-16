import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { GoogleGenAI, Type } from '@google/genai';
import { ControlPanel } from '@/Components/ControlPanel';
import { MapWrapper } from '@/Components/MapWrapper';
import { AppState, PanelType, SolarAnalysis, RoofArea } from '../types';
import { PANEL_DEFINITIONS } from '../constants';
import { FullScreenError } from '@/Components/FullScreenError';
import { Header } from '@/Components/Header';
import { LandingContactForm } from '@/Components/LandingContactForm';
import { DynamicTheme } from '@/Components/DynamicTheme';

// TypeScript global type definitions for Google Maps
declare global {
  namespace google {
    namespace maps {
      interface LatLngLiteral {
        lat: number;
        lng: number;
      }

      class LatLng {
        constructor(lat: number, lng: number);
        lat(): number;
        lng(): number;
        toJSON(): LatLngLiteral;
      }

      class Map {
        constructor(mapDiv: HTMLElement | null, opts?: any);
        setCenter(latLng: LatLng | LatLngLiteral): void;
        setZoom(zoom: number): void;
      }

      class Rectangle {
        constructor(opts?: any);
        setMap(map: Map | null): void;
      }

      namespace places {
        interface PlaceResult {
          geometry?: {
            location?: LatLng;
          };
          name?: string;
          formatted_address?: string;
        }
        class Autocomplete {
          constructor(inputElement: HTMLInputElement, opts?: any);
          getPlace(): PlaceResult;
          addListener(eventName: string, handler: () => void): any;
        }

        interface AutocompletePrediction {
          description: string;
          place_id: string;
        }

        enum PlacesServiceStatus {
          OK = "OK",
        }

        class AutocompleteService {
          getPlacePredictions(
            request: any,
            callback: (
              predictions: AutocompletePrediction[] | null,
              status: PlacesServiceStatus
            ) => void
          ): void;
        }

        class PlacesService {
          constructor(attributionsContainer: HTMLElement);
          getDetails(
            request: any,
            callback: (
              place: PlaceResult | null,
              status: PlacesServiceStatus
            ) => void
          ): void;
        }
      }

      class Polygon {
        constructor(opts?: any);
        getPath(): {
          getArray(): LatLng[];
        };
        setMap(map: Map | null): void;
        setOptions(opts?: any): void;
      }

      class Polyline {
        constructor(opts?: any);
        setMap(map: Map | null): void;
      }

      namespace geometry {
        namespace spherical {
          function computeArea(path: LatLng[] | LatLngLiteral[]): number;
          function computeHeading(from: LatLng, to: LatLng): number;
          function computeOffset(from: LatLng, distance: number, heading: number): LatLng;
          function computeDistanceBetween(from: LatLng, to: LatLng): number;
        }
        namespace poly {
          function containsLocation(point: LatLng, polygon: Polygon): boolean;
        }
      }

      namespace drawing {
        class DrawingManager {
          constructor(opts?: any);
          setMap(map: Map | null): void;
          setDrawingMode(mode: any | null): void;
        }
        enum OverlayType {
          POLYGON = 'polygon'
        }
      }

      namespace event {
        function addListener(instance: any, eventName: string, handler: (...args: any[]) => void): any;
        function clearInstanceListeners(instance: any): void;
      }

      class LatLngBounds {
        constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
        extend(point: LatLng | LatLngLiteral): void;
        getSouthWest(): LatLng;
        getNorthEast(): LatLng;
      }
    }
  }

  interface Window {
    google: typeof google;
    gm_authFailure?: () => void;
    initMap?: () => void;
  }
}

interface ProjectData {
  id: number;
  name: string;
  location_lat: number;
  location_lng: number;
  map_center: { lat: number; lng: number } | null;
  zoom: number;
  roof_areas: Array<{
    id: number;
    name: string;
    path: Array<{ lat: number; lng: number }>;
    panel_type: string;
    tilt_angle: number;
    orientation_angle: number;
    panel_count: number;
    exclusion_zones: Array<{
      id: number;
      name: string;
      path: Array<{ lat: number; lng: number }>;
    }>;
  }>;
}

interface LandingPlannerProps {
  companyName: string;
  googleMapsApiKey: string;
  geminiApiKey: string;
  project?: ProjectData | null;
  auth?: {
    user?: {
      name: string;
      email: string;
    };
  };
}

export default function LandingPlanner({ companyName, googleMapsApiKey, geminiApiKey, project, auth }: LandingPlannerProps) {
  const [appState, setAppState] = useState<AppState>(project ? AppState.CONFIGURING : AppState.SEARCHING);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>(
    project && project.map_center
      ? { lat: Number(project.map_center.lat), lng: Number(project.map_center.lng) }
      : { lat: 51.1657, lng: 10.4515 } // Centered on Germany
  );
  const [zoom, setZoom] = useState(project?.zoom || 6);
  const [roofs, setRoofs] = useState<RoofArea[]>([]);
  const [activeRoofId, setActiveRoofId] = useState<string | null>(null);
  const [placedPanels, setPlacedPanels] = useState<google.maps.Polygon[]>([]);
  const [selectedPanelType, setSelectedPanelType] = useState<PanelType>(PanelType.STANDARD);
  const [tiltAngle, setTiltAngle] = useState<number>(20);
  const [orientationAngle, setOrientationAngle] = useState<number>(0);
  const [solarAnalysis, setSolarAnalysis] = useState<SolarAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [criticalError, setCriticalError] = useState<string | null>(null);
  const [mapScriptLoaded, setMapScriptLoaded] = useState(false);
  const [isDrawingExclusion, setIsDrawingExclusion] = useState<boolean>(false);
  const [projectId, setProjectId] = useState<number | null>(project?.id || null);
  const [addressInput, setAddressInput] = useState<string>('');

  const activeRoof = useMemo(() => roofs.find(r => r.id === activeRoofId) || null, [roofs, activeRoofId]);
  const totalPanelCount = useMemo(() => roofs.reduce((sum, roof) => sum + roof.panelCount, 0), [roofs]);

  useEffect(() => {
    let isMounted = true;

    if (window.google && window.google.maps) {
      if(isMounted) setMapScriptLoaded(true);
      return;
    }

    // Check if script is already loading or loaded
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      window.initMap = () => {
        if (isMounted) {
          setMapScriptLoaded(true);
        }
      };

      window.gm_authFailure = () => {
        if (isMounted) {
          setCriticalError("Authentifizierung bei Google Maps fehlgeschlagen. Der API-Schlüssel ist möglicherweise ungültig.");
        }
      };

      if (window.google && window.google.maps) {
        if(isMounted) setMapScriptLoaded(true);
      }
      return;
    }

    window.initMap = () => {
      if (isMounted) {
        setMapScriptLoaded(true);
      }
    };

    window.gm_authFailure = () => {
      if (isMounted) {
        setCriticalError("Authentifizierung bei Google Maps fehlgeschlagen. Der API-Schlüssel ist möglicherweise ungültig.");
      }
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places,drawing,geometry&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      if (isMounted) {
        setCriticalError("Google Maps-Skript konnte nicht geladen werden. Bitte überprüfen Sie Ihre Netzwerkverbindung.");
      }
    };
    document.head.appendChild(script);

    return () => {
      isMounted = false;
    };
  }, [googleMapsApiKey]);

  // Load project data if editing existing project
  useEffect(() => {
    if (!project || !project.roof_areas) return;

    // Convert project roof areas to the component's RoofArea format
    const loadedRoofs: RoofArea[] = project.roof_areas.map((roofData) => ({
      id: `roof-${roofData.id}`,
      name: roofData.name,
      path: roofData.path.map(coord => ({ lat: coord.lat, lng: coord.lng })),
      panelType: roofData.panel_type as PanelType,
      tiltAngle: Number(roofData.tilt_angle),
      orientationAngle: Number(roofData.orientation_angle),
      panelCount: roofData.panel_count,
      polygon: null,
      exclusionZones: roofData.exclusion_zones.map((zoneData) => ({
        id: `exclusion-${zoneData.id}`,
        name: zoneData.name,
        path: zoneData.path.map(coord => ({ lat: coord.lat, lng: coord.lng })),
        polygon: null,
      })),
    }));

    setRoofs(loadedRoofs);

    // Set the first roof as active and load its settings if there are any
    if (loadedRoofs.length > 0) {
      setActiveRoofId(loadedRoofs[0].id);
      setSelectedPanelType(loadedRoofs[0].panelType);
      setTiltAngle(loadedRoofs[0].tiltAngle);
      setOrientationAngle(loadedRoofs[0].orientationAngle);
    }

  }, [project]);

  // Reverse geocode the project location to get the address (separate useEffect to wait for Google Maps)
  useEffect(() => {
    if (!project || !mapScriptLoaded || !project.location_lat || !project.location_lng) return;

    const geocoder = new window.google.maps.Geocoder();
    const latlng = {
      lat: Number(project.location_lat),
      lng: Number(project.location_lng)
    };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        setAddressInput(results[0].formatted_address);
      } else {
        console.error('Geocoding fehlgeschlagen:', status);
      }
    });
  }, [project, mapScriptLoaded]);

  // Save config changes to the active roof
  useEffect(() => {
    if (activeRoofId) {
        setRoofs(prevRoofs => prevRoofs.map(roof => {
            if (roof.id === activeRoofId) {
                if (roof.panelType === selectedPanelType &&
                    roof.tiltAngle === tiltAngle &&
                    roof.orientationAngle === orientationAngle &&
                    roof.panelCount === placedPanels.length) {
                        return roof;
                    }
                return {
                    ...roof,
                    panelType: selectedPanelType,
                    tiltAngle: tiltAngle,
                    orientationAngle: orientationAngle,
                    panelCount: placedPanels.length
                };
            }
            return roof;
        }));
    }
  }, [selectedPanelType, tiltAngle, orientationAngle, placedPanels, activeRoofId]);

  const panelDef = useMemo(() => PANEL_DEFINITIONS[selectedPanelType], [selectedPanelType]);

  const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      setMapCenter(place.geometry.location.toJSON());
      setZoom(20);
      setAppState(AppState.DRAWING);
      setRoofs([]);
      setActiveRoofId(null);
      setPlacedPanels([]);
      setSolarAnalysis(null);
      setUserError(null);
    }
  }, []);

  const handlePolygonComplete = useCallback((polygon: google.maps.Polygon) => {
    const path = polygon.getPath().getArray().map(p => p.toJSON());
    const newRoof: RoofArea = {
      id: new Date().toISOString(),
      name: `Dachfläche ${roofs.length + 1}`,
      path,
      panelType: selectedPanelType,
      tiltAngle: tiltAngle,
      orientationAngle: 0,
      panelCount: 0,
      exclusionZones: [],
    };
    setRoofs(prev => [...prev, newRoof]);
    setActiveRoofId(newRoof.id);
    setOrientationAngle(0);
    setAppState(AppState.CONFIGURING);
  }, [roofs.length, selectedPanelType, tiltAngle]);

  const handleSelectRoof = useCallback((roofId: string) => {
    const selectedRoof = roofs.find(r => r.id === roofId);
    if (selectedRoof) {
      setActiveRoofId(roofId);
      setSelectedPanelType(selectedRoof.panelType);
      setTiltAngle(selectedRoof.tiltAngle);
      setOrientationAngle(selectedRoof.orientationAngle);
      setSolarAnalysis(null);
      setAppState(AppState.CONFIGURING);
    }
  }, [roofs]);

  const handleDeleteRoof = (roofIdToDelete: string) => {
    setRoofs(prev => prev.filter(r => r.id !== roofIdToDelete));
    if (activeRoofId === roofIdToDelete) {
      setActiveRoofId(null);
      setPlacedPanels([]);
      setSolarAnalysis(null);
      setAppState(AppState.DRAWING);
    }
  };

  const handleStartNewDrawing = () => {
    setActiveRoofId(null);
    setAppState(AppState.DRAWING);
  }

  const handleExclusionZoneComplete = useCallback((polygon: google.maps.Polygon) => {
    if (!activeRoofId) return;

    const path = polygon.getPath().getArray().map(p => p.toJSON());
    const activeRoof = roofs.find(r => r.id === activeRoofId);

    if (!activeRoof) return;

    const newExclusionZone: import('../types').ExclusionZone = {
      id: new Date().toISOString(),
      name: `Sperrfläche ${activeRoof.exclusionZones.length + 1}`,
      path,
    };

    setRoofs(prevRoofs => prevRoofs.map(roof => {
      if (roof.id === activeRoofId) {
        return {
          ...roof,
          exclusionZones: [...roof.exclusionZones, newExclusionZone],
        };
      }
      return roof;
    }));

    setIsDrawingExclusion(false);
    setPlacedPanels([]);
  }, [activeRoofId, roofs]);

  const handleDeleteExclusionZone = useCallback((exclusionZoneId: string) => {
    if (!activeRoofId) return;

    setRoofs(prevRoofs => prevRoofs.map(roof => {
      if (roof.id === activeRoofId) {
        return {
          ...roof,
          exclusionZones: roof.exclusionZones.filter(ez => ez.id !== exclusionZoneId),
        };
      }
      return roof;
    }));

    setPlacedPanels([]);
  }, [activeRoofId]);

  const handleToggleExclusionDrawing = useCallback(() => {
    setIsDrawingExclusion(prev => !prev);
  }, []);

  const handleAnalysis = async () => {
    const allRoofsWithPanels = roofs.filter(r => r.panelCount > 0);

    if (allRoofsWithPanels.length === 0) {
      setUserError("Bitte konfigurieren Sie mindestens eine Dachfläche mit Modulen, bevor Sie die Analyse starten.");
      return;
    }

    setIsLoading(true);
    setUserError(null);
    setSolarAnalysis(null);
    setAppState(AppState.ANALYZING);

    const finalTotalPanelCount = allRoofsWithPanels.reduce((sum, roof) => sum + roof.panelCount, 0);

    const roofDetails = allRoofsWithPanels.map(roof => {
        const roofAreaM2 = google.maps.geometry.spherical.computeArea(
            roof.path.map(p => new google.maps.LatLng(p.lat, p.lng))
        );
        const panelDef = PANEL_DEFINITIONS[roof.panelType];
        return `- ${roof.name}: ${roof.panelCount} Module. Fläche: ${roofAreaM2.toFixed(2)} m². Neigung: ${roof.tiltAngle}°. Ausrichtung: ${roof.orientationAngle.toFixed(0)}°. Modul: ${roof.panelType} (${panelDef.watts}W)`;
    }).join('\n');

    const prompt = `
      Act as a solar energy analyst. Calculate the total solar potential for a residential installation with multiple roof areas. Provide the response in German.
      - Location (Lat/Lng): ${mapCenter.lat}, ${mapCenter.lng}
      - Total Number of Panels Installed: ${finalTotalPanelCount}
      - Roof Details:
      ${roofDetails}
      - Assume an average electricity cost of €0.30/kWh for savings calculations.
      Base your calculations on the average sunlight for the location and standard panel efficiency for each panel type. Sum up the production and savings from all roof areas to a single total estimate. Provide brief notes on your assumptions in German.
    `;

    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              annualProductionKWh: { type: Type.NUMBER, description: 'Geschätzte jährliche Energieproduktion in kWh.' },
              annualSavingsEUR: { type: Type.NUMBER, description: 'Geschätzte jährliche Kosteneinsparung in EUR.' },
              notes: { type: Type.STRING, description: 'Eine kurze Erläuterung der getroffenen Annahmen.' },
              co2AvoidedKg: { type: Type.NUMBER, description: 'Geschätzte jährlich vermiedene Kilogramm CO2-Emissionen.' },
            },
            required: ['annualProductionKWh', 'annualSavingsEUR', 'notes', 'co2AvoidedKg'],
          },
        },
      });

      const text = response.text;
      const result = JSON.parse(text) as SolarAnalysis;
      setSolarAnalysis(result);
      setAppState(AppState.RESULTS);
    } catch (e) {
      console.error('Fehler bei der KI-Analyse:', e);
      const errorMessage = e instanceof Error ? e.message : 'Unbekannter Fehler';
      setUserError(`Analyse von KI fehlgeschlagen: ${errorMessage}. Bitte versuchen Sie es erneut.`);
      setAppState(AppState.CONFIGURING);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProject = async () => {
    if (!projectId) {
      setUserError('Kein Projekt zum Speichern gefunden.');
      return;
    }

    setIsLoading(true);
    setUserError(null);

    try {
      const projectData = {
        name: project?.name || 'Meine Solar-Planung',
        location_lat: mapCenter.lat,
        location_lng: mapCenter.lng,
        map_center: { lat: mapCenter.lat, lng: mapCenter.lng },
        zoom: zoom,
        roof_areas: roofs.map(roof => ({
          name: roof.name,
          path: roof.path,
          panel_type: roof.panelType,
          tilt_angle: roof.tiltAngle,
          orientation_angle: roof.orientationAngle,
          panel_count: roof.panelCount,
          exclusion_zones: roof.exclusionZones.map(zone => ({
            name: zone.name,
            path: zone.path,
          })),
        })),
      };

      console.log('Speichere Projekt mit ID:', projectId);
      console.log('Projektdaten:', projectData);

      const response = await window.axios.put(`/api/projects/${projectId}`, projectData);

      console.log('Antwort vom Server:', response);

      // Show success message
      alert('Projekt erfolgreich gespeichert!');
    } catch (err: any) {
      console.error('Fehler beim Speichern des Projekts:', err);
      console.error('Fehlerdetails:', err.response);

      if (err.response?.status === 401) {
        setUserError('Sie sind nicht angemeldet. Bitte melden Sie sich an.');
      } else if (err.response?.status === 419) {
        setUserError('Ihre Sitzung ist abgelaufen. Bitte laden Sie die Seite neu.');
      } else if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat();
        setUserError(`Validierungsfehler: ${errors.join(', ')}`);
      } else {
        setUserError(err.response?.data?.message || 'Fehler beim Speichern des Projekts');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (criticalError) {
      return (
          <>
              <Head title={`${companyName} - Solar Panel Planner`} />
              <FullScreenError
                  title="Kritischer Anwendungsfehler"
                  message={criticalError}
              >
                  <p className="text-sm text-gray-400 mt-4">
                      Bitte laden Sie die Seite neu oder kontaktieren Sie den Support.
                  </p>
              </FullScreenError>
          </>
      )
  }

  if (!mapScriptLoaded) {
    return (
        <>
            <DynamicTheme />
            <Head title={`${companyName} - Solar Panel Planner`} />
            <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white font-sans">
                <svg className="animate-spin h-10 w-10 mb-4" style={{ color: 'var(--company-primary)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h1 className="text-xl">Lade Google Maps...</h1>
            </div>
        </>
    );
  }

  return (
    <>
      <DynamicTheme />
      <Head title={`${companyName} - Solar Panel Planner`} />
      <div className="flex flex-col h-screen font-sans">
        <Header
          companyName={companyName}
          roofs={roofs}
          mapCenter={mapCenter}
          zoom={zoom}
          auth={auth}
          projectId={projectId}
          projectName={project?.name || null}
        />
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <ControlPanel
          appState={appState}
          onPlaceSelect={handlePlaceSelect}
          panelType={selectedPanelType}
          setPanelType={setSelectedPanelType}
          tiltAngle={tiltAngle}
          setTiltAngle={setTiltAngle}
          orientationAngle={orientationAngle}
          setOrientationAngle={setOrientationAngle}
          onAnalysis={handleAnalysis}
          isLoading={isLoading}
          analysisResult={solarAnalysis}
          panelCount={totalPanelCount}
          userError={userError}
          roofs={roofs}
          activeRoofId={activeRoofId}
          onSelectRoof={handleSelectRoof}
          onDeleteRoof={handleDeleteRoof}
          onStartNewDrawing={handleStartNewDrawing}
          isDrawingExclusion={isDrawingExclusion}
          addressInput={addressInput}
          onAddressInputChange={setAddressInput}
          onToggleExclusionDrawing={handleToggleExclusionDrawing}
          onDeleteExclusionZone={handleDeleteExclusionZone}
          onSaveProject={projectId ? handleSaveProject : undefined}
          isEditMode={!!projectId}
        />
        <main className="flex-grow h-full bg-gray-700 flex items-center justify-center relative">
            <MapWrapper
              center={mapCenter}
              zoom={zoom}
              isDrawingEnabled={appState === AppState.DRAWING}
              onPolygonComplete={handlePolygonComplete}
              roofs={roofs}
              activeRoofId={activeRoofId}
              panelDef={panelDef}
              setPlacedPanels={setPlacedPanels}
              setCriticalError={setCriticalError}
              orientationAngle={orientationAngle}
              setOrientationAngle={setOrientationAngle}
              tiltAngle={tiltAngle}
              isDrawingExclusion={isDrawingExclusion}
              onExclusionZoneComplete={handleExclusionZoneComplete}
              />

            {/* Contact Form appears after analysis */}
            {solarAnalysis && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <LandingContactForm
                    projectData={{
                      name: 'Meine Solar-Planung',
                      location_lat: mapCenter.lat,
                      location_lng: mapCenter.lng,
                      map_center: { lat: mapCenter.lat, lng: mapCenter.lng },
                      zoom: zoom,
                      total_panel_count: roofs.reduce((sum, r) => sum + r.panelCount, 0),
                      roof_areas: roofs.map(roof => ({
                        name: roof.name,
                        path: roof.path,
                        panel_type: roof.panelType,
                        tilt_angle: roof.tiltAngle,
                        orientation_angle: roof.orientationAngle,
                        panel_count: roof.panelCount,
                        exclusion_zones: roof.exclusionZones
                      }))
                    }}
                  />
                </div>
              </div>
            )}
        </main>
        </div>
      </div>
    </>
  );
}
