# Advanced Search and Filtering

This document describes the advanced search and filtering capabilities added to the student management system.

## Features

### Advanced Search Bar Component

The `AdvancedSearchBar` component provides comprehensive filtering options for both students and grades:

#### Basic Search
- Text search across relevant fields (name, ID, class, notes)
- Real-time search with instant results

#### Advanced Filters
- **Grade Range**: Filter by minimum and maximum grade values
- **Subject/Class Filter**: Filter by specific subjects or classes
- **Boolean Filters**: 
  - Has Grades: Show only students with recorded grades
  - Enrolled: Show only students enrolled in classes
- **Sorting Options**: Sort by name, grade, date, or class (ascending/descending)

#### Quick Filter Buttons
- Grade ≥ 70: Students with grades 70 and above
- Grade ≥ 80: Students with grades 80 and above  
- Grade ≥ 90: Students with grades 90 and above
- Grade < 70: Students with grades below 70
- Has Grades: Students who have any recorded grades
- Enrolled: Students enrolled in any classes

## Usage

### Students Page
The Students page now includes advanced filtering to help you:
- Find students by name or ID number
- Filter students by grade performance
- Show only students enrolled in specific classes
- Sort students by various criteria

### Grades Page
The Grades page includes similar filtering capabilities:
- Search grades by student name, ID, class name, or notes
- Filter by grade ranges (e.g., grades above 70)
- Filter by specific subjects or classes
- Sort grades by different criteria

## API Integration

The advanced search integrates with the backend API through enhanced parameter support:

### Students API Parameters
```typescript
interface StudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  gradeMin?: number;
  gradeMax?: number;
  subject?: string;
  hasGrades?: boolean;
  hasClasses?: boolean;
  sortBy?: 'name' | 'grade' | 'date' | 'class';
  sortOrder?: 'asc' | 'desc';
}
```

### Grades API Parameters
```typescript
interface GradesParams {
  page?: number;
  limit?: number;
  search?: string;
  gradeMin?: number;
  gradeMax?: number;
  subject?: string;
  classId?: string;
  studentId?: string;
  sortBy?: 'name' | 'grade' | 'date' | 'class';
  sortOrder?: 'asc' | 'desc';
}
```

## Examples

### Finding High-Performing Students
1. Click the filter icon to expand advanced options
2. Set "Min Grade" to 80
3. Click "Grade ≥ 80" quick filter button
4. Results will show only students with grades 80 and above

### Finding Students in Specific Classes
1. Expand the advanced filters
2. Select a class from the "Class" dropdown
3. Click "Search" to filter results

### Finding Students Without Grades
1. Expand the advanced filters
2. Check the "Has Grades" checkbox to uncheck it
3. Click "Search" to find students without any recorded grades

## Technical Implementation

The advanced search system consists of:

1. **AdvancedSearchBar Component**: Reusable UI component with filtering options
2. **Enhanced API Services**: Updated to support filtering parameters
3. **Updated Hooks**: Enhanced to handle advanced filtering
4. **Page Integration**: Both Students and Grades pages use the advanced search

The system maintains backward compatibility with simple text search while providing powerful filtering capabilities for advanced use cases.
