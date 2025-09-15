"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

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

  const gridCols = useMemo(() => "grid-cols-2 sm:grid-cols-3", []);

  useEffect(() => {
    if (!id) return;
    fetchList();
  }, [id]);

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
          className="p-3 rounded-full bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] shadow-md hover:scale-105 transition-transform flex items-center text-white"
        >
          ← Back
        </button>

        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] bg-clip-text text-transparent">
              Recipes
            </h1>
            <p className="text-xs text-[#7a5c49]">Category: {id}</p>
          </div>
          <button
            onClick={() => router.push(`/recipe/new?categoryId=${id}`)}
            className="p-3 rounded-full bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] shadow-md hover:scale-105 transition-transform sticky bottom-3 right-3 text-white"
          >
            + Add
          </button>
        </header>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes..."
            className="w-full p-3 rounded-lg border border-[#E0AB8B]/40 bg-[#fff7f3]/70 placeholder-[#a88570] focus:ring-2 focus:ring-[#E0AB8B] text-[#4a2c1a]"
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
