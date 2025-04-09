# Vibe - Social Media Application Documentation

## Table of Contents

1. [Project Setup](#project-setup)
2. [Project Structure](#project-structure)
3. [Authentication](#authentication)
4. [State Management](#state-management)
5. [Firebase Integration](#firebase-integration)
6. [Supabase Integration](#supabase-integration)
7. [Components](#components)
8. [Styling](#styling)
9. [Environment Variables](#environment-variables)
10. [Deployment with PM2](#deployment-with-pm2)

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

## Supabase Integration

### Setup

1. Install Supabase client:

   ```bash
   npm install @supabase/supabase-js
   ```

2. Create a Supabase project at [https://supabase.com](https://supabase.com)

3. Get your project URL and anon key from the project settings

4. Add Supabase configuration to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Supabase Client

The application uses Supabase for:

- Authentication
- Database operations
- File storage

Configuration is in `src/lib/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Authentication

Supabase provides authentication methods through `supabaseAuth`:

```typescript
export const supabaseAuth = {
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },
  // ... other auth methods
};
```

### Database Operations

Database operations are handled through `supabaseDb`:

```typescript
export const supabaseDb = {
  createPost: async (post: {
    title: string;
    content: string;
    userId: string;
    imageUrl?: string;
  }) => {
    const { data, error } = await supabase
      .from("posts")
      .insert([post])
      .select();
    return { data, error };
  },
  // ... other database methods
};
```

### Storage Operations

File storage is managed through `supabaseStorage`:

```typescript
export const supabaseStorage = {
  uploadFile: async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from("public")
      .upload(path, file);
    return { data, error };
  },
  // ... other storage methods
};
```

### Database Schema

Create the following tables in your Supabase project:

1. **posts** table:

   ```sql
   create table posts (
     id uuid default uuid_generate_v4() primary key,
     title text not null,
     content text not null,
     user_id uuid references auth.users not null,
     image_url text,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null
   );
   ```

2. **profiles** table:
   ```sql
   create table profiles (
     id uuid references auth.users on delete cascade not null primary key,
     display_name text,
     avatar_url text,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null
   );
   ```

### Row Level Security (RLS)

Enable RLS and create policies:

1. For posts table:

   ```sql
   -- Enable RLS
   alter table posts enable row level security;

   -- Allow users to read all posts
   create policy "Allow public read access" on posts
     for select using (true);

   -- Allow users to create their own posts
   create policy "Allow users to create posts" on posts
     for insert with check (auth.uid() = user_id);

   -- Allow users to update their own posts
   create policy "Allow users to update own posts" on posts
     for update using (auth.uid() = user_id);

   -- Allow users to delete their own posts
   create policy "Allow users to delete own posts" on posts
     for delete using (auth.uid() = user_id);
   ```

2. For profiles table:

   ```sql
   -- Enable RLS
   alter table profiles enable row level security;

   -- Allow users to read all profiles
   create policy "Allow public read access" on profiles
     for select using (true);

   -- Allow users to update their own profile
   create policy "Allow users to update own profile" on profiles
     for update using (auth.uid() = id);
   ```

### Storage Bucket Setup

1. Create a public bucket in Supabase Storage
2. Set up storage policies:

   ```sql
   -- Allow public read access
   create policy "Allow public read access" on storage.objects
     for select using (bucket_id = 'public');

   -- Allow authenticated users to upload files
   create policy "Allow authenticated uploads" on storage.objects
     for insert with check (
       bucket_id = 'public' and
       auth.role() = 'authenticated'
     );

   -- Allow users to delete their own files
   create policy "Allow users to delete own files" on storage.objects
     for delete using (
       bucket_id = 'public' and
       auth.uid() = owner
     );
   ```

### Usage Example

```typescript
// Authentication
const { data, error } = await supabaseAuth.signIn(email, password);

// Create a post
const { data, error } = await supabaseDb.createPost({
  title: "My Post",
  content: "Post content",
  userId: user.id,
});

// Upload a file
const { data, error } = await supabaseStorage.uploadFile(
  file,
  `posts/${user.id}/${file.name}`
);
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

## Deployment with PM2

### Prerequisites

- Node.js installed
- PM2 installed globally (`npm install -g pm2`)
- Built Next.js application

### Production Build

1. Build the Next.js application:
   ```bash
   npm run build
   ```

### PM2 Configuration

The application uses PM2 for process management. Configuration is in `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "vibe-app",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
```

### PM2 Commands

1. Start the application:

   ```bash
   pm2 start ecosystem.config.js
   ```

2. Monitor the application:

   ```bash
   pm2 monit
   ```

3. View logs:

   ```bash
   pm2 logs vibe-app
   ```

4. Stop the application:

   ```bash
   pm2 stop vibe-app
   ```

5. Restart the application:

   ```bash
   pm2 restart vibe-app
   ```

6. Delete the application from PM2:
   ```bash
   pm2 delete vibe-app
   ```

### PM2 Features

- **Cluster Mode**: Utilizes all available CPU cores
- **Auto-restart**: Automatically restarts on crashes
- **Memory Limit**: Restarts if memory exceeds 1GB
- **Log Management**: Built-in log management
- **Process Monitoring**: Real-time monitoring capabilities

### Production Best Practices

1. Always run in production mode
2. Use environment variables for sensitive data
3. Monitor application performance
4. Set up proper logging
5. Configure automatic restarts
6. Use cluster mode for better performance
