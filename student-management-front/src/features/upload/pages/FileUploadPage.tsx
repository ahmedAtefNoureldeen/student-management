import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Layout } from '../../../components/layout/Layout';
import { useFileUpload } from '../../../hooks/useFileUpload';
import { Button } from '../../../components/ui/Button';
import type { FileUploadMappings } from '../../../services/apiUpload';

export const FileUploadPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<FileUploadMappings>({
    studentIdNumber: '',
    studentName: '',
    class: '',
    grade: '',
  });
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const uploadMutation = useFileUpload();

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please select a CSV or XLSX file.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setUploadResult(null);
    setHeaders([]);
    setMappings({
      studentIdNumber: '',
      studentName: '',
      class: '',
      grade: '',
    });
    setPreviewData([]);

    // Read file headers
    readFileHeaders(selectedFile);
  };

  const readFileHeaders = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return;

        if (file.type === 'text/csv') {
          // Parse CSV
          Papa.parse(data as string, {
            header: true,
            preview: 1, // Only read first row for headers
            complete: (results) => {
              if (results.data.length > 0) {
                const firstRow = results.data[0] as any;
                const fileHeaders = Object.keys(firstRow);
                setHeaders(fileHeaders);
                
                // Auto-map common header names
                autoMapHeaders(fileHeaders);
              }
            },
            error: (error: any) => {
              setError(`Error reading CSV file: ${error.message}`);
            },
          });
        } else {
          // Parse XLSX
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length > 0) {
            const fileHeaders = (jsonData[0] as string[]).filter(header => header);
            setHeaders(fileHeaders);
            
            // Auto-map common header names
            autoMapHeaders(fileHeaders);
          }
        }
      } catch (error) {
        setError('Error reading file. Please make sure it\'s a valid CSV or XLSX file.');
      }
    };

    if (file.type === 'text/csv') {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const autoMapHeaders = (fileHeaders: string[]) => {
    const autoMappings: Partial<FileUploadMappings> = {};
    
    fileHeaders.forEach(header => {
      const lowerHeader = header.toLowerCase();
      
      if (lowerHeader.includes('id') && lowerHeader.includes('student')) {
        autoMappings.studentIdNumber = header;
      } else if (lowerHeader.includes('name') && lowerHeader.includes('student')) {
        autoMappings.studentName = header;
      } else if (lowerHeader.includes('class') || lowerHeader.includes('course')) {
        autoMappings.class = header;
      } else if (lowerHeader.includes('grade') || lowerHeader.includes('score')) {
        autoMappings.grade = header;
      }
    });
    
    setMappings(prev => ({ ...prev, ...autoMappings }));
  };

  const handleMappingChange = (field: keyof FileUploadMappings, value: string) => {
    setMappings(prev => ({ ...prev, [field]: value }));
  };

  const generatePreview = () => {
    if (!file || !Object.values(mappings).every(Boolean)) {
      setError('Please select a file and map all required fields.');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return;

        if (file.type === 'text/csv') {
          Papa.parse(data as string, {
            header: true,
            preview: 6, // Show first 5 rows
            complete: (results) => {
              setPreviewData(results.data as any[]);
            },
            error: (error: any) => {
              setError(`Error generating preview: ${error.message}`);
            },
          });
        } else {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length > 1) {
            const headers = jsonData[0] as string[];
            const rows = jsonData.slice(1, 6) as any[][];
            
            const preview = rows.map(row => {
              const obj: any = {};
              headers.forEach((header, index) => {
                obj[header] = row[index];
              });
              return obj;
            });
            
            setPreviewData(preview);
          }
        }
      } catch (error) {
        setError('Error generating preview.');
      }
    };

    if (file.type === 'text/csv') {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const handleUpload = async () => {
    if (!file || !Object.values(mappings).every(Boolean)) {
      setError('Please select a file and map all required fields.');
      return;
    }

    try {
      const result = await uploadMutation.mutateAsync({ file, mappings });
      setUploadResult(result);
      setError(null);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Upload failed. Please try again.');
    }
  };

  const resetForm = () => {
    setFile(null);
    setHeaders([]);
    setMappings({
      studentIdNumber: '',
      studentName: '',
      class: '',
      grade: '',
    });
    setPreviewData([]);
    setError(null);
    setUploadResult(null);
  };

  return (
    <Layout isAuthenticated={true} user={user}>
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Import Data</h1>
          <p className="text-gray-600">Upload CSV or XLSX files to import students, classes, and grades</p>
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Upload File</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-lg font-medium text-gray-900 mb-2">
                {file ? file.name : 'Click to upload CSV or XLSX file'}
              </span>
              <span className="text-sm text-gray-500">
                Supports CSV and Excel files (.csv, .xlsx, .xls)
              </span>
            </label>
          </div>

          {file && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-blue-800">
                  File selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Header Mapping Section */}
        {headers.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Map Headers</h2>
            <p className="text-gray-600 mb-6">
              Map your file columns to the required fields. The system will auto-detect common column names.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID Number *
                </label>
                <select
                  value={mappings.studentIdNumber}
                  onChange={(e) => handleMappingChange('studentIdNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select column...</option>
                  {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name *
                </label>
                <select
                  value={mappings.studentName}
                  onChange={(e) => handleMappingChange('studentName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select column...</option>
                  {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class *
                </label>
                <select
                  value={mappings.class}
                  onChange={(e) => handleMappingChange('class', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select column...</option>
                  {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade *
                </label>
                <select
                  value={mappings.grade}
                  onChange={(e) => handleMappingChange('grade', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select column...</option>
                  {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <Button onClick={generatePreview} variant="outline">
                Preview Data
              </Button>
            </div>
          </div>
        )}

        {/* Preview Section */}
        {previewData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Preview Data</h2>
            <p className="text-gray-600 mb-4">First 5 rows of your data:</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row[mappings.studentIdNumber] || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row[mappings.studentName] || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row[mappings.class] || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row[mappings.grade] || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Upload Section */}
        {file && Object.values(mappings).every(Boolean) && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Import Data</h2>
            <p className="text-gray-600 mb-6">
              Ready to import your data. This will create students, classes, and grades based on your file.
            </p>
            
            <div className="flex space-x-4">
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                isLoading={uploadMutation.isPending}
                className="px-8"
              >
                {uploadMutation.isPending ? 'Importing...' : 'Import Data'}
              </Button>
              <Button onClick={resetForm} variant="outline">
                Start Over
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Success Display */}
        {uploadResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-green-800">Import Successful!</h3>
            </div>
            <p className="text-green-700 mb-4">{uploadResult.message}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-800">{uploadResult.statistics.studentsCreated}</div>
                <div className="text-sm text-green-600">Students Created</div>
              </div>
              <div className="text-center p-3 bg-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-800">{uploadResult.statistics.classesCreated}</div>
                <div className="text-sm text-green-600">Classes Created</div>
              </div>
              <div className="text-center p-3 bg-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-800">{uploadResult.statistics.gradesCreated}</div>
                <div className="text-sm text-green-600">Grades Created</div>
              </div>
              <div className="text-center p-3 bg-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-800">{uploadResult.statistics.processedRows}</div>
                <div className="text-sm text-green-600">Rows Processed</div>
              </div>
            </div>
            {/* Additional Statistics */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-3">Import Details:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-green-700">Total Rows:</span>
                  <span className="ml-2 font-medium text-green-800">{uploadResult.statistics.totalRows}</span>
                </div>
                <div>
                  <span className="text-green-700">Students Updated:</span>
                  <span className="ml-2 font-medium text-green-800">{uploadResult.statistics.studentsUpdated}</span>
                </div>
                <div>
                  <span className="text-green-700">Classes Reused:</span>
                  <span className="ml-2 font-medium text-green-800">{uploadResult.statistics.classesReused}</span>
                </div>
                <div>
                  <span className="text-green-700">Grades Updated:</span>
                  <span className="ml-2 font-medium text-green-800">{uploadResult.statistics.gradesUpdated}</span>
                </div>
                <div>
                  <span className="text-green-700">Errors:</span>
                  <span className="ml-2 font-medium text-green-800">{uploadResult.statistics.errors}</span>
                </div>
              </div>
            </div>

            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-green-800 mb-2">Warnings:</h4>
                <ul className="text-sm text-green-700 list-disc list-inside">
                  {uploadResult.errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};
