
import React, { useRef, useEffect, useState } from 'react';
import { Search } from 'lucide-react';

interface AddressAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  value?: string;
  onChange?: (value: string) => void;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ onPlaceSelect, value, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<number | null>(null);

  // Sync external value with internal state
  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    // Initialize services
    if (window.google && window.google.maps && !autocompleteService.current) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      // The PlacesService requires an HTML element for attributions, which we don't need to display.
      const attributionsContainer = document.createElement('div');
      placesService.current = new google.maps.places.PlacesService(attributionsContainer);
    }

    // Add event listener to close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  const fetchPredictions = (input: string) => {
     if (!autocompleteService.current) return;

     autocompleteService.current.getPlacePredictions(
      {
        input: input,
        componentRestrictions: { country: "de" },
        types: ['address'],
      },
      (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions);
        } else {
          setSuggestions([]);
        }
      }
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
    setShowSuggestions(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (newValue) {
      debounceTimerRef.current = window.setTimeout(() => {
        fetchPredictions(newValue);
      }, 300); // 300ms delay
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: google.maps.places.AutocompletePrediction) => {
    setInputValue(suggestion.description);
    if (onChange) {
      onChange(suggestion.description);
    }
    setSuggestions([]);
    setShowSuggestions(false);

    if (placesService.current && suggestion.place_id) {
      placesService.current.getDetails(
        {
          placeId: suggestion.place_id,
          fields: ['geometry', 'name', 'formatted_address'],
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry) {
            onPlaceSelect(place);
          }
        }
      );
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(suggestions.length > 0)}
        placeholder="Geben Sie Ihre Adresse ein..."
        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 pl-10 focus:ring-yellow-500 focus:border-yellow-500"
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.place_id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-2 text-white cursor-pointer hover:bg-gray-600"
            >
              {suggestion.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
