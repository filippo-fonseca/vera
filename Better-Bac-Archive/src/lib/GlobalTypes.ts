export interface IUser {
    id: string;
    displayName: string;
    email: string;
    isEducator: boolean;
    photoURL?: string;
    linkedSchoolId: string;
}

export interface ISchool {
    id: string;
    name: string;
    addressObj: {
        address?: string;
        addressTwo?: string;
        postalCode?: string;
        city?: string;
        stateProvince?: string;
        country?: string;
    };
    timezone: string;
    phone?: string;
    photoURL?: string;
    adminAccessUserIds: string[];
    schoolYearStartMonth: number;
    schoolYearEndMonth: number;
    domain: string;
}

export interface ICourse {
    id: string;
    iconNumber: number;
    name: string;
    description: string;
    linkedSchoolId: string;
    educatorId: string;
    studentIds: string[];
    examSessionYear: number;
    courseColor: string;
    isNov?: boolean;
    isHL?: boolean;
    isYearTwo?: boolean;
    IBGradeBoundaries: {
        1: number; // Minimum percentage for grade 1
        2: number; // Minimum percentage for grade 2
        3: number; // Minimum percentage for grade 3
        4: number; // Minimum percentage for grade 4
        5: number; // Minimum percentage for grade 5
        6: number; // Minimum percentage for grade 6
        7: number; // Minimum percentage for grade 7
    };
    isArchived?: boolean; //TODO: Implement archiving for courses
}

export interface IAssignment {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    totalMarks: number;
    requiresSubmission: boolean;
    linkedCourseId: string;
    isFormative?: boolean;
}

export interface IAssignmentInstance {
    id: string;
    linkedAssignmentId: string;
    linkedStudentId: string;
    marksObtained?: number;
    dateSubmitted?: Date;
    isSubmitted?: boolean;
}

export interface IYearBatch {
    id: string;
    name: string;
    linkedSchoolId: string;
    examSessionYear: number;
    isNov?: boolean;
    studentIds: string[];
}

export interface IInvitee {
    id: string;
    email: string;
    linkedSchoolId: string;
    isEducator?: boolean;
}

export enum Tabs {
    LIFE_OS = "LifeOS",
    CALENDAR = "Calendar",
    COURSES = "Courses",
    SETTINGS = "Settings",
    SCHOOL = "School",
    PEOPLE = "People",
    YEAR_BATCHES = "Year Batches",
    COURSES_ADMIN_VIEW = "Courses Admin",
    REPORTS = "Reports",
}

export enum ActiveCourseDashboardState {
    HOME = "Home",
    ASSIGNMENTS = "Assignments",
    GRADES = "Grades",
    FILE_REPO = "File Repo",
    CLASS_DIRECTORY = "Class Directory",
    GRADE_BOUNDARIES = "Grade Boundaries",
}

export enum AssignmentsTabState {
    CALENDAR_VIEW = "Calendar View",
    LIST_VIEW = "List View",
}

export enum GradesTabState {
    TREND = "Trend",
    GRADE_DENSITY = "Grade Density",
}

export const STANDARD_SCALE_UP_ANIMATION =
    "transition-transform transform hover:scale-[1.01]";
