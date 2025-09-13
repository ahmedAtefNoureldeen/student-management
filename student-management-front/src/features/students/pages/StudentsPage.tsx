import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../../components/layout/Layout';
import { useStudents } from '../../../hooks/useStudents';
import { useCreateStudent } from '../../../hooks/useCreateStudent';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { SearchBar } from '../../../components/ui/SearchBar';

export const StudentsPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    idNumber: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const { students, loading, error, meta, searchStudents, changePage, changeLimit, refetch } = useStudents({
    page: currentPage,
    limit: pageSize,
  });
  
  const createStudentMutation = useCreateStudent();

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);


    const handleSearch = (term: string) => {
    searchStudents(term);
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

  const handleAddStudent = () => {
    setIsAddModalOpen(true);
    setNewStudent({ name: '', idNumber: '' });
    setFormErrors({});
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setNewStudent({ name: '', idNumber: '' });
    setFormErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!newStudent.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!newStudent.idNumber.trim()) {
      errors.idNumber = 'ID Number is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await createStudentMutation.mutateAsync({
        name: newStudent.name.trim(),
        idNumber: newStudent.idNumber.trim(),
      });
      handleCloseModal();
      refetch(); // Refresh the students list
    } catch (error) {
      console.error('Failed to create student:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Layout isAuthenticated={true} user={user}>
      <div className="w-full">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Students</h1>
              <p className="text-gray-600">Manage student information and records</p>
            </div>
            <Button onClick={handleAddStudent} className="px-6 w-full sm:w-auto">
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Student
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchBar
            placeholder="Search classes by name or description..."
            onSearch={handleSearch}
            className="max-w-2xl"
          />
        </div>
        
        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading students...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading students</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-600">
                No students have been added yet.
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
                        ID Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Classes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grades
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enrolled
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">{student.idNumber}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {student.studentClasses.length > 0 ? (
                              student.studentClasses.map((sc) => (
                                <span
                                  key={sc.id}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {sc.class.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">No classes</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {student.grades.length > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {student.grades.length} grade{student.grades.length !== 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="text-gray-500">No grades</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(student.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden">
                <div className="space-y-4 p-4">
                  {students.map((student) => (
                    <div key={student.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-white">
                            {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">{student.name}</h3>
                          <p className="text-sm text-gray-500 font-mono">{student.idNumber}</p>
                          
                          <div className="mt-3 space-y-2">
                            <div>
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Classes</span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {student.studentClasses.length > 0 ? (
                                  student.studentClasses.map((sc) => (
                                    <span
                                      key={sc.id}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                      {sc.class.name}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-sm text-gray-500">No classes</span>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Grades</span>
                              <div className="mt-1">
                                {student.grades.length > 0 ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {student.grades.length} grade{student.grades.length !== 1 ? 's' : ''}
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-500">No grades</span>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Enrolled</span>
                              <p className="mt-1 text-sm text-gray-900">{formatDate(student.createdAt)}</p>
                            </div>
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

        {/* Add Student Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={handleCloseModal}
          title="Add New Student"
        >
          <form onSubmit={handleSubmitStudent} className="space-y-4">
            <Input
              label="Student Name"
              name="name"
              type="text"
              value={newStudent.name}
              onChange={handleInputChange}
              error={formErrors.name}
              placeholder="Enter student name"
              required
            />
            
            <Input
              label="ID Number"
              name="idNumber"
              type="text"
              value={newStudent.idNumber}
              onChange={handleInputChange}
              error={formErrors.idNumber}
              placeholder="Enter ID number (e.g., STU001)"
              required
            />
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                disabled={createStudentMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createStudentMutation.isPending}
                isLoading={createStudentMutation.isPending}
              >
                {createStudentMutation.isPending ? 'Adding...' : 'Add Student'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};
