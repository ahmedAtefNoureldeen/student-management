import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../../components/layout/Layout';
import { useClasses } from '../../../hooks/useClasses';
import { useCreateClass } from '../../../hooks/useCreateClass';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { SearchBar } from '../../../components/ui/SearchBar';

export const ClassesPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const { classes, loading, error, meta, searchClasses, changePage, changeLimit, refetch } = useClasses({
    page: currentPage,
    limit: pageSize,
  });
  
  const createClassMutation = useCreateClass();

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSearch = (term: string) => {
    searchClasses(term);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    changePage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    changeLimit(size);
  };

  const handleAddClass = () => {
    setIsAddModalOpen(true);
    setNewClass({ name: '', description: '' });
    setFormErrors({});
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setNewClass({ name: '', description: '' });
    setFormErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewClass(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!newClass.name.trim()) {
      errors.name = 'Class name is required';
    }
    
    if (!newClass.description.trim()) {
      errors.description = 'Description is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitClass = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await createClassMutation.mutateAsync({
        name: newClass.name.trim(),
        description: newClass.description.trim(),
      });
      handleCloseModal();
      refetch(); // Refresh the classes list
    } catch (error) {
      console.error('Failed to create class:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return 'text-gray-600 bg-gray-100';
    if (grade >= 90) return 'text-green-600 bg-green-100';
    if (grade >= 80) return 'text-blue-600 bg-blue-100';
    if (grade >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <Layout isAuthenticated={true} user={user}>
      <div className="w-full">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Classes</h1>
            <p className="text-gray-600">Organize and manage class schedules with grade statistics</p>
          </div>
          <Button onClick={handleAddClass} className="px-6">
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Class
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchBar
            placeholder="Search classes by name or description..."
            onSearch={handleSearch}
            className="max-w-2xl"
          />
        </div>
        
        {/* Classes Grid */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading classes...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading classes</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms.' : 'No classes have been created yet.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {classes.map((classItem) => (
                  <div key={classItem.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                    {/* Class Header */}
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{classItem.name}</h3>
                      <p className="text-gray-600 text-sm">{classItem.description}</p>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{classItem.totalStudents}</div>
                        <div className="text-xs text-gray-600">Students</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{classItem.totalGrades}</div>
                        <div className="text-xs text-gray-600">Grades</div>
                      </div>
                    </div>

                    {/* Average Grade */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Average Grade</span>
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getGradeColor(classItem.averageGrade)}`}>
                          {classItem.averageGrade !== null ? `${classItem.averageGrade.toFixed(1)}%` : 'No grades'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            classItem.averageGrade !== null ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                          style={{ width: `${classItem.averageGrade !== null ? classItem.averageGrade : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Top Students */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Top Students</h4>
                      {classItem.students.length > 0 ? (
                        <div className="space-y-1">
                          {classItem.students
                            .filter(student => student.grade !== undefined)
                            .sort((a, b) => (b.grade || 0) - (a.grade || 0))
                            .slice(0, 3)
                            .map((student) => (
                            <div key={student.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">{student.name}</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(student.grade || 0)}`}>
                                {student.grade?.toFixed(1)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No students enrolled yet</p>
                      )}
                    </div>

                    {/* Class Info */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Created: {formatDate(classItem.createdAt)}</span>
                        <span>Updated: {formatDate(classItem.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!meta.hasPrev}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!meta.hasNext}
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
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

        {/* Add Class Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={handleCloseModal}
          title="Add New Class"
        >
          <form onSubmit={handleSubmitClass} className="space-y-4">
            <Input
              label="Class Name"
              name="name"
              type="text"
              value={newClass.name}
              onChange={handleInputChange}
              error={formErrors.name}
              placeholder="Enter class name (e.g., Mathematics 101)"
              required
            />
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={newClass.description}
                onChange={handleInputChange}
                placeholder="Enter class description (e.g., Basic mathematics course)"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                rows={3}
                required
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                disabled={createClassMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createClassMutation.isPending}
                isLoading={createClassMutation.isPending}
              >
                {createClassMutation.isPending ? 'Adding...' : 'Add Class'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};
