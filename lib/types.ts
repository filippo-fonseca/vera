export type UserRole = 'admin' | 'teacher' | 'student';

export interface School {
  id: string;
  name: string;
  logoUrl?: string;
  accentColor?: string;
  website?: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  schoolId: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee extends User {
  role: 'admin' | 'teacher';
  department?: string;
  title?: string;
}

export interface Student extends User {
  role: 'student';
  gradeLevel?: string;
  studentId?: string;
  guardianEmail?: string;
  guardianPhone?: string;
}

export interface PendingInvite {
  id: string;
  email: string;
  role: UserRole;
  schoolId: string;
  firstName: string;
  lastName: string;
  // Employee-specific fields
  department?: string;
  title?: string;
  // Student-specific fields
  gradeLevel?: string;
  studentId?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  invitedBy: string; // admin user ID
  createdAt: Date;
  status: 'pending' | 'accepted';
}

export interface Class {
  id: string;
  name: string;
  subject: string;
  description?: string;
  schoolId: string;
  teacherId: string;
  teacherName: string;
  section?: string;
  room?: string;
  color?: string;
  icon?: string;
  banner?: string;
  studentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  points?: number;
  type: 'assignment' | 'quiz' | 'exam' | 'project';
  attachments?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  classId: string;
  content: string;
  authorId: string;
  authorName: string;
  type: 'announcement' | 'material' | 'assignment';
  attachments?: string[];
  assignmentId?: string; // Reference to assignment if type is 'assignment'
  createdAt: Date;
  updatedAt: Date;
}
