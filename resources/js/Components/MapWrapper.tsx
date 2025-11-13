
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PanelDefinition, RoofArea } from '../types';

interface MapWrapperProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  isDrawingEnabled: boolean;
  onPolygonComplete: (polygon: google.maps.Polygon) => void;
  roofs: RoofArea[];
  activeRoofId: string | null;
  panelDef: PanelDefinition;
  setPlacedPanels: React.Dispatch<React.SetStateAction<google.maps.Polygon[]>>;
  setCriticalError: React.Dispatch<React.SetStateAction<string | null>>;
  orientationAngle: number;
  setOrientationAngle: (angle: number) => void;
  tiltAngle: number;
  isDrawingExclusion: boolean;
  onExclusionZoneComplete: (polygon: google.maps.Polygon) => void;
}

// Helper function to find the closest point on a line segment to a given point
function findClosestPointOnSegment(p: google.maps.LatLng, a: google.maps.LatLng, b: google.maps.LatLng) {
    const atob = { x: b.lng() - a.lng(), y: b.lat() - a.lat() };
    const atop = { x: p.lng() - a.lng(), y: p.lat() - a.lat() };
    const len = atob.x * atob.x + atob.y * atob.y;
    if (len === 0) return a;
    
    let t = (atop.x * atob.x + atop.y * atob.y) / len;
    t = Math.max(0, Math.min(1, t));

    return new google.maps.LatLng(a.lat() + atob.y * t, a.lng() + atob.x * t);
}

// Helper function to calculate distance squared between two points
function distanceSq(p1: google.maps.LatLng, p2: google.maps.LatLng) {
    const dx = p1.lng() - p2.lng();
    const dy = p1.lat() - p2.lat();
    return dx * dx + dy * dy;
}


export const MapWrapper: React.FC<MapWrapperProps> = ({
    center, zoom, isDrawingEnabled, onPolygonComplete, roofs, activeRoofId, panelDef,
    setPlacedPanels, setCriticalError, orientationAngle, setOrientationAngle, tiltAngle,
    isDrawingExclusion, onExclusionZoneComplete
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const drawingManager = useRef<google.maps.drawing.DrawingManager | null>(null);
  const polygonRefs = useRef<Record<string, google.maps.Polygon>>({});
  const exclusionZoneRefs = useRef<Record<string, google.maps.Polygon>>({});
  const alignmentLineRef = useRef<google.maps.Polyline | null>(null);
  const [panelPolys, setPanelPolys] = useState<google.maps.Polygon[]>([]);

  const activeRoof = roofs.find(r => r.id === activeRoofId) || null;

  // Cleanup function for drawing manager
  const cleanupDrawingManager = () => {
    if (drawingManager.current) {
      google.maps.event.clearInstanceListeners(drawingManager.current);
      drawingManager.current.setMap(null);
      drawingManager.current = null;
    }
  };
  
  const cleanupAlignmentLine = useCallback(() => {
    if (alignmentLineRef.current) {
        alignmentLineRef.current.setMap(null);
        alignmentLineRef.current = null;
    }
  }, []);

  // Cleanup function for panels. Made stable by using functional state updates.
  const cleanupPanels = useCallback(() => {
    setPanelPolys(currentPanels => {
        currentPanels.forEach(poly => {
            google.maps.event.clearInstanceListeners(poly);
            poly.setMap(null);
        });
        return [];
    });
    setPlacedPanels([]);
  }, [setPlacedPanels]);


  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeId: 'satellite',
        disableDefaultUI: true,
        zoomControl: true,
        tilt: 0,
      });
    } else if (mapInstance.current) {
      mapInstance.current.setCenter(center);
      mapInstance.current.setZoom(zoom);
    }
  }, [center, zoom]);
  
  useEffect(() => {
    if (!mapInstance.current) return;

    if (isDrawingEnabled || isDrawingExclusion) {
      if (!google.maps.drawing) {
        setCriticalError("Die Google Maps Zeichenbibliothek ('drawing') konnte nicht geladen werden. Dies liegt oft an einem eingeschränkten API-Schlüssel. Bitte überprüfen Sie die Konfiguration Ihres Schlüssels in der Google Cloud Console und laden Sie die Seite neu.");
        return;
      }

      const polygonOptions = isDrawingExclusion
        ? {
            fillColor: '#EF4444', fillOpacity: 0.4, strokeColor: '#DC2626',
            strokeWeight: 2, editable: false, zIndex: 2,
          }
        : {
            fillColor: '#FBBF24', fillOpacity: 0.3, strokeColor: '#FBBF24',
            strokeWeight: 2, editable: false, zIndex: 1,
          };

      drawingManager.current = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: false,
        polygonOptions,
      });

      google.maps.event.addListener(drawingManager.current, 'polygoncomplete', (polygon: google.maps.Polygon) => {
        if (isDrawingExclusion) {
          onExclusionZoneComplete(polygon);
        } else {
          onPolygonComplete(polygon);
        }
        polygon.setMap(null); // The main app state will handle re-rendering it.
        if (drawingManager.current) {
            drawingManager.current.setDrawingMode(null);
        }
      });

      drawingManager.current.setMap(mapInstance.current);
    } else {
        cleanupDrawingManager();
    }

    return () => {
      cleanupDrawingManager();
    };
  }, [isDrawingEnabled, isDrawingExclusion, onPolygonComplete, onExclusionZoneComplete, setCriticalError]);

  // Effect to draw/update all roof polygons
  useEffect(() => {
      if (!mapInstance.current) return;

      const drawnRoofIds = new Set<string>();

      // Draw/update all roofs from state
      roofs.forEach(roof => {
          drawnRoofIds.add(roof.id);
          const isSelected = roof.id === activeRoofId;
          const polygonOptions = {
              paths: roof.path,
              strokeColor: isSelected ? '#FBBF24' : '#78716C',
              strokeOpacity: 1.0,
              strokeWeight: isSelected ? 4 : 2,
              fillColor: isSelected ? '#FBBF24' : '#78716C',
              fillOpacity: 0.35,
              map: mapInstance.current,
              clickable: true,
              zIndex: isSelected ? 2 : 1
          };

          let poly = polygonRefs.current[roof.id];
          if (poly) {
              poly.setOptions(polygonOptions);
          } else {
              poly = new google.maps.Polygon(polygonOptions);
              polygonRefs.current[roof.id] = poly;
          }
          
          google.maps.event.clearInstanceListeners(poly); // Clear old listeners before adding new ones
          
          if (isSelected) {
            google.maps.event.addListener(poly, 'click', (e: { latLng: google.maps.LatLng }) => {
                const path = poly.getPath().getArray();
                if (path.length < 2) return;
        
                let closestEdgeIndex = -1;
                let minDistanceSq = Infinity;
        
                for (let i = 0; i < path.length; i++) {
                    const startPoint = path[i];
                    const endPoint = path[(i + 1) % path.length];
                    const closestPoint = findClosestPointOnSegment(e.latLng, startPoint, endPoint);
                    const distSq = distanceSq(e.latLng, closestPoint);
                    if (distSq < minDistanceSq) {
                        minDistanceSq = distSq;
                        closestEdgeIndex = i;
                    }
                }
        
                if (closestEdgeIndex !== -1) {
                    const startPoint = path[closestEdgeIndex];
                    const endPoint = path[(closestEdgeIndex + 1) % path.length];
                    const heading = google.maps.geometry.spherical.computeHeading(startPoint, endPoint);
                    setOrientationAngle((heading + 360) % 360);
        
                    cleanupAlignmentLine();
                    alignmentLineRef.current = new google.maps.Polyline({
                        path: [startPoint, endPoint],
                        strokeColor: '#FFFFFF',
                        strokeOpacity: 1.0,
                        strokeWeight: 4,
                        zIndex: 3,
                        map: mapInstance.current,
                    });
                }
            });
          }
      });
      
      // Clean up polygons that are no longer in the state
      Object.keys(polygonRefs.current).forEach(roofId => {
        if (!drawnRoofIds.has(roofId)) {
            const poly = polygonRefs.current[roofId];
            google.maps.event.clearInstanceListeners(poly);
            poly.setMap(null);
            delete polygonRefs.current[roofId];
        }
      });

  }, [roofs, activeRoofId, setOrientationAngle, cleanupAlignmentLine]);

  // Effect to draw/update exclusion zones for active roof
  useEffect(() => {
      if (!mapInstance.current || !activeRoof) {
        // Clean up all exclusion zone polygons
        Object.keys(exclusionZoneRefs.current).forEach(ezId => {
          const poly = exclusionZoneRefs.current[ezId];
          google.maps.event.clearInstanceListeners(poly);
          poly.setMap(null);
          delete exclusionZoneRefs.current[ezId];
        });
        return;
      }

      const drawnExclusionZoneIds = new Set<string>();

      // Draw/update all exclusion zones for active roof
      activeRoof.exclusionZones.forEach(ez => {
          drawnExclusionZoneIds.add(ez.id);
          const polygonOptions = {
              paths: ez.path,
              strokeColor: '#DC2626',
              strokeOpacity: 1.0,
              strokeWeight: 2,
              fillColor: '#EF4444',
              fillOpacity: 0.4,
              map: mapInstance.current,
              clickable: false,
              zIndex: 3  // Above roofs and panels
          };

          let poly = exclusionZoneRefs.current[ez.id];
          if (poly) {
              poly.setOptions(polygonOptions);
          } else {
              poly = new google.maps.Polygon(polygonOptions);
              exclusionZoneRefs.current[ez.id] = poly;
          }
      });

      // Clean up exclusion zones that are no longer in the state
      Object.keys(exclusionZoneRefs.current).forEach(ezId => {
        if (!drawnExclusionZoneIds.has(ezId)) {
            const poly = exclusionZoneRefs.current[ezId];
            google.maps.event.clearInstanceListeners(poly);
            poly.setMap(null);
            delete exclusionZoneRefs.current[ezId];
        }
      });

  }, [activeRoof]);


  // Effect to place panels on the ACTIVE roof
  useEffect(() => {
    cleanupPanels();
    if (!mapInstance.current || !activeRoof) {
        cleanupAlignmentLine();
        return;
    }

    const newPanels: google.maps.Polygon[] = [];
    const polygonForCheck = new google.maps.Polygon({ paths: activeRoof.path });

    const bounds = new google.maps.LatLngBounds();
    activeRoof.path.forEach(p => bounds.extend(p));
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    
    const diagonal = google.maps.geometry.spherical.computeDistanceBetween(sw, ne);
    
    // Adjust panel height based on tilt for a perspective effect
    const tiltInRadians = tiltAngle * (Math.PI / 180);
    const adjustedHeight = panelDef.heightM * Math.cos(tiltInRadians);

    const rowSpacing = adjustedHeight;
    const colSpacing = panelDef.widthM;

    for (let dRow = -diagonal; dRow < diagonal; dRow += rowSpacing) {
        for (let dCol = -diagonal; dCol < diagonal; dCol += colSpacing) {
            const center = google.maps.geometry.spherical.computeOffset(
                google.maps.geometry.spherical.computeOffset(sw, dRow, orientationAngle + 90),
                dCol,
                orientationAngle
            );

            const halfPanelW = panelDef.widthM / 2;
            const halfPanelH = adjustedHeight / 2;

            const p1 = google.maps.geometry.spherical.computeOffset(google.maps.geometry.spherical.computeOffset(center, halfPanelW, orientationAngle + 180), halfPanelH, orientationAngle + 270);
            const p2 = google.maps.geometry.spherical.computeOffset(google.maps.geometry.spherical.computeOffset(center, halfPanelW, orientationAngle), halfPanelH, orientationAngle + 270);
            const p3 = google.maps.geometry.spherical.computeOffset(google.maps.geometry.spherical.computeOffset(center, halfPanelW, orientationAngle), halfPanelH, orientationAngle + 90);
            const p4 = google.maps.geometry.spherical.computeOffset(google.maps.geometry.spherical.computeOffset(center, halfPanelW, orientationAngle + 180), halfPanelH, orientationAngle + 90);

            // Check if panel is within roof bounds
            const isWithinRoof = google.maps.geometry.poly.containsLocation(center, polygonForCheck) &&
                google.maps.geometry.poly.containsLocation(p1, polygonForCheck) &&
                google.maps.geometry.poly.containsLocation(p2, polygonForCheck) &&
                google.maps.geometry.poly.containsLocation(p3, polygonForCheck) &&
                google.maps.geometry.poly.containsLocation(p4, polygonForCheck);

            if (!isWithinRoof) continue;

            // Check if panel overlaps with any exclusion zone
            let overlapsExclusionZone = false;
            if (activeRoof.exclusionZones.length > 0) {
                for (const ez of activeRoof.exclusionZones) {
                    const exclusionPoly = new google.maps.Polygon({ paths: ez.path });
                    // Check if any corner of the panel is inside the exclusion zone
                    if (
                        google.maps.geometry.poly.containsLocation(center, exclusionPoly) ||
                        google.maps.geometry.poly.containsLocation(p1, exclusionPoly) ||
                        google.maps.geometry.poly.containsLocation(p2, exclusionPoly) ||
                        google.maps.geometry.poly.containsLocation(p3, exclusionPoly) ||
                        google.maps.geometry.poly.containsLocation(p4, exclusionPoly)
                    ) {
                        overlapsExclusionZone = true;
                        break;
                    }
                }
            }

            if (!overlapsExclusionZone) {
                const panelPoly = new google.maps.Polygon({
                    paths: [p1, p2, p3, p4],
                    strokeColor: '#ffffff', strokeOpacity: 0.8, strokeWeight: 0.5,
                    fillColor: '#0057b8', fillOpacity: 0.7, map: mapInstance.current,
                    zIndex: 3, clickable: true
                });

                google.maps.event.addListener(panelPoly, 'click', () => {
                    panelPoly.setMap(null); // Remove from map
                    setPlacedPanels(prevPanels => prevPanels.filter(p => p !== panelPoly));
                });

                newPanels.push(panelPoly);
            }
        }
    }
    
    setPanelPolys(newPanels);
    setPlacedPanels(newPanels);

    // This effect should only re-run when the layout needs to be recalculated.
    // It depends on the roof's ID, path's value, and exclusion zones, not their object references.
    // This prevents re-calculation when only the panel count changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoof?.id, JSON.stringify(activeRoof?.path), JSON.stringify(activeRoof?.exclusionZones), panelDef, orientationAngle, tiltAngle, cleanupAlignmentLine, cleanupPanels, setPlacedPanels]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
};
