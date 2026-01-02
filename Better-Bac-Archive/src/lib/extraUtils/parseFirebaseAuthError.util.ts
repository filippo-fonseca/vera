// firebaseErrorUtils.ts

interface FirebaseAuthError {
    code: string;
    message: string;
}

const errorMessages: { [key: string]: string } = {
    "auth/email-already-in-use":
        "This email address is already in use. Please try another one.",
    "auth/invalid-email":
        "The email address is not valid. Please enter a valid email address.",
    "auth/operation-not-allowed":
        "This operation is not allowed. Please contact support.",
    "auth/weak-password":
        "The password is too weak. Please enter a stronger password.",
    "auth/user-disabled":
        "This user has been disabled. Please contact support.",
    "auth/invalid-credential":
        "Wrong email & password combination. Please try again.",
    "auth/wrong-password": "The password is incorrect. Please try again.",
    "auth/network-request-failed":
        "Network error. Please check your connection and try again.",
    "auth/too-many-requests": "Too many requests. Please try again later.",
    "auth/requires-recent-login": "Please log in again to perform this action.",
    // Add other error codes and messages as needed
};

export const parseFirebaseAuthError = (error: FirebaseAuthError): string => {
    return (
        errorMessages[error.code] ||
        "An unknown error occurred. Please try again."
    );
};
