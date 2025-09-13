export class ImportResultDto {
  success: boolean;
  message: string;
  statistics: {
    totalRows: number;
    processedRows: number;
    studentsCreated: number;
    studentsUpdated: number;
    classesCreated: number;
    classesReused: number;
    studentClassesCreated: number;
    studentClassesReused: number;
    gradesCreated: number;
    gradesUpdated: number;
    errors: number;
  };
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
}
