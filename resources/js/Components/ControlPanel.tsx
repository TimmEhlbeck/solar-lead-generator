
import React from 'react';
import { AppState, PanelType, SolarAnalysis, RoofArea } from '../types';
import { AddressAutocomplete } from './AddressAutocomplete';
import { Sun, Zap, DollarSign, Wind, Trash2, BrainCircuit, Compass, Plus, MapPin, Ban } from 'lucide-react';
import { PANEL_DEFINITIONS } from '../constants';
import { ContactForm, ContactFormData } from './ContactForm';

interface ControlPanelProps {
  appState: AppState;
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  panelType: PanelType;
  setPanelType: (type: PanelType) => void;
  tiltAngle: number;
  setTiltAngle: (angle: number) => void;
  orientationAngle: number;
  setOrientationAngle: (angle: number) => void;
  onAnalysis: () => void;
  isLoading: boolean;
  analysisResult: SolarAnalysis | null;
  panelCount: number;
  userError: string | null;
  roofs: RoofArea[];
  activeRoofId: string | null;
  onSelectRoof: (id: string) => void;
  onDeleteRoof: (id: string) => void;
  onStartNewDrawing: () => void;
  isDrawingExclusion: boolean;
  onToggleExclusionDrawing: () => void;
  onDeleteExclusionZone: (exclusionZoneId: string) => void;
  onSaveProject?: () => void;
  isEditMode?: boolean;
  addressInput?: string;
  onAddressInputChange?: (value: string) => void;
}

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; value: string; unit: string }> = ({ icon, title, value, unit }) => (
    <div className="bg-gray-700/50 rounded-lg p-4 flex flex-col items-center justify-center text-center">
        <div className="mb-2" style={{ color: 'var(--company-primary)' }}>{icon}</div>
        <p className="text-sm text-gray-300">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-400">{unit}</p>
    </div>
);

const Step: React.FC<{ num: number; title: string; active: boolean; children: React.ReactNode }> = ({ num, title, active, children }) => (
    <div className={`p-4 border-l-4 ${active ? 'bg-gray-800/50' : 'border-gray-600'}`} style={active ? { borderColor: 'var(--company-primary)' } : {}}>
        <h3 className={`text-lg font-semibold ${active ? '' : 'text-gray-400'}`} style={active ? { color: 'var(--company-primary)' } : {}}>Schritt {num}: {title}</h3>
        {active && <div className="mt-4 space-y-4">{children}</div>}
    </div>
);


export const ControlPanel: React.FC<ControlPanelProps> = ({
  appState, onPlaceSelect, panelType, setPanelType, tiltAngle, setTiltAngle,
  orientationAngle, setOrientationAngle, onAnalysis, isLoading, analysisResult,
  panelCount, userError, roofs, activeRoofId, onSelectRoof, onDeleteRoof, onStartNewDrawing,
  isDrawingExclusion, onToggleExclusionDrawing, onDeleteExclusionZone, onSaveProject, isEditMode,
  addressInput, onAddressInputChange
}) => {
  const isLocationSelected = appState !== AppState.SEARCHING;
  const isRoofSelected = activeRoofId !== null;

  const handleContactFormSubmit = (formData: ContactFormData) => {
    // Here you would normally send this to your backend/API
    console.log('Contact Form Submitted:', formData);
    // You can also add analytics tracking here
    // For now, just log to console
  };

  const activeRoof = roofs.find(r => r.id === activeRoofId);

  let activeRoofSurfaceArea = 0;
  if (activeRoof && window.google && window.google.maps?.geometry?.spherical) {
      const area2D = google.maps.geometry.spherical.computeArea(activeRoof.path);
      const tiltRadians = activeRoof.tiltAngle * (Math.PI / 180);
      if (Math.cos(tiltRadians) > 0.0001) {
          activeRoofSurfaceArea = area2D / Math.cos(tiltRadians);
      } else {
          activeRoofSurfaceArea = area2D; // Fallback for vertical surfaces
      }
  }
  
  const activeRoofPanelArea = activeRoof ? activeRoof.panelCount * PANEL_DEFINITIONS[activeRoof.panelType].widthM * PANEL_DEFINITIONS[activeRoof.panelType].heightM : 0;


  return (
    <aside className="w-full md:w-96 lg:w-[450px] bg-gray-800 p-4 flex flex-col h-full overflow-y-auto shadow-2xl">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
            <Sun style={{ color: 'var(--company-primary)' }}/> Solarplaner KI
        </h1>
        <p className="text-gray-400 text-sm mt-1">Planen Sie Ihre Solaranlage mit KI-gestützten Erkenntnissen.</p>
      </header>

      <div className="flex-grow space-y-4">
        <Step num={1} title="Standort finden" active={true}>
            <AddressAutocomplete
              onPlaceSelect={onPlaceSelect}
              value={addressInput}
              onChange={onAddressInputChange}
            />
        </Step>

        <Step num={2} title="Dachflächen verwalten" active={isLocationSelected}>
            <p className="text-gray-300 text-sm">Zeichnen Sie eine oder mehrere Dachflächen. Wählen Sie eine Fläche aus, um sie zu konfigurieren.</p>
            <div className="space-y-2">
                {roofs.map(roof => {
                    const isActive = activeRoofId === roof.id;
                    return (
                    <div key={roof.id}
                         onClick={() => onSelectRoof(roof.id)}
                         className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isActive ? 'ring-2' : 'bg-gray-700 hover:bg-gray-600'}`}
                         style={isActive ? { backgroundColor: 'var(--company-primary)', opacity: 0.2, borderColor: 'var(--company-primary)' } : {}}>
                        <div className="flex items-center gap-3">
                            <MapPin className={`h-5 w-5 ${isActive ? '' : 'text-gray-400'}`} style={isActive ? { color: 'var(--company-primary)' } : {}} />
                            <span className="font-medium text-white">{roof.name}</span>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDeleteRoof(roof.id); }}
                            className="p-1 rounded-full text-gray-400 hover:bg-red-500/20 hover:text-red-400"
                            aria-label={`Lösche ${roof.name}`}
                        >
                            <Trash2 size={18}/>
                        </button>
                    </div>
                    );
                })}
            </div>
            <button
                onClick={onStartNewDrawing}
                className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                <Plus size={18}/> Neue Dachfläche zeichnen
            </button>
        </Step>
        
        <Step num={3} title="Module konfigurieren" active={isRoofSelected}>
            <div>
                <label htmlFor="panelType" className="block text-sm font-medium text-gray-300 mb-1">Modultyp</label>
                <select
                    id="panelType"
                    value={panelType}
                    onChange={(e) => setPanelType(e.target.value as PanelType)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 focus:ring-2"
                    style={{ '--tw-ring-color': 'var(--company-primary)' } as React.CSSProperties}
                >
                    {Object.values(PanelType).map(pt => (
                        <option key={pt} value={pt}>{pt} ({PANEL_DEFINITIONS[pt].watts}W)</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="tiltAngle" className="block text-sm font-medium text-gray-300 mb-1">Neigungswinkel ({tiltAngle}°)</label>
                <input
                    id="tiltAngle"
                    type="range"
                    min="0"
                    max="60"
                    value={tiltAngle}
                    onChange={(e) => setTiltAngle(Number(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg"
                    style={{ accentColor: 'var(--company-primary)' }}
                />
            </div>

            <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">Sperrflächen</label>
                    <button
                        onClick={onToggleExclusionDrawing}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            isDrawingExclusion
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-gray-600 hover:bg-gray-500 text-white'
                        }`}
                    >
                        <Ban size={16}/>
                        {isDrawingExclusion ? 'Zeichnen beenden' : 'Sperrfläche zeichnen'}
                    </button>
                </div>
                <p className="text-xs text-gray-400 mb-2">
                    Zeichnen Sie Bereiche ein, die von der Modulplatzierung ausgeschlossen werden sollen (z.B. Dachfenster, Schornsteine).
                </p>
                {activeRoof && activeRoof.exclusionZones.length > 0 && (
                    <div className="space-y-1">
                        {activeRoof.exclusionZones.map(ez => (
                            <div key={ez.id} className="flex items-center justify-between p-2 bg-red-500/10 rounded border border-red-500/30">
                                <span className="text-sm text-white">{ez.name}</span>
                                <button
                                    onClick={() => onDeleteExclusionZone(ez.id)}
                                    className="p-1 rounded-full text-red-400 hover:bg-red-500/20"
                                    aria-label={`Lösche ${ez.name}`}
                                >
                                    <Trash2 size={14}/>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-700/50 p-3 rounded-lg text-center flex flex-col justify-center">
                    <p className="text-gray-300 text-xs sm:text-sm leading-tight">Module (aktiv)</p>
                    <p className="text-xl sm:text-2xl font-bold text-white mt-1">{activeRoof?.panelCount || 0}</p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg text-center flex flex-col justify-center">
                    <p className="text-gray-300 text-xs sm:text-sm leading-tight">Module (Gesamt)</p>
                    <p className="text-xl sm:text-2xl font-bold text-white mt-1">{panelCount}</p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg text-center flex flex-col justify-center">
                    <p className="text-gray-300 text-xs sm:text-sm leading-tight">Dachfläche (geneigt)</p>
                    <p className="text-xl sm:text-2xl font-bold text-white mt-1">{activeRoofSurfaceArea.toFixed(1)} m²</p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg text-center flex flex-col justify-center">
                    <p className="text-gray-300 text-xs sm:text-sm leading-tight">Modulfläche (aktiv)</p>
                    <p className="text-xl sm:text-2xl font-bold text-white mt-1">{activeRoofPanelArea.toFixed(1)} m²</p>
                </div>
            </div>
            <p className="text-xs text-gray-400 text-center">Klicken Sie auf ein Modul auf der Karte, um es zu entfernen.</p>
        </Step>

        <Step num={4} title="Ausrichtung" active={isRoofSelected}>
             <p className="text-gray-300 text-sm">Klicken Sie auf eine Kante des Daches auf der Karte, um die Module daran auszurichten, oder passen Sie den Winkel manuell an.</p>
            <div>
                <label htmlFor="orientationAngle" className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                    <Compass size={16} /> Ausrichtungswinkel ({Math.round(orientationAngle)}° von Norden)
                </label>
                <input
                    id="orientationAngle"
                    type="range"
                    min="0"
                    max="359"
                    value={orientationAngle}
                    onChange={(e) => setOrientationAngle(Number(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg"
                    style={{ accentColor: 'var(--company-primary)' }}
                />
            </div>
        </Step>
        
        <div className="p-4 space-y-3">
             <button
                onClick={onAnalysis}
                disabled={isLoading || panelCount === 0}
                className="w-full flex items-center justify-center gap-2 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                style={isLoading || panelCount === 0 ? {} : {
                    backgroundColor: 'var(--company-primary)',
                    filter: 'brightness(1)',
                }}
                onMouseEnter={(e) => {
                    if (!(isLoading || panelCount === 0)) {
                        e.currentTarget.style.filter = 'brightness(1.1)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!(isLoading || panelCount === 0)) {
                        e.currentTarget.style.filter = 'brightness(1)';
                    }
                }}
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analysiere...
                    </>
                ) : (
                    <>
                        <BrainCircuit size={20}/> KI-Analyse abrufen
                    </>
                )}
            </button>

            {isEditMode && onSaveProject && (
                <button
                    onClick={onSaveProject}
                    disabled={isLoading || roofs.length === 0}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                    </svg>
                    Projekt speichern
                </button>
            )}
        </div>


        {userError && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg text-sm">{userError}</div>}

        {appState === AppState.RESULTS && analysisResult && (
             <div className="p-4 space-y-4 animate-fade-in">
                <div className="bg-gray-900 rounded-lg p-4 space-y-4">
                    <h3 className="text-xl font-semibold text-center" style={{ color: 'var(--company-primary)' }}>Ergebnisse der KI-Analyse</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InfoCard icon={<Zap size={24}/>} title="Jährliche Produktion" value={analysisResult.annualProductionKWh.toLocaleString()} unit="kWh / Jahr"/>
                        <InfoCard icon={<DollarSign size={24}/>} title="Jährliche Ersparnis" value={`€${analysisResult.annualSavingsEUR.toLocaleString()}`} unit="EUR / Jahr"/>
                        <InfoCard icon={<Wind size={24}/>} title="CO₂-Vermeidung" value={analysisResult.co2AvoidedKg.toLocaleString()} unit="kg / Jahr"/>
                    </div>
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                        <h4 className="font-semibold text-gray-200 mb-1">Anmerkungen der KI:</h4>
                        <p className="text-gray-300 text-sm">{analysisResult.notes}</p>
                    </div>
                </div>

                <ContactForm onSubmit={handleContactFormSubmit} />
            </div>
        )}
      </div>
    </aside>
  );
};
