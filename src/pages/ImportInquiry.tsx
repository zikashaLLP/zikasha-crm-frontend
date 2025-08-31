import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, FileText, AlertCircle, CheckCircle, X, Eye, Database, ChevronDown, ChevronUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import api from '@/api/axios';

// Zod schema for file validation
const fileSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files?.length > 0, "Please select a file")
    .refine((files) => {
      if (!files || files.length === 0) return false;
      const file = files[0];
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      const allowedExtensions = ['.csv', '.xls', '.xlsx'];
      const hasValidType = allowedTypes.includes(file.type);
      const hasValidExtension = allowedExtensions.some(ext => 
        file.name.toLowerCase().endsWith(ext)
      );
      return hasValidType || hasValidExtension;
    }, "Only CSV, XLS, and XLSX files are allowed")
    .refine((files) => {
      if (!files || files.length === 0) return false;
      const file = files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB
      return file.size <= maxSize;
    }, "File size must be less than 5MB")
});

type FileFormData = z.infer<typeof fileSchema>;

// Type definitions for component state
interface UploadedFileInfo {
  name: string;
  size: number;
  type: string;
}

interface ColumnValidation {
  isValid: boolean;
  missingRequired: string[];
  foundRequired: string[];
  foundOptional: string[];
  invalidColumns: string[];
  totalRows: number;
  allHeaders: string[];
  error?: string;
}

interface FileData {
  headers: string[];
  data: Record<string, any>[];
  fullData: Record<string, any>[];
  rowCount: number;
}

const ImportInquiry: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFileInfo | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [columnValidation, setColumnValidation] = useState<ColumnValidation | null>(null);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<FileFormData>({
    resolver: zodResolver(fileSchema)
  });

  const watchedFile = watch("file");

  // Required and optional columns
  const requiredColumns: string[] = ['name', 'phone'];
  const optionalColumns: string[] = ['location', 'category', 'followup_date'];
  const allValidColumns: string[] = [...requiredColumns, ...optionalColumns];

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'csv':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="w-5 h-5 text-blue-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const normalizeColumnName = (columnName: string): string => {
    return columnName.toLowerCase().trim().replace(/\s+/g, '_');
  };

  const readFileContent = (file: File): Promise<FileData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const fileExtension = file.name.toLowerCase().split('.').pop();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const result = e.target?.result;
          if (!result) {
            reject(new Error('Failed to read file content'));
            return;
          }
          
          if (fileExtension === 'csv') {
            // Parse CSV
            Papa.parse(result as string, {
              header: true,
              skipEmptyLines: true,
              dynamicTyping: true,
              complete: (results) => {
                resolve({
                  headers: results.meta.fields || [],
                  data: results.data.slice(0, 100) as Record<string, any>[], // Limit preview to first 100 rows
                  fullData: results.data as Record<string, any>[],
                  rowCount: results.data.length
                });
              },
              error: (error: any) => {
                reject(new Error(`CSV parsing error: ${error.message}`));
              }
            });
          } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
            // Parse Excel
            const workbook = XLSX.read(result, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length === 0) {
              reject(new Error('Excel file is empty'));
              return;
            }

            const headers = jsonData[0].map((header: any) => String(header || '').trim());
            const dataRows = jsonData.slice(1).filter((row: any[]) => 
              row.some(cell => cell !== null && cell !== undefined && cell !== '')
            );

            // Convert array rows to objects for preview
            const dataObjects: Record<string, any>[] = dataRows.map((row: any[]) => {
              const obj: Record<string, any> = {};
              headers.forEach((header: string, index: number) => {
                obj[header] = row[index] || '';
              });
              return obj;
            });

            resolve({
              headers,
              data: dataObjects.slice(0, 100), // Limit preview to first 100 rows
              fullData: dataObjects,
              rowCount: dataObjects.length
            });
          }
        } catch (error) {
          reject(new Error(`File reading error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      if (fileExtension === 'csv') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const validateColumns = async (file: File): Promise<ColumnValidation | undefined> => {
    setIsValidating(true);
    setColumnValidation(null);
    
    try {
      const fileContent = await readFileContent(file);
      setFileData(fileContent);

      const fileHeaders = fileContent.headers.map(normalizeColumnName);
      const normalizedRequired = requiredColumns.map(normalizeColumnName);
      const normalizedOptional = optionalColumns.map(normalizeColumnName);
      const normalizedAllValid = allValidColumns.map(normalizeColumnName);

      // Check required columns
      const missingRequired = normalizedRequired.filter(col => !fileHeaders.includes(col));
      const foundRequired = normalizedRequired.filter(col => fileHeaders.includes(col));
      
      // Check optional columns
      const foundOptional = normalizedOptional.filter(col => fileHeaders.includes(col));
      
      // Check for invalid columns
      const invalidColumns = fileHeaders.filter(col => 
        col && !normalizedAllValid.includes(col)
      );

      const validation: ColumnValidation = {
        isValid: missingRequired.length === 0,
        missingRequired,
        foundRequired,
        foundOptional,
        invalidColumns,
        totalRows: fileContent.rowCount,
        allHeaders: fileContent.headers
      };

      setColumnValidation(validation);
      return validation;

    } catch (error) {
      const errorValidation: ColumnValidation = {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        missingRequired: requiredColumns,
        foundRequired: [],
        foundOptional: [],
        invalidColumns: [],
        totalRows: 0,
        allHeaders: []
      };
      setColumnValidation(errorValidation);
      return errorValidation;
    } finally {
      setIsValidating(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Automatically validate columns
      await validateColumns(file);
    }
  };

  const onSubmit = async (data: FileFormData): Promise<void> => {
    if (!columnValidation || !columnValidation.isValid) {
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const file = data.file[0];
      const formData = new FormData();
      formData.append('file', file);
      
      // Call the /import endpoint using axios
      const response = await api.post('/inquiries/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data) {
        setUploadSuccess(true);
        
        // Reset form after successful upload
        setTimeout(() => {
          reset();
          setUploadedFile(null);
          setUploadSuccess(false);
          setColumnValidation(null);
          setFileData(null);
          setShowPreview(false);
        }, 3000);
      }

    } catch (error: any) {
      console.error('Upload failed:', error);
      setColumnValidation(prev => prev ? {
        ...prev,
        error: error.response?.data?.message || error.message
      } : null);
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = (): void => {
    setValue("file", null as any);
    setUploadedFile(null);
    setUploadSuccess(false);
    setColumnValidation(null);
    setFileData(null);
    setShowPreview(false);
    // Reset the file input
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import Inquiries
        </CardTitle>
        <CardDescription>
          Upload a CSV, XLS, or XLSX file containing inquiries data. Here is <Button className='px-0' variant="link">sample file</Button>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-input">Select File</Label>
            <div className="flex flex-col gap-3">
              <Input
                id="file-input"
                type="file"
                accept=".csv,.xls,.xlsx"
                className={`bg-white cursor-pointer ${
                  errors.file ? 'border-red-500' : ''
                }`}
                {...register("file")}
                onChange={(e) => {
                  register("file").onChange(e);
                  handleFileChange(e);
                }}
              />
              
              {errors.file && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {errors.file.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* File Preview */}
          {uploadedFile && !uploadSuccess && (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(uploadedFile.name)}
                  <div>
                    <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(uploadedFile.size)} • {uploadedFile.type || 'Unknown type'}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFile}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Column Validation Results */}
          {isValidating && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600 animate-pulse" />
                <span className="text-blue-800 font-medium">Validating file columns...</span>
              </div>
            </div>
          )}

          {columnValidation && !isValidating && (
            <div className={`rounded-lg p-4 border ${
              columnValidation.isValid 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {columnValidation.isValid ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    columnValidation.isValid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {columnValidation.isValid ? 'File Valid' : 'Validation Issues'}
                  </h4>
                  
                  {columnValidation.error && (
                    <p className="text-red-700 text-sm mt-1">{columnValidation.error}</p>
                  )}

                  <div className="mt-2 space-y-2 text-sm">
                    {columnValidation.totalRows > 0 && (
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        <span>Found {columnValidation.totalRows} data rows</span>
                      </div>
                    )}

                    {columnValidation.foundRequired.length > 0 && (
                      <div>
                        <span className="text-green-700 font-medium">✓ Required columns found: </span>
                        <span className="text-green-700">{columnValidation.foundRequired.join(', ')}</span>
                      </div>
                    )}

                    {columnValidation.foundOptional.length > 0 && (
                      <div>
                        <span className="text-blue-700 font-medium">+ Optional columns found: </span>
                        <span className="text-blue-700">{columnValidation.foundOptional.join(', ')}</span>
                      </div>
                    )}

                    {columnValidation.missingRequired.length > 0 && (
                      <div>
                        <span className="text-red-700 font-medium">✗ Missing required columns: </span>
                        <span className="text-red-700">{columnValidation.missingRequired.join(', ')}</span>
                      </div>
                    )}

                    {columnValidation.invalidColumns.length > 0 && (
                      <div>
                        <span className="text-orange-700 font-medium">⚠ Unknown columns: </span>
                        <span className="text-orange-700">{columnValidation.invalidColumns.join(', ')}</span>
                      </div>
                    )}

                    {columnValidation.isValid && fileData && fileData.data.length > 0 && (
                      <div className="mt-3 pt-2 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPreview(!showPreview)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          {showPreview ? 'Hide' : 'Show'} Data Preview
                          {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Preview Table */}
          {showPreview && fileData && fileData.data.length > 0 && (
            <div className="border rounded-lg overflow-hidden bg-white">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Data Preview ({fileData.data.length} of {fileData.rowCount} rows shown)
                </h4>
              </div>
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-700 border-r">#</th>
                      {fileData.headers.map((header, index) => (
                        <th key={index} className="px-3 py-2 text-left font-medium text-gray-700 border-r last:border-r-0 min-w-24">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fileData.data.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2 text-gray-500 border-r font-mono text-xs">{rowIndex + 1}</td>
                        {fileData.headers.map((header, colIndex) => (
                          <td key={colIndex} className="px-3 py-2 border-r last:border-r-0">
                            <div className="max-w-32 truncate" title={String(row[header] || '')}>
                              {String(row[header] || '')}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {fileData.rowCount > 100 && (
                <div className="bg-gray-50 px-4 py-2 border-t text-xs text-gray-600">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Showing first 100 rows only. Full dataset ({fileData.rowCount} rows) will be uploaded.
                </div>
              )}
            </div>
          )}

          {/* Success Message */}
          {uploadSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Inquiries imported successfully!
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button 
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={
                isUploading || 
                isValidating || 
                !watchedFile || 
                watchedFile.length === 0 || 
                !columnValidation?.isValid
              }
              className="min-w-24"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportInquiry;