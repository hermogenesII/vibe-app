import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export const supabaseAuth = {
  // Sign up with email and password
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  },

  // Update user profile
  updateProfile: async (updates: { name?: string }) => {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });
    return { data, error };
  },
};

// Database operations
export const supabaseDb = {
  // User operations
  createUser: async (user: { name: string; email: string }) => {
    const { data, error } = await supabase
      .from("users")
      .insert([user])
      .select();
    return { data, error };
  },

  getUser: async (userId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    return { data, error };
  },

  updateUser: async (
    userId: string,
    updates: {
      name?: string;
      email?: string;
    }
  ) => {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select();
    return { data, error };
  },

  // Blog operations
  createBlog: async (blog: {
    title: string;
    content: string;
    user_id: string;
  }) => {
    const { data, error } = await supabase
      .from("blogs")
      .insert([blog])
      .select();
    return { data, error };
  },

  getBlogs: async () => {
    const { data, error } = await supabase
      .from("blogs")
      .select(
        `
        *,
        users (
          id,
          name,
          email
        )
      `
      )
      .order("created_at", { ascending: false });
    return { data, error };
  },

  getUserBlogs: async (userId: string) => {
    const { data, error } = await supabase
      .from("blogs")
      .select(
        `
        *,
        users (
          id,
          name,
          email
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return { data, error };
  },

  updateBlog: async (
    blogId: string,
    updates: {
      title?: string;
      content?: string;
    }
  ) => {
    const { data, error } = await supabase
      .from("blogs")
      .update(updates)
      .eq("id", blogId)
      .select();
    return { data, error };
  },

  deleteBlog: async (blogId: string) => {
    const { error } = await supabase.from("blogs").delete().eq("id", blogId);
    return { error };
  },
};

// Storage operations
export const supabaseStorage = {
  // Upload file
  uploadFile: async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from("public")
      .upload(path, file);
    return { data, error };
  },

  // Get file URL
  getFileUrl: (path: string) => {
    const { data } = supabase.storage.from("public").getPublicUrl(path);
    return data.publicUrl;
  },

  // Delete file
  deleteFile: async (path: string) => {
    const { error } = await supabase.storage.from("public").remove([path]);
    return { error };
  },
};

// SQL for creating categories table
const createCategoriesTable = `
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS subcategories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(name, category_id)
);

CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Subcategories are viewable by everyone" ON subcategories
  FOR SELECT USING (true);

CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own services" ON services
  FOR ALL USING (auth.uid() = user_id);

-- Insert default categories and subcategories
INSERT INTO categories (name) VALUES
  ('Web Development'),
  ('Mobile Development'),
  ('Design & Creative'),
  ('Data Science'),
  ('DevOps & Cloud')
ON CONFLICT (name) DO NOTHING;

-- Insert subcategories
INSERT INTO subcategories (name, category_id) VALUES
  ('Frontend Development', (SELECT id FROM categories WHERE name = 'Web Development')),
  ('Backend Development', (SELECT id FROM categories WHERE name = 'Web Development')),
  ('Full Stack Development', (SELECT id FROM categories WHERE name = 'Web Development')),
  ('E-commerce Development', (SELECT id FROM categories WHERE name = 'Web Development')),
  ('CMS Development', (SELECT id FROM categories WHERE name = 'Web Development')),
  ('iOS Development', (SELECT id FROM categories WHERE name = 'Mobile Development')),
  ('Android Development', (SELECT id FROM categories WHERE name = 'Mobile Development')),
  ('Cross-platform Development', (SELECT id FROM categories WHERE name = 'Mobile Development')),
  ('Mobile UI/UX Design', (SELECT id FROM categories WHERE name = 'Mobile Development')),
  ('UI/UX Design', (SELECT id FROM categories WHERE name = 'Design & Creative')),
  ('Graphic Design', (SELECT id FROM categories WHERE name = 'Design & Creative')),
  ('Logo Design', (SELECT id FROM categories WHERE name = 'Design & Creative')),
  ('Brand Identity', (SELECT id FROM categories WHERE name = 'Design & Creative')),
  ('Illustration', (SELECT id FROM categories WHERE name = 'Design & Creative')),
  ('Machine Learning', (SELECT id FROM categories WHERE name = 'Data Science')),
  ('Data Analysis', (SELECT id FROM categories WHERE name = 'Data Science')),
  ('Data Visualization', (SELECT id FROM categories WHERE name = 'Data Science')),
  ('Natural Language Processing', (SELECT id FROM categories WHERE name = 'Data Science')),
  ('Cloud Architecture', (SELECT id FROM categories WHERE name = 'DevOps & Cloud')),
  ('DevOps Engineering', (SELECT id FROM categories WHERE name = 'DevOps & Cloud')),
  ('System Administration', (SELECT id FROM categories WHERE name = 'DevOps & Cloud')),
  ('CI/CD Pipeline', (SELECT id FROM categories WHERE name = 'DevOps & Cloud'))
ON CONFLICT (name, category_id) DO NOTHING;
`;
