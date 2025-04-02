# Vibe - Social Media Application Documentation

## Table of Contents

1. [Project Setup](#project-setup)
2. [Project Structure](#project-structure)
3. [Authentication](#authentication)
4. [State Management](#state-management)
5. [Firebase Integration](#firebase-integration)
6. [Components](#components)
7. [Styling](#styling)
8. [Environment Variables](#environment-variables)

## Project Setup

### Initial Setup

```bash
# Create a new Next.js project with TypeScript, Tailwind CSS, and ESLint
npx create-next-app@latest vibe_app --typescript --tailwind --eslint

# Navigate to the project directory
cd vibe_app

# Install required dependencies
npm install @reduxjs/toolkit react-redux firebase @headlessui/react @heroicons/react react-hot-toast
```

### Dependencies Explanation

- **@reduxjs/toolkit**: Redux toolkit for state management
- **react-redux**: React bindings for Redux
- **firebase**: Firebase SDK for authentication, database, and storage
- **@headlessui/react**: Unstyled, accessible UI components
- **@heroicons/react**: SVG icons by Tailwind CSS team
- **react-hot-toast**: Toast notifications library

## Project Structure

```
vibe_app/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   └── firebase.ts
│   ├── providers/
│   │   └── ReduxProvider.tsx
│   └── store/
│       ├── features/
│       │   └── authSlice.ts
│       └── store.ts
├── public/
├── .env.local
└── package.json
```

## Authentication

### Firebase Configuration

The application uses Firebase Authentication for user management. The configuration is set up in `src/lib/firebase.ts`:

```typescript
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
```

### Authentication Features

1. **Login**: Email/password authentication
2. **Registration**: New user creation with email/password
3. **Protected Routes**: Authentication state management
4. **Logout**: User session termination

## State Management

### Redux Setup

The application uses Redux Toolkit for state management. The store is configured in `src/store/store.ts`:

```typescript
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Auth Slice

The authentication state is managed in `src/store/features/authSlice.ts`:

```typescript
interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: UserData | null;
  loading: boolean;
  error: string | null;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserData | null>) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    // ... other reducers
  },
});
```

## Components

### Login Page

The login page (`src/app/auth/login/page.tsx`) handles user authentication:

- Email/password input fields
- Form validation
- Error handling
- Redux state updates
- Navigation after successful login

### Register Page

The registration page (`src/app/auth/register/page.tsx`) handles new user creation:

- Name, email, and password input fields
- Form validation
- User profile creation
- Redux state updates
- Navigation after successful registration

### Home Page

The home page (`src/app/page.tsx`) is protected and only accessible to authenticated users:

- User information display
- Logout functionality
- Authentication state management
- Protected route handling

## Styling

The application uses Tailwind CSS for styling:

- Responsive design
- Modern UI components
- Consistent color scheme
- Accessible form elements
- Mobile-first approach

## Environment Variables

Create a `.env.local` file in the root directory with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Firebase:
   - Create a new Firebase project
   - Enable Email/Password authentication
   - Get your Firebase configuration
   - Add configuration to `.env.local`
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Best Practices

1. **Type Safety**: TypeScript is used throughout the project for type safety
2. **State Management**: Redux Toolkit for predictable state management
3. **Authentication**: Firebase Authentication for secure user management
4. **UI Components**: Headless UI for accessible components
5. **Styling**: Tailwind CSS for utility-first styling
6. **Error Handling**: Toast notifications for user feedback
7. **Code Organization**: Feature-based folder structure
8. **Environment Variables**: Secure configuration management

## Future Enhancements

1. Social authentication (Google, GitHub)
2. User profile management
3. Post creation and sharing
4. File upload functionality
5. Real-time updates
6. User interactions (likes, comments)
7. Search functionality
8. User settings and preferences
