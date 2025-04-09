"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setUser } from "@/store/features/authSlice";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

interface Service {
  id?: string;
  category_id: string;
  subcategory_id: string;
  description: string;
  rate: number;
  currency: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [newService, setNewService] = useState<Service>({
    category_id: "",
    subcategory_id: "",
    description: "",
    rate: 0,
    currency: "USD",
  });

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fetchData = async () => {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (categoriesError) {
        toast.error("Error fetching categories");
        return;
      }
      setCategories(categoriesData || []);

      // Fetch subcategories
      const { data: subcategoriesData, error: subcategoriesError } =
        await supabase.from("subcategories").select("*").order("name");

      if (subcategoriesError) {
        toast.error("Error fetching subcategories");
        return;
      }
      setSubcategories(subcategoriesData || []);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("user")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        toast.error("Error fetching profile");
        return;
      }

      setName(profileData?.name || "");
      setEmail(profileData?.email || "");
      setBio(profileData?.bio || "");

      // Fetch user services
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select(
          `
          *,
          categories:category_id(name),
          subcategories:subcategory_id(name)
        `
        )
        .eq("user_id", user.id);

      if (servicesError) {
        toast.error("Error fetching services");
        return;
      }
      setServices(servicesData || []);
    };

    fetchData();
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // Update user profile only if fields are not empty
      const profileUpdates: { name?: string; email?: string; bio?: string } =
        {};
      if (name) profileUpdates.name = name;
      if (email) profileUpdates.email = email;
      if (bio) profileUpdates.bio = bio;

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from("user")
          .update(profileUpdates)
          .eq("id", user.id);

        if (profileError) throw profileError;

        // Update auth user only if email or name is provided
        if (email || name) {
          const { error: updateError } = await supabase.auth.updateUser({
            email: email || undefined,
            data: name ? { name } : undefined,
          });

          if (updateError) throw updateError;

          dispatch(
            setUser({
              ...user,
              ...(name && { name }),
              ...(email && { email }),
            })
          );
        }
      }

      toast.success("Profile updated successfully!");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveServices = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Update services
      for (const service of services) {
        if (service.id) {
          // Update existing service
          const { error: updateServiceError } = await supabase
            .from("services")
            .update({
              category_id: service.category_id,
              subcategory_id: service.subcategory_id,
              description: service.description,
              rate: service.rate,
              currency: service.currency,
            })
            .eq("id", service.id);

          if (updateServiceError) throw updateServiceError;
        } else {
          // Create new service
          const { error: createServiceError } = await supabase
            .from("services")
            .insert({
              user_id: user.id,
              category_id: service.category_id,
              subcategory_id: service.subcategory_id,
              description: service.description,
              rate: service.rate,
              currency: service.currency,
            });

          if (createServiceError) throw createServiceError;
        }
      }

      toast.success("Services updated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addService = () => {
    if (
      !newService.category_id ||
      !newService.subcategory_id ||
      !newService.description ||
      !newService.rate
    ) {
      toast.error("Please fill in all service fields");
      return;
    }
    setServices([...services, newService]);
    setNewService({
      category_id: "",
      subcategory_id: "",
      description: "",
      rate: 0,
      currency: "USD",
    });
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "";
  };

  const getSubcategoryName = (subcategoryId: string) => {
    return subcategories.find((s) => s.id === subcategoryId)?.name || "";
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Freelancer Profile
            </h3>
            <form onSubmit={handleSubmit} className="mt-5 space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Your name (optional)"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Your email (optional)"
                />
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Tell us about yourself and your experience... (optional)"
                />
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  Services Offered
                </h4>
                <div className="space-y-4">
                  {services.map((service, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {getCategoryName(service.category_id)} -{" "}
                            {getSubcategoryName(service.subcategory_id)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {service.description}
                          </p>
                          <p className="text-sm font-medium">
                            Rate: {service.currency} {service.rate}/hour
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Category
                        </label>
                        <select
                          value={newService.category_id}
                          onChange={(e) =>
                            setNewService({
                              ...newService,
                              category_id: e.target.value,
                              subcategory_id: "",
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Subcategory
                        </label>
                        <select
                          value={newService.subcategory_id}
                          onChange={(e) =>
                            setNewService({
                              ...newService,
                              subcategory_id: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          disabled={!newService.category_id}
                        >
                          <option value="">Select a subcategory</option>
                          {subcategories
                            .filter(
                              (s) => s.category_id === newService.category_id
                            )
                            .map((subcategory) => (
                              <option
                                key={subcategory.id}
                                value={subcategory.id}
                              >
                                {subcategory.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        value={newService.description}
                        onChange={(e) =>
                          setNewService({
                            ...newService,
                            description: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        rows={3}
                        placeholder="Describe your service..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Rate per hour
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <select
                            value={newService.currency}
                            onChange={(e) =>
                              setNewService({
                                ...newService,
                                currency: e.target.value,
                              })
                            }
                            className="rounded-l-md border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
                          >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                          </select>
                          <input
                            type="number"
                            value={newService.rate}
                            onChange={(e) =>
                              setNewService({
                                ...newService,
                                rate: parseFloat(e.target.value),
                              })
                            }
                            className="flex-1 rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addService}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add Service
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveServices}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? "Saving..." : "Save Services"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
