"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setUser } from "@/store/features/authSlice";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Get the user's profile from the user table
        const getUserProfile = async () => {
          const { data: profileData, error } = await supabase
            .from("user")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();

          if (error) throw error;

          const userData = {
            id: session.user.id,
            email: session.user.email || null,
            name: profileData?.name || null,
            created_at: profileData?.created_at || new Date().toISOString(),
          };
          dispatch(setUser(userData));
        };

        getUserProfile();
      } else {
        dispatch(setUser(null));
        router.push("/auth/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Vibe</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className="text-gray-700 hover:text-gray-900"
              >
                Profile
              </Link>
              <span className="text-gray-700">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <p className="text-gray-500 text-xl">
              Welcome to Vibe! Start sharing your moments.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
