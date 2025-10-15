"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Upload } from "lucide-react";
import toast from "react-hot-toast";

function RecipeForm() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categoryName = searchParams.get("name");

  // Redirect if categoryId is missing
  useEffect(() => {
    if (!categoryId) {
        toast.error("Category not found. Redirecting...");
        window.location.href = "/";
    }
  }, [categoryId]);


 async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError("");
  if (!name.trim()) return setError("Please enter a recipe name");
  if (!imageFile) return setError("Please upload an image");
  if (!categoryId) return setError("Category ID is missing");

  setLoading(true);

  try {
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("categoryId", categoryId);
    formData.append("file", imageFile);

    const res = await fetch("/api/recipe", {
      method: "POST",
      body: formData,
    });

    let payload;
    try {
      payload = await res.json();
    } catch (e) {
      const text = await res.text();
      console.error("Non-JSON response:", text);
      throw new Error(text || "Server did not return valid JSON");
    }

    if (!payload.success) {
      throw new Error(payload.message || "Failed to create recipe");
    }

    toast.success("Recipe created successfully!");
    window.location.href = `/category/${categoryId}?name=${encodeURIComponent(categoryName || "")}`;

  } catch (err: any) {
    setError(err.message);
    toast.error(err.message || "An error occurred.");
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffeee7] via-[#fff4ef] to-[#ffeee7] p-6 text-[#4a2c1a]">
      <div className="max-w-lg mx-auto space-y-6">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 mb-4 cursor-pointer rounded-md bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] shadow-md hover:scale-105 transition-transform flex items-center text-white"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] bg-clip-text text-transparent">
          Create New Recipe
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-gradient-to-br from-[#fff7f3] to-[#f6d4c4] p-5 rounded-xl shadow-lg"
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Recipe name"
            className="w-full px-3 py-2 rounded-md bg-[#fff2ea] border border-[#E0AB8B]/40 text-sm text-[#4a2c1a] placeholder-[#a88570] focus:outline-none focus:ring-2 focus:ring-[#E0AB8B]"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={4}
            className="w-full px-3 py-2 rounded-md bg-[#fff2ea] border border-[#E0AB8B]/40 text-sm text-[#4a2c1a] placeholder-[#a88570] focus:outline-none focus:ring-2 focus:ring-[#E0AB8B]"
          />

          {/* Upload field */}
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#E0AB8B]/60 hover:border-[#E0AB8B] rounded-lg cursor-pointer bg-[#fff2ea]/70 hover:bg-[#fbe6da]/70 transition">
            <Upload className="w-8 h-8 text-[#c97c54] mb-2" />
            <span className="text-sm text-[#7a5c49]">
              {imageFile ? imageFile.name : "Click to upload image"}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-md cursor-pointer bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] text-white font-medium shadow-md hover:scale-105 transition-transform disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Recipe"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function NewRecipePage() {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
      <RecipeForm />
    </Suspense>
  );
}

