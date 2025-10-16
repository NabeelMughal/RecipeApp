"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

type RecipeBrief = {
  _id: string;
  name: string;
  imageUrl: string;
  categoryId: string;
  likes?: number;
  createdAt?: string;
};

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [recipes, setRecipes] = useState<RecipeBrief[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  
  const searchParams = useSearchParams();
  const categoryNameFromQuery = searchParams.get("name");
  const [categoryName, setCategoryName] = useState<string | null>(categoryNameFromQuery || null);
  
  // New state for editing and submitting
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const gridCols = useMemo(() => "grid-cols-2 sm:grid-cols-3", []);

  useEffect(() => {
    if (!categoryNameFromQuery) {
      fetchCategoryName();
    }
    if (id) {
      fetchList();
    }
  }, [id]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  async function fetchCategoryName() {
    try {
      const res = await fetch(`/api/category/${id}`);
      const payload = await res.json();
      if (!payload.success) throw new Error(payload.message || "Failed");
      const name = payload.data.name || "Unknown";
      setCategoryName(name);
      setEditedName(name); // Initialize editedName
    } catch (err) {
      setCategoryName("Unknown");
    }
  }

  async function fetchList() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/recipe?categoryId=${id}`);
      const payload = await res.json();
      if (!payload.success) throw new Error(payload.message || "Failed");
      setRecipes(payload.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load recipes");
    } finally {
      setLoading(false);
    }
  }

  // Handler to DELETE the category
  async function handleDeleteCategory() {
    if (!window.confirm(`Are you sure you want to delete the "${categoryName}" category? This cannot be undone.`)) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/category/${id}`, { method: 'DELETE' });
      const payload = await res.json();
      if (!payload.success) throw new Error(payload.message || "Failed to delete");
      router.back(); // Go back on successful deletion
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handler to UPDATE the category name
  async function handleUpdateCategory() {
    if (!editedName.trim() || editedName.trim() === categoryName) {
      setIsEditing(false);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/category/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editedName }),
      });
      const payload = await res.json();
      if (!payload.success) throw new Error(payload.message || "Failed to update");
      setCategoryName(payload.data.name);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredRecipes = recipes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffeee7] via-[#fff4ef] to-[#ffeee7] p-4 text-[#4a2c1a]">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 mb-6 flex items-center justify-center gap-2 cursor-pointer rounded-md bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] shadow-md hover:scale-105 transition-transform flex items-center text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>

        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] bg-clip-text text-transparent">
              Recipes
            </h1>
            {!isEditing ? (
              <p className="text-xs text-[#7a5c49]">Category: {categoryName || "Loading..."}</p>
            ) : (
              <input
                ref={inputRef}
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory()}
                className="w-full mt-1 px-2 py-1 text-sm rounded-md bg-[#fff2ea] border border-[#E0AB8B]/40 text-[#4a2c1a] focus:outline-none focus:ring-1 focus:ring-[#E0AB8B]"
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  title="Edit Category Name"
                  className="p-2 flex items-center justify-center cursor-pointer rounded-md bg-gradient-to-r from-blue-400 to-blue-600 shadow-md hover:scale-105 transition-transform text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </button>
                <button
                  onClick={handleDeleteCategory}
                  disabled={isSubmitting}
                  title="Delete Category"
                  className="p-2 flex items-center justify-center cursor-pointer rounded-md bg-gradient-to-r from-red-500 to-red-700 shadow-md hover:scale-105 transition-transform text-white disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134h-3.868c-1.123 0-2.033.954-2.033 2.134v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
                <button
                  onClick={() => router.push(`/recipe/new?categoryId=${id}&name=${encodeURIComponent(categoryName || "")}`)}
                  className="px-4 py-2 flex items-center justify-center gap-1 cursor-pointer rounded-md bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] shadow-md hover:scale-105 transition-transform text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add
                </button>
              </>
            ) : (
              <>
                <button onClick={handleUpdateCategory} disabled={isSubmitting} className="px-3 py-2 text-sm rounded-md bg-green-500 text-white shadow-md hover:scale-105 transition-transform disabled:opacity-50">Save</button>
                <button onClick={() => setIsEditing(false)} disabled={isSubmitting} className="px-3 py-2 text-sm rounded-md bg-gray-400 text-white shadow-md hover:scale-105 transition-transform disabled:opacity-50">Cancel</button>
              </>
            )}
          </div>
        </header>

        {error && <div className="mb-4 text-center text-sm text-red-600 bg-red-100 p-2 rounded-md">{error}</div>}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes..."
            className="w-full px-3 py-2 rounded-md bg-[#fff2ea] border border-[#E0AB8B]/40 text-sm text-[#4a2c1a] placeholder-[#a88570] focus:outline-none focus:ring-2 focus:ring-[#E0AB8B]"
          />
        </div>

        {/* Listing */}
        {loading ? (
          <div className={`grid gap-4 ${gridCols}`}>
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-[#f6d4c4]/60 rounded-xl overflow-hidden shadow-md animate-pulse">
                <div className="w-full h-40 bg-[#E0AB8B]/40"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-[#E0AB8B]/40 rounded w-3/4"></div>
                  <div className="h-3 bg-[#E0AB8B]/30 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#a88570]">
            No recipes yet — be the first to add one!
          </div>
        ) : (
          <div className={`grid gap-4 ${gridCols}`}>
            <AnimatePresence>
              {filteredRecipes.map((r, idx) => (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                  onClick={() => router.push(`/recipe/${r._id}`)}
                  className="cursor-pointer bg-gradient-to-br from-[#fff2ea] to-[#f6d4c4] rounded-xl overflow-hidden shadow-lg hover:shadow-[#E0AB8B]/50 hover:scale-105 transition-transform"
                >
                  <Image
                    width={160}
                    height={160}
                    src={r.imageUrl}
                    alt={r.name}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="text-lg font-semibold text-[#5a3725]">
                      {r.name}
                    </h3>
                    <p className="text-xs text-[#7a5c49]">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}