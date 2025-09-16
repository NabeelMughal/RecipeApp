"use client";

import { useEffect, useState, useMemo } from "react";
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
  const gridCols = useMemo(() => "grid-cols-2 sm:grid-cols-3", []);

  useEffect(() => {
  if (!categoryNameFromQuery) {
    fetchCategoryName();
  }

  if (id) {
    fetchList();
  }
}, [id]);


async function fetchCategoryName() {
  try {
    const res = await fetch(`/api/category/${id}`);
    const payload = await res.json();
    if (!payload.success) throw new Error(payload.message || "Failed");
    setCategoryName(payload.data.name || "Unknown");
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
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="size-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>

        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] bg-clip-text text-transparent">
              Recipes
            </h1>
            <p className="text-xs text-[#7a5c49]">Category: {categoryName || "Loading..."}</p>
          </div>
          <button
            onClick={() => router.push(`/recipe/new?categoryId=${id}&name=${encodeURIComponent(categoryName || "")}`)}
            className="px-4 py-2 flex items-center justify-center gap-1 cursor-pointer rounded-md bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] shadow-md hover:scale-105 transition-transform sticky bottom-3 right-3 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="size-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>

             Add
          </button>
        </header>

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
              <div
                key={idx}
                className="bg-[#f6d4c4]/60 rounded-xl overflow-hidden shadow-md animate-pulse"
              >
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
