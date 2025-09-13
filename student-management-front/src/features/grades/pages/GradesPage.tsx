import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../../components/layout/Layout';
import { useGrades } from '../../../hooks/useGrades';
import { Button } from '../../../components/ui/Button';
import { AdvancedSearchBar } from '../../../components/ui/AdvancedSearchBar';
import type { FilterOptions } from '../../../components/ui/AdvancedSearchBar';

export const GradesPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { grades, loading, error, meta, searchGradesAdvanced, changePage, changeLimit } = useGrades({
    page: currentPage,
    limit: pageSize,
  });

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);


  const handleAdvancedSearch = (filters: FilterOptions) => {
    searchGradesAdvanced(filters);
  };

  // Extract unique subjects and classes for filter options
  const availableSubjects = Array.from(new Set(
    grades.map(grade => grade.class.name)
  ));

  const availableClasses = Array.from(new Set(
    grades.map(grade => grade.class.name)
  ));

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    changePage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    changeLimit(size);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600 bg-green-100';
    if (grade >= 80) return 'text-blue-600 bg-blue-100';
    if (grade >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <Layout isAuthenticated={true} user={user}>
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Grades</h1>
          <p className="text-gray-600">Track and manage student grades across all classes</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <AdvancedSearchBar
            placeholder="Search grades by student name, ID, class name, or notes..."
            onSearch={handleAdvancedSearch}
            className="w-full"
            showGradeFilters={true}
            showSubjectFilters={true}
            showClassFilters={true}
            availableSubjects={availableSubjects}
            availableClasses={availableClasses}
          />
        </div>
        
        {/* Grades Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading grades...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading grades</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : grades.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No grades found</h3>
              <p className="text-gray-600">
                No grades have been recorded yet.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {grades.map((grade) => (
                      <tr key={grade.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {grade.student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{grade.student.name}</div>
                              <div className="text-sm text-gray-500 font-mono">{grade.student.idNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{grade.class.name}</div>
                            <div className="text-sm text-gray-500">{grade.class.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getGradeColor(grade.grade)}`}>
                            {grade.grade.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={grade.notes}>
                            {grade.notes || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(grade.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden">
                <div className="space-y-4 p-4">
                  {grades.map((grade) => (
                    <div key={grade.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-white">
                            {grade.student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">{grade.student.name}</h3>
                          <p className="text-sm text-gray-500 font-mono">{grade.student.idNumber}</p>
                          
                          <div className="mt-3 space-y-2">
                            <div>
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Class</span>
                              <div className="mt-1">
                                <p className="text-sm font-medium text-gray-900">{grade.class.name}</p>
                                <p className="text-sm text-gray-500">{grade.class.description}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Grade</span>
                                <div className="mt-1">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getGradeColor(grade.grade)}`}>
                                    {grade.grade.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date</span>
                                <p className="mt-1 text-sm text-gray-900">{formatDate(grade.createdAt)}</p>
                              </div>
                            </div>
                            
                            {grade.notes && (
                              <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</span>
                                <p className="mt-1 text-sm text-gray-900">{grade.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                {/* Mobile Pagination */}
                <div className="flex flex-col space-y-3 sm:hidden">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-700">
                      Page {meta.page} of {meta.totalPages}
                    </p>
                    <p className="text-sm text-gray-700">
                      {meta.total} total
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!meta.hasPrev}
                      className="flex-1 mr-2"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!meta.hasNext}
                      className="flex-1 ml-2"
                    >
                      Next
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="border-gray-300 rounded-md text-sm px-3 py-1"
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={20}>20 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                  </div>
                </div>

                {/* Desktop Pagination */}
                <div className="hidden sm:flex sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {Math.min((meta.page - 1) * meta.limit + 1, meta.total)}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(meta.page * meta.limit, meta.total)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{meta.total}</span>{' '}
                      results
                    </p>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="ml-3 border-gray-300 rounded-md text-sm"
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={20}>20 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!meta.hasPrev}
                    >
                      Previous
                    </Button>
                    <div className="flex space-x-1">
                      {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first page, last page, current page, and pages around current
                          return page === 1 || 
                                 page === meta.totalPages || 
                                 Math.abs(page - currentPage) <= 2;
                        })
                        .map((page, index, array) => {
                          // Add ellipsis if there's a gap
                          const showEllipsis = index > 0 && page - array[index - 1] > 1;
                          return (
                            <div key={page} className="flex items-center">
                              {showEllipsis && <span className="px-2 text-gray-500">...</span>}
                              <Button
                                variant={page === currentPage ? "primary" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                                className="px-3"
                              >
                                {page}
                              </Button>
                            </div>
                          );
                        })}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!meta.hasNext}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};
