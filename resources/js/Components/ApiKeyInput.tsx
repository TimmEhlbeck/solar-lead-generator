
import React, { useState } from 'react';

interface ApiKeyInputProps {
  onKeySubmit: (key: string) => void;
  error?: string | null;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onKeySubmit, error }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white font-sans p-4">
      <div className="text-center bg-gray-800 border border-gray-700 p-8 rounded-lg max-w-2xl shadow-2xl">
        <h1 className="text-3xl font-bold mb-4 text-yellow-400">Google Maps API-Schlüssel erforderlich</h1>
        <p className="mb-6 text-gray-300">
          Für diese Anwendung ist ein Google Maps API-Schlüssel erforderlich. Bitte geben Sie Ihren Schlüssel unten ein, um fortzufahren.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Ihren API-Schlüssel hier einfügen"
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
            aria-label="Google Maps API Key"
          />
          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={!apiKey.trim()}
          >
            Speichern und Fortfahren
          </button>
        </form>

        {error && (
          <div className="mt-4 bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mt-8 text-left text-sm text-gray-400 space-y-3">
            <h2 className="font-semibold text-lg text-gray-200">Anleitung:</h2>
            <ol className="list-decimal list-inside space-y-2">
                <li>Gehen Sie zur <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">Google Cloud Console</a>.</li>
                <li>Erstellen Sie ein neues Projekt oder wählen Sie ein bestehendes aus.</li>
                <li>Aktivieren Sie ein <a href="http://g.co/dev/maps-no-account" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">Rechnungskonto</a> für Ihr Projekt.</li>
                <li>Aktivieren Sie die folgenden APIs: <strong>Maps JavaScript API</strong> und <strong>Places API</strong>.</li>
                <li>Erstellen Sie einen API-Schlüssel unter "Anmeldedaten".</li>
                <li><strong>Wichtig:</strong> Beschränken Sie Ihren Schlüssel aus Sicherheitsgründen (z. B. auf Ihre Domain).</li>
                <li>Kopieren Sie den Schlüssel und fügen Sie ihn oben ein.</li>
            </ol>
        </div>
      </div>
    </div>
  );
};
