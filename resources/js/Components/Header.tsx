import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Sun, LogIn, UserPlus, LayoutDashboard, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { SaveProjectDialog } from './SaveProjectDialog';
import { RoofArea } from '../types';

interface HeaderProps {
  auth?: {
    user?: {
      name: string;
      email: string;
    };
  };
  companyName: string;
  roofs?: RoofArea[];
  mapCenter?: google.maps.LatLngLiteral;
  zoom?: number;
  projectId?: number | null;
  projectName?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  auth,
  companyName,
  roofs = [],
  mapCenter = { lat: 0, lng: 0 },
  zoom = 20,
  projectId = null,
  projectName = null,
}) => {
  const { props } = usePage<any>();
  const settings = props.companySettings || {};

  // Use dynamic settings with fallback to props
  const displayName = settings.company_name || companyName;
  const logoUrl = settings.company_logo_url;

  // Don't show header if user is not authenticated
  if (!auth?.user) {
    return null;
  }

  return (
    <header className="border-b border-border sticky top-0 z-50 shadow-sm" style={{ backgroundColor: 'var(--company-primary)' }}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Company Name */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {logoUrl ? (
                <img src={logoUrl} alt={displayName} className="h-10 w-auto object-contain" />
              ) : (
                <div className="rounded-lg p-2 bg-white bg-opacity-20">
                  <Sun className="h-6 w-6" style={{ color: 'var(--company-text)' }} />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--company-text)' }}>{displayName}</h1>
                <p className="text-xs" style={{ color: 'var(--company-text)', opacity: 0.8 }}>Solar Panel Planner</p>
              </div>
            </Link>

            {/* Current Project Indicator */}
            {projectName && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white bg-opacity-20 rounded-lg">
                <FileText className="h-4 w-4" style={{ color: 'var(--company-text)' }} />
                <div className="flex flex-col">
                  <span className="text-xs" style={{ color: 'var(--company-text)', opacity: 0.8 }}>Bearbeite:</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--company-text)' }}>{projectName}</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            {/* Save Project Button - Only shown if there are roofs */}
            {roofs.length > 0 && (
              <SaveProjectDialog
                roofs={roofs}
                mapCenter={mapCenter}
                zoom={zoom}
                projectId={projectId}
                projectName={projectName}
              />
            )}

            <span className="text-sm mr-2" style={{ color: 'var(--company-text)' }}>
              Hallo, {auth.user.name}
            </span>
            <Button
              variant="outline"
              asChild
              className="bg-white bg-opacity-20 border-white border-opacity-30 hover:bg-white hover:bg-opacity-30"
              style={{ color: 'var(--company-text)' }}
            >
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};
