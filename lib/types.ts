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
  photoURL?: string;
  description?: string;
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
  attachments?: FileAttachment[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  classId: string;
  studentId: string;
  studentName: string;
  attachments: FileAttachment[];
  submittedAt: Date;
  status: 'submitted' | 'late' | 'graded';
  grade?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: Date;
}

export interface Post {
  id: string;
  classId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  type: 'announcement' | 'material' | 'assignment';
  attachments?: FileAttachment[];
  assignmentId?: string; // Reference to assignment if type is 'assignment'
  createdAt: Date;
  updatedAt: Date;
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  size: number; // in bytes
  type: string; // MIME type
  uploadedBy: string;
  uploadedAt: Date;
}

export interface ClassFile {
  id: string;
  classId: string;
  name: string;
  url: string;
  size: number; // in bytes
  type: string; // MIME type
  folderId?: string; // null/undefined means root directory
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: Date;
  // Optional references to where this file is used
  assignmentId?: string;
  postId?: string;
}

export interface ClassFolder {
  id: string;
  classId: string;
  name: string;
  parentId?: string; // null/undefined means root level
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
