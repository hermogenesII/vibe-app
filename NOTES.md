```
// src/app/user/profile/add/components/ServiceForm.tsx
"use client";
import Button from "@/components/Button";
import Label from "@/components/Label";
import Input from "@/components/Input";
import { fromFormData } from "@/lib/functions";
import { Service } from "@/types/service.interfaces";
import { ServiceCategory, ServiceSubcategory } from "@/types/service.category.interfaces";
import useAddServiceOffer from "@/hooks/user/useAddServiceOffer";

interface ServiceFormProps {
  categories: ServiceCategory[];
  subCategories: ServiceSubcategory[];
  selectedCategory: string;
  selectedSubcategory: string;
  onCategoryChange: (categoryId: string) => void;
  onSubcategoryChange: (subcategoryId: string) => void;
}

export default function ServiceForm({
  categories,
  subCategories,
  selectedCategory,
  selectedSubcategory,
  onCategoryChange,
  onSubcategoryChange,
}: ServiceFormProps) {
  const t = useTranslations();
  const add = useAddServiceOffer();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { category_id, subcategory_id, description, rate_per_hour } = fromFormData<Partial<Service>>(e);
    await add.addService({ category_id, subcategory_id, description, rate_per_hour });
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 p-4">
      <Label htmlFor="category_name">
        Categories:
        <select
          name="category_id"
          id="category_name"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="" disabled>Select</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </Label>

      <Label htmlFor="service_name">
        Sub Categories:
        <select
          name="subcategory_id"
          id="service_name"
          value={selectedSubcategory}
          onChange={(e) => onSubcategoryChange(e.target.value)}
          disabled={!selectedCategory}
        >
          <option value="" disabled>Select</option>
          {subCategories
            .filter((s) => s.category_id === selectedCategory)
            .map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
        </select>
      </Label>

      <Label htmlFor="description">
        Description:
        <textarea
          name="description"
          id="description"
          placeholder="Enter service description"
          required
        />
      </Label>

      <Label htmlFor="rate_per_hour">
        Rate per hour:
        <Input
          id="rate_per_hour"
          type="number"
          placeholder="Rate per hour"
          name="rate_per_hour"
          required
          min="0"
        />
      </Label>

      <Button type="submit" className="button">
        {t("profile.add-service-offer")}
      </Button>
    </form>
  );
}
```

```
// src/app/user/profile/add/hooks/useServiceData.ts
import { ServiceCategory, ServiceSubcategory } from "@/types/service.category.interfaces";
import { getServicesByCategory, getServicesBySubcategory } from "@/lib/supabase/supabase.services";
import { useState, useEffect } from "react";

export function useServiceData() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [subCategories, setSubCategories] = useState<ServiceSubcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [categoriesData, subCategoriesData] = await Promise.all([
          getServicesByCategory(),
          getServicesBySubcategory(),
        ]);
        
        setCategories(categoriesData || []);
        setSubCategories(subCategoriesData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch service data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { categories, subCategories, loading, error };
}
```


```
// src/app/user/profile/add/page.tsx
"use client";
import Header from "@/components/Header";
import { useServiceData } from "./hooks/useServiceData";
import ServiceForm from "./components/ServiceForm";
import { useState } from "react";

export default function AddServicePage() {
  const { categories, subCategories, loading, error } = useServiceData();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="add-service page">
      <Header>Add Service</Header>
      <ServiceForm
        categories={categories}
        subCategories={subCategories}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        onCategoryChange={(categoryId) => {
          setSelectedCategory(categoryId);
          setSelectedSubcategory(""); // Reset subcategory when category changes
        }}
        onSubcategoryChange={setSelectedSubcategory}
      />
    </div>
  );
}
```

```
useEffect(() => {
  async function fetchCategories() {
    const fetchedCategories = await getServicesByCategory();
    setCategories(fetchedCategories || []);
  }
  async function fetchSubCategories() {
    const fetchedSubCategories = await getServicesBySubcategory();
    setSubCategories(fetchedSubCategories || []);
  }
  fetchSubCategories();
  fetchCategories();
}, []);
```

```
`// src/lib/supabase/supabase.services.ts
export async function getServiceCategories() {
  const [categories, subCategories] = await Promise.all([
    getServicesByCategory(),
    getServicesBySubcategory()
  ]);
  
  return {
    categories: categories || [],
    subCategories: subCategories || []
  };
}
```

```
// src/hooks/services/useServiceCategories.ts
import { useState, useEffect } from 'react';
import { getServiceCategories } from '@/lib/supabase/supabase.services';
import { ServiceCategory, ServiceSubcategory } from '@/types/service.category.interfaces';

interface ServiceCategoriesState {
  categories: ServiceCategory[];
  subCategories: ServiceSubcategory[];
  loading: boolean;
  error: string | null;
}

export function useServiceCategories() {
  const [state, setState] = useState<ServiceCategoriesState>({
    categories: [],
    subCategories: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      try {
        const { categories, subCategories } = await getServiceCategories();
        
        if (!mounted) return;
        
        setState({
          categories,
          subCategories,
          loading: false,
          error: null
        });
      } catch (error) {
        if (!mounted) return;
        
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch categories'
        }));
      }
    };

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
```


```
// Only fetch subcategories when a category is selected
export function useServiceSubcategories(categoryId: string) {
  const [state, setState] = useState<{
    subCategories: ServiceSubcategory[];
    loading: boolean;
    error: string | null;
  }>({
    subCategories: [],
    loading: false,
    error: null
  });

  useEffect(() => {
    let mounted = true;

    const fetchSubcategories = async () => {
      if (!categoryId) {
        setState({ subCategories: [], loading: false, error: null });
        return;
      }

      setState(prev => ({ ...prev, loading: true }));

      try {
        const subCategories = await getServicesBySubcategory(categoryId);
        
        if (!mounted) return;
        
        setState({
          subCategories: subCategories || [],
          loading: false,
          error: null
        });
      } catch (error) {
        if (!mounted) return;
        
        setState({
          subCategories: [],
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch subcategories'
        });
      }
    };

    fetchSubcategories();

    return () => {
      mounted = false;
    };
  }, [categoryId]);

  return state;
}
```

```
export default function AddServicePage() {
  const { categories, loading: categoriesLoading, error: categoriesError } = useServiceCategories();
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const { 
    subCategories, 
    loading: subCategoriesLoading, 
    error: subCategoriesError 
  } = useServiceSubcategories(selectedCategory);

  if (categoriesLoading) return <LoadingSpinner />;
  if (categoriesError) return <ErrorMessage message={categoriesError} />;

  return (
    <div className="add-service page">
      <Header>Add Service</Header>
      <ServiceForm
        categories={categories}
        subCategories={subCategories}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        onCategoryChange={setSelectedCategory}
        onSubcategoryChange={setSelectedSubcategory}
        loading={subCategoriesLoading}
        error={subCategoriesError}
      />
    </div>
  );
}
```


```

```