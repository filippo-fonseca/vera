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
