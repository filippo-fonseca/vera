# Modal Components - Integration Guide

All 10 modal components have been extracted from the teacher class page and are ready for integration.

## Extracted Modals

1. **AddStudentsModal.tsx** - Add students to the class
2. **CreateAssignmentModal.tsx** - Create new assignments
3. **EditAssignmentModal.tsx** - Edit existing assignments
4. **CreatePostModal.tsx** - Create new posts/announcements
5. **EditPostModal.tsx** - Edit existing posts
6. **AssignmentDetailModal.tsx** - View assignment details with teacher actions
7. **EditClassModal.tsx** - Customize class settings (basic info & appearance)
8. **UploadFilesModal.tsx** - Upload files to class
9. **CreateFolderModal.tsx** - Create new folders for organization
10. **MoveFileModal.tsx** - Move files between folders

## Integration Example

Here's how to integrate these modals into your main page:

```tsx
import AddStudentsModal from "./components/modals/AddStudentsModal";
import CreateAssignmentModal from "./components/modals/CreateAssignmentModal";
import EditAssignmentModal from "./components/modals/EditAssignmentModal";
import CreatePostModal from "./components/modals/CreatePostModal";
import EditPostModal from "./components/modals/EditPostModal";
import AssignmentDetailModal from "./components/modals/AssignmentDetailModal";
import EditClassModal from "./components/modals/EditClassModal";
import UploadFilesModal from "./components/modals/UploadFilesModal";
import CreateFolderModal from "./components/modals/CreateFolderModal";
import MoveFileModal from "./components/modals/MoveFileModal";

// In your component JSX, replace the existing modal JSX with:

<AddStudentsModal
  isOpen={showAddStudentModal}
  onClose={() => setShowAddStudentModal(false)}
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  searchingStudents={searchingStudents}
  availableStudents={availableStudents}
  addingStudent={addingStudent}
  onAddStudent={handleAddStudent}
/>

<CreateAssignmentModal
  isOpen={showCreateAssignmentModal}
  onClose={() => setShowCreateAssignmentModal(false)}
  formData={assignmentForm}
  onFormChange={setAssignmentForm}
  files={assignmentFiles}
  onFilesChange={setAssignmentFiles}
  creating={creatingAssignment}
  onSubmit={handleCreateAssignment}
/>

<EditAssignmentModal
  isOpen={showEditAssignmentModal}
  onClose={() => setShowEditAssignmentModal(false)}
  formData={assignmentForm}
  onFormChange={setAssignmentForm}
  editing={!!editingAssignmentId}
  onSubmit={handleEditAssignment}
/>

<CreatePostModal
  isOpen={showCreatePostModal}
  onClose={() => setShowCreatePostModal(false)}
  formData={postForm}
  onFormChange={setPostForm}
  files={postFiles}
  onFilesChange={setPostFiles}
  creating={creatingPost}
  onSubmit={handleCreatePost}
/>

<EditPostModal
  isOpen={showEditPostModal}
  onClose={() => setShowEditPostModal(false)}
  formData={postForm}
  onFormChange={setPostForm}
  editing={!!editingPostId}
  onSubmit={handleEditPost}
/>

<AssignmentDetailModal
  isOpen={showAssignmentDetailModal}
  onClose={() => setShowAssignmentDetailModal(false)}
  assignment={selectedAssignment}
  onEdit={openEditAssignment}
  onDelete={handleDeleteAssignment}
  deleting={!!deletingAssignment}
/>

<EditClassModal
  isOpen={showEditClassModal}
  onClose={() => setShowEditClassModal(false)}
  formData={classForm}
  onFormChange={setClassForm}
  editing={editingClass}
  onSubmit={handleEditClass}
/>

<UploadFilesModal
  isOpen={showUploadFilesModal}
  onClose={() => setShowUploadFilesModal(false)}
  files={directUploadFiles}
  onFilesChange={setDirectUploadFiles}
  uploading={uploadingFiles}
  onUpload={handleDirectFileUpload}
/>

<CreateFolderModal
  isOpen={showCreateFolderModal}
  onClose={() => setShowCreateFolderModal(false)}
  folderName={newFolderName}
  onFolderNameChange={setNewFolderName}
  creating={creatingFolder}
  onSubmit={handleCreateFolder}
/>

<MoveFileModal
  isOpen={showMoveFileModal}
  onClose={() => setShowMoveFileModal(false)}
  file={fileToMove}
  folders={classFolders}
  files={classFiles}
  onMoveFile={handleMoveFile}
/>
```

## Key Features

- All modals use **Framer Motion** for smooth animations
- **TypeScript** interfaces for type safety
- Consistent **styling** with Tailwind CSS
- **Responsive** design
- **Loading states** and disabled states handled
- **Form validation** built-in where needed
- **AnimatePresence** for exit animations

## Dependencies

All modals require:
- `framer-motion`
- `lucide-react` (for icons)
- `@/components/common/Form` (TextField, Select, DatePicker, TextArea)
- `@/components/files/FileUpload` (for file uploads)
- `@/components/files/FileCard` (for AssignmentDetailModal)
- `@/lib/types` (for TypeScript types)
- `@/lib/classCustomization` (for EditClassModal)

## Next Steps

1. Import all modal components at the top of your page
2. Replace the existing modal JSX (lines ~1523-2852) with the new component calls
3. Test each modal to ensure proper functionality
4. Delete the old modal JSX from the main page file

All styling, animations, and functionality have been preserved exactly as they were in the original implementation.
