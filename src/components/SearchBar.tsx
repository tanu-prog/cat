import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, Truck, FileText, Loader } from 'lucide-react';
import { apiService } from '../services/api';

interface SearchResult {
  _id: string;
  type: 'customer' | 'vehicle' | 'rental';
  title: string;
  subtitle: string;
  description: string;
}

interface SearchBarProps {
  onResultSelect?: (result: SearchResult) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onResultSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query.trim());
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.search(searchQuery);
      if (response.success) {
        const allResults = [
          ...response.data.results.customers,
          ...response.data.results.vehicles,
          ...response.data.results.rentals
        ];
        setResults(allResults);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setQuery(result.title);
    setIsOpen(false);
    onResultSelect?.(result);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return <User className="h-4 w-4 text-brand-primary" />;
      case 'vehicle':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'rental':
        return <FileText className="h-4 w-4 text-green-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'customer':
        return 'Customer';
      case 'vehicle':
        return 'Vehicle';
      case 'rental':
        return 'Rental';
      default:
        return '';
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search customers, vehicles, rentals..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader className="h-4 w-4 text-brand-primary animate-spin" />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (results.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-brand-lg z-50 max-h-96 overflow-y-auto animate-scale-in">
          {isLoading ? (
            <div className="p-4 text-center">
              <Loader className="h-6 w-6 text-brand-primary animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Search Results ({results.length})
                </p>
              </div>
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result._id}-${index}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 text-left hover:bg-brand-primary/5 dark:hover:bg-gray-700 transition-colors duration-200 flex items-start space-x-3 group"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-brand-accent dark:text-white group-hover:text-brand-primary transition-colors duration-200 truncate">
                          {result.title}
                        </p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          {getResultTypeLabel(result.type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {result.subtitle}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-1">
                        {result.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="p-4 text-center">
              <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No results found</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Try searching for customers, vehicles, or rentals
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;