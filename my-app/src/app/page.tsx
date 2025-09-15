"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { UtensilsCrossed } from "lucide-react"; // Icon for the dish
import { useRouter } from "next/navigation";

interface ICategory {
  _id: string;
  name: string;
}

export default function Home() {
  const router = useRouter();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetches categories, ensuring no cached data is used.
  const fetchCategories = async () => {
    try {
      // Added { cache: "no-store" } to prevent Next.js from caching the API response
      const res = await fetch("/api/category", { cache: "no-store" });

      if (res.status === 401) {
        toast.error("Please log in to see your categories.");
        router.push("/login");
        return;
      }

      const payload = await res.json();
      if (payload.success) {
        setCategories(payload.data);
      } else {
        toast.error(payload.message || "Failed to fetch categories");
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
      toast.error("Error fetching categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handles new category submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return toast.error("Category name is required");

    try {
      const res = await fetch("/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory }),
      });

      const payload = await res.json();
      if (payload.success) {
        toast.success("Category created 🎉");
        setNewCategory("");
        fetchCategories(); // This will now fetch the fresh list
      } else {
        toast.error(payload.message || "Failed to create category");
      }
    } catch (err) {
      console.error("Error creating category", err);
      toast.error("Error creating category");
    }
  };
  
  // Handles user logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#ffeee7] via-[#fff4ef] to-[#ffeee7] text-[#4a2c1a] p-6 overflow-hidden">
      {/* === Background Elements === */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <motion.div
          className="absolute w-[500px] h-[500px] bg-[#E0AB8B]/40 rounded-full blur-[140px]"
          animate={{ x: ["-20%", "120%", "50%", "-20%"], y: ["-20%", "50%", "120%", "-20%"] }}
          transition={{ duration: 40, repeat: Infinity, repeatType: "mirror" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] bg-[#d08a65]/30 rounded-full blur-[130px]"
          animate={{ x: ["120%", "-30%", "60%", "120%"], y: ["50%", "120%", "-20%", "50%"] }}
          transition={{ duration: 50, repeat: Infinity, repeatType: "mirror" }}
        />
      </div>
      
      {/* === Content === */}
      <div className="relative max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-6">
           <motion.h1
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
             className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#E0AB8B] via-[#c97c54] to-[#a85f3c]"
           >
             My Categories
           </motion.h1>
           <button 
               onClick={handleLogout}
               className="px-4 py-2 rounded-md bg-transparent border border-[#c97c54] text-[#c97c54] text-sm font-semibold hover:bg-[#c97c54] hover:text-white transition-colors"
           >
               Logout
           </button>
         </header>

        {/* Add new category form */}
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 mb-6 bg-[#fff7f3]/80 p-3 rounded-xl shadow-md border border-[#E0AB8B]/40 backdrop-blur-md"
        >
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
            className="flex-1 px-3 py-2 rounded-md bg-[#fff2ea] border border-[#E0AB8B]/40 text-sm text-[#4a2c1a] placeholder-[#a88570] focus:outline-none focus:ring-2 focus:ring-[#E0AB8B]"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] text-sm font-semibold shadow-md hover:scale-105 transition-transform"
          >
            Add
          </button>
        </form>

        {/* Categories Grid or Skeleton Loader */}
        <AnimatePresence>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <motion.div
                  key={idx}
                  className="h-24 rounded-2xl bg-gradient-to-r from-[#f3d6c9] to-[#E0AB8B]/60 relative overflow-hidden"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {categories.map((cat, idx) => (
                <div key={cat._id} className="perspective-[1000px]">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    whileHover={{ scale: 1.05, rotateX: -8, rotateY: 8, boxShadow: "0px 15px 30px rgba(224,171,139,0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-br from-[#fff2ea] to-[#f6d4c4] p-5 rounded-2xl text-center font-semibold shadow-md cursor-pointer border border-[#E0AB8B]/60"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <Link href={`/category/${cat._id}`} className="flex flex-col items-center justify-center gap-2">
                      <UtensilsCrossed className="w-6 h-6 text-[#c97c54]" />
                      <span className="block text-lg tracking-wide text-[#5a3725]">
                        {cat.name}
                      </span>
                    </Link>
                  </motion.div>
                </div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
