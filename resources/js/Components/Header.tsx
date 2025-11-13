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

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Company Name */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {logoUrl ? (
                <img src={logoUrl} alt={displayName} className="h-10 w-10 object-contain" />
              ) : (
                <div className="bg-primary rounded-lg p-2">
                  <Sun className="h-6 w-6 text-primary-foreground" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-foreground">{displayName}</h1>
                <p className="text-xs text-muted-foreground">Solar Panel Planner</p>
              </div>
            </Link>

            {/* Current Project Indicator */}
            {projectName && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg border border-border">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Bearbeite:</span>
                  <span className="text-sm font-medium text-foreground">{projectName}</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            {/* Save Project Button - Only shown if user is authenticated */}
            {auth?.user && roofs.length > 0 && (
              <SaveProjectDialog
                roofs={roofs}
                mapCenter={mapCenter}
                zoom={zoom}
                projectId={projectId}
                projectName={projectName}
              />
            )}

            {auth?.user ? (
              <>
                <span className="text-sm text-muted-foreground mr-2">
                  Hallo, {auth.user.name}
                </span>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Anmelden
                  </Link>
                </Button>
                <Button variant="default" asChild>
                  <Link href="/register">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Registrieren
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
