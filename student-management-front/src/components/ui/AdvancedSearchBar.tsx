import { useState } from 'react';
import { Button } from './Button';

export interface FilterOptions {
  searchTerm: string;
  gradeMin?: number;
  gradeMax?: number;
  subject?: string;
  hasGrades?: boolean;
  hasClasses?: boolean;
  sortBy?: 'name' | 'grade' | 'date' | 'class';
  sortOrder?: 'asc' | 'desc';
}

interface AdvancedSearchBarProps {
  placeholder?: string;
  onSearch: (filters: FilterOptions) => void;
  onClear?: () => void;
  className?: string;
  showGradeFilters?: boolean;
  showSubjectFilters?: boolean;
  showClassFilters?: boolean;
  availableSubjects?: string[];
  availableClasses?: string[];
}

export const AdvancedSearchBar = ({ 
  placeholder = "Search...", 
  onSearch, 
  onClear,
  className = "",
  showGradeFilters = true,
  showSubjectFilters = true,
  showClassFilters = true,
  availableSubjects = [],
  availableClasses = []
}: AdvancedSearchBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    gradeMin: undefined,
    gradeMax: undefined,
    subject: '',
    hasGrades: undefined,
    hasClasses: undefined,
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleClear = () => {
    const clearedFilters: FilterOptions = {
      searchTerm: '',
      gradeMin: undefined,
      gradeMax: undefined,
      subject: '',
      hasGrades: undefined,
      hasClasses: undefined,
      sortBy: 'name',
      sortOrder: 'asc'
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
    onClear?.();
  };

  const handleInputChange = (field: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const hasActiveFilters = () => {
    return filters.searchTerm || 
           filters.gradeMin !== undefined || 
           filters.gradeMax !== undefined || 
           filters.subject || 
           filters.hasGrades !== undefined || 
           filters.hasClasses !== undefined;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Search Bar */}
        <div className="flex">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => handleInputChange('searchTerm', e.target.value)}
              placeholder={placeholder}
              className="block w-full pl-10 pr-3 py-3 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 placeholder-gray-500 rounded-l-lg"
            />
          </div>
          <div className="flex">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 focus:outline-none border-l border-gray-200"
              title="Advanced filters"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
            </button>
            {hasActiveFilters() && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-3 text-gray-400 hover:text-gray-600 focus:outline-none border-l border-gray-200"
                title="Clear filters"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Search
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Grade Range Filters */}
              {showGradeFilters && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Grade
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.gradeMin || ''}
                      onChange={(e) => handleInputChange('gradeMin', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="e.g., 70"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Grade
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.gradeMax || ''}
                      onChange={(e) => handleInputChange('gradeMax', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="e.g., 90"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* Subject Filter */}
              {showSubjectFilters && availableSubjects.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={filters.subject || ''}
                    onChange={(e) => handleInputChange('subject', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">All subjects</option>
                    {availableSubjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Class Filter */}
              {showClassFilters && availableClasses.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class
                  </label>
                  <select
                    value={filters.subject || ''}
                    onChange={(e) => handleInputChange('subject', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">All classes</option>
                    {availableClasses.map(className => (
                      <option key={className} value={className}>{className}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Boolean Filters */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filters
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasGrades === true}
                      onChange={(e) => handleInputChange('hasGrades', e.target.checked ? true : undefined)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Has grades</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasClasses === true}
                      onChange={(e) => handleInputChange('hasClasses', e.target.checked ? true : undefined)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enrolled in classes</span>
                  </label>
                </div>
              </div>

              {/* Sort Options */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <div className="flex space-x-2">
                  <select
                    value={filters.sortBy || 'name'}
                    onChange={(e) => handleInputChange('sortBy', e.target.value as any)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="name">Name</option>
                    <option value="grade">Grade</option>
                    <option value="date">Date</option>
                    <option value="class">Class</option>
                  </select>
                  <select
                    value={filters.sortOrder || 'asc'}
                    onChange={(e) => handleInputChange('sortOrder', e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Filter Buttons */}
            <div className="space-y-2">
              <span className="text-sm text-gray-600 font-medium">Quick filters:</span>
              <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const quickFilters = { ...filters, gradeMin: 70, gradeMax: undefined };
                  setFilters(quickFilters);
                  onSearch(quickFilters);
                }}
                className="text-xs"
              >
                Grade ≥ 70
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const quickFilters = { ...filters, gradeMin: 80, gradeMax: undefined };
                  setFilters(quickFilters);
                  onSearch(quickFilters);
                }}
                className="text-xs"
              >
                Grade ≥ 80
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const quickFilters = { ...filters, gradeMin: 90, gradeMax: undefined };
                  setFilters(quickFilters);
                  onSearch(quickFilters);
                }}
                className="text-xs"
              >
                Grade ≥ 90
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const quickFilters = { ...filters, hasGrades: true };
                  setFilters(quickFilters);
                  onSearch(quickFilters);
                }}
                className="text-xs"
              >
                Has Grades
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const quickFilters = { ...filters, hasClasses: true };
                  setFilters(quickFilters);
                  onSearch(quickFilters);
                }}
                className="text-xs"
              >
                Enrolled
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const quickFilters = { ...filters, gradeMin: 0, gradeMax: 69 };
                  setFilters(quickFilters);
                  onSearch(quickFilters);
                }}
                className="text-xs"
                >
                Grade &lt; 70
              </Button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
