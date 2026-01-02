# Vera - Setup Guide

Welcome to Vera! This is a modern Learning Management System built with Next.js, Firebase, and Tailwind CSS.

## Initial Setup

You've already configured your Firebase keys - great! Here's what you need to do to get started:

### 1. Firebase Configuration

Your Firebase configuration is already set up in `lib/firebase.ts`. Make sure you have:

- Firebase Authentication enabled with Email/Password sign-in
- Firestore Database created

### 2. Firestore Security Rules

Go to your Firebase Console and set up these security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Schools collection
    match /schools/{schoolId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null; // Allow authenticated users to create schools
      allow update, delete: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.schoolId == schoolId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null; // Allow authenticated users to create their own user doc
      allow update, delete: if request.auth != null &&
        (request.auth.uid == userId || // Users can update their own doc
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'); // Or admins can manage users
    }
  }
}
```

### 3. Run the Development Server

```bash
npm run dev
```

Visit http://localhost:3000 and you'll be taken to the setup page.

### 4. Complete the Setup Wizard

1. Visit http://localhost:3000 (automatically redirects to /setup)
2. Step 1: Enter your school information (name, email, phone, address, website)
3. Step 2: Create your admin account (name, email, password)
4. Click "Complete Setup"
5. You'll be automatically logged in and taken to the admin dashboard!

The setup wizard automatically:
- Creates your Firebase Auth account
- Creates your school document in Firestore
- Creates your admin user document in Firestore
- Logs you in and redirects to the dashboard

### 5. Start Using Vera

Once logged in, you can:
1. Navigate to "School Settings" to update your school's information
2. Use "Employees" to add teachers and other admins
3. Use "Students" to add student accounts
4. View statistics on the dashboard

## Features

### Admin Portal
- Dashboard with statistics
- School settings management (name, contact info, address)
- Employee management (add teachers and admins)
- Student management (add students with grade levels, guardian info)
- Dark/Light mode theme switching
- Clean, modern UI with pink-500 accent color

### Authentication
- Email/password authentication via Firebase
- Role-based access control (admin, teacher, student)
- Secure sign-in/sign-out

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Firebase (Auth + Firestore)
- **Fonts**: Inter

## Next Steps

This is the admin portal foundation. Future development could include:

- Teacher portal for class management
- Student portal for viewing grades and assignments
- Class and course management
- Assignment submission system
- Gradebook
- Calendar and scheduling
- Announcements
- Parent portal

Enjoy building the future of education with Vera!
