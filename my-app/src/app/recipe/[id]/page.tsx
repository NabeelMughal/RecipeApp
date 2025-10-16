"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trash2, Upload, X } from "lucide-react";

type Recipe = {
  _id: string;
  name: string;
  description?: string;
  imageUrl: string;
  ingredients?: string[];
  steps?: string[];
  notes?: { text: string; createdAt: string }[];
  likes: number;
  gallery?: { url: string; public_id: string }[];
};

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-[#E0AB8B]/40 via-[#FFEEE7] to-[#E0AB8B]/40 rounded-md ${className}`} />
);

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [note, setNote] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [step, setStep] = useState("");

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [descValue, setDescValue] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/recipe/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setRecipe(res.data);
          setTitleValue(res.data.name);
          setDescValue(res.data.description || "");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function updateRecipe(data: any, isFormData = false) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/recipe/${id}`, {
        method: "PATCH",
        headers: isFormData ? {} : { "Content-Type": "application/json" },
        body: isFormData ? data : JSON.stringify(data),
      });
      const payload = await res.json();
      if (payload.success) {
        setRecipe(payload.data);
      } else {
        throw new Error(payload.message || "Update failed");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during the update.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteRecipe() {
    if (!confirm("Are you sure you want to delete this recipe? This action cannot be undone.")) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/recipe/${id}`, { method: "DELETE" });
      const payload = await res.json();
      if (payload.success) {
        router.back();
      } else {
        alert(payload.message || "Failed to delete");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    await updateRecipe(formData, true);
    e.target.value = ''; // Reset file input
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("galleryFiles", files[i]);
    }
    await updateRecipe(formData, true);
    e.target.value = ''; // Reset file input
  }
console.log(recipe);
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#FFEEE7] via-white to-[#FFEEE7] text-[#5C3D2E]">
      <div className="w-full max-w-2xl space-y-6 p-6">
        <Skeleton className="w-32 h-10" />
        <Skeleton className="w-full h-72" />
        <Skeleton className="w-1/2 h-6" />
        <Skeleton className="w-full h-24" />
      </div>
    </div>
  );
  if (!recipe) return <p className="p-4 text-center text-red-600">Recipe not found or you do not have permission to view it.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFEEE7] via-white to-[#FFEEE7] text-[#5C3D2E] p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-8">

        <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="px-4 py-2 flex items-center justify-center gap-2 cursor-pointer rounded-md bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] shadow-md hover:scale-105 transition-transform text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
            Back
          </button>
          <button onClick={deleteRecipe} disabled={isSubmitting} className="p-2 rounded-md cursor-pointer bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50" title="Delete Recipe">
            <Trash2 size={20} />
          </button>
        </div>

        <div className="relative group">
          <motion.img src={recipe.imageUrl} alt={recipe.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="w-full h-72 object-cover rounded-2xl shadow-lg border border-[#E0AB8B]/40" />
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-2xl cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
            <Upload size={48} />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isSubmitting} />
          </label>
        </div>

        <section className="bg-[#FFEEE7] p-5 rounded-xl shadow-md border border-[#E0AB8B]/40">
          <h2 className="text-2xl font-semibold mb-3 text-[#5C3D2E]">🖼️ Gallery</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {(recipe.gallery ?? []).map((img) => (
              <div key={img.public_id} className="relative group aspect-square">
                <img src={img.url} alt="Gallery image" title="Click to set as main image" className="w-full h-full object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-[#c97c54]" onClick={() => updateRecipe({ action: 'set-main-image', image: img })} />
                <button disabled={isSubmitting} onClick={() => updateRecipe({ action: 'delete-gallery-image', image: img })} className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50" title="Delete image">
                  <X size={14} />
                </button>
              </div>
            ))}
            <label className="aspect-square flex items-center justify-center border-2 border-dashed border-[#E0AB8B] rounded-lg cursor-pointer hover:bg-white transition-colors" title="Upload gallery images">
              <Upload size={24} className="text-[#c97c54]" />
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={isSubmitting} />
            </label>
          </div>
        </section>

        {/* Title, Description, and Like button */}
        <div className="space-y-4">
          {/* Title Edit */}
          <div className="flex justify-between items-center rounded-lg p-2 shadow-md bg-[#FFEEE7]">
            {isEditingTitle ? (
              <input value={titleValue} onChange={(e) => setTitleValue(e.target.value)} onBlur={() => { setIsEditingTitle(false); if (titleValue.trim()) updateRecipe({ name: titleValue }); }} className="text-3xl font-bold text-[#5C3D2E] bg-transparent border-b-2 border-[#E0AB8B] focus:outline-none w-full" autoFocus />
            ) : (
              <h1 className="text-3xl font-bold text-[#5C3D2E]">{recipe.name}</h1>
            )}
            <button className="text-[#E0AB8B] cursor-pointer ml-4 flex-shrink-0" onClick={() => setIsEditingTitle((p) => !p)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
            </button>
          </div>
          {/* Description Edit */}
          <div className="flex justify-between items-start bg-[#FFEEE7] rounded-md shadow-md p-3">
            {isEditingDescription ? (
              <textarea value={descValue} onChange={(e) => setDescValue(e.target.value)} onBlur={() => { setIsEditingDescription(false); updateRecipe({ description: descValue }); }} className="w-full p-2 bg-transparent border-b-2 border-[#E0AB8B] focus:outline-none text-[#5C3D2E] min-h-[100px]" autoFocus />
            ) : (
              <p className="text-[#5C3D2E] leading-relaxed w-full">{recipe.description || "No description provided. Click the edit icon to add one!"}</p>
            )}
            <button onClick={() => setIsEditingDescription((p) => !p)} className="text-[#E0AB8B] cursor-pointer ml-4 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
            </button>
          </div>
          {/* Like Button */}
          <button onClick={() => updateRecipe({ action: "like" })} disabled={isSubmitting} className="bg-[#E0AB8B] cursor-pointer text-white px-5 py-2 rounded-lg shadow hover:bg-[#c89273] transition disabled:opacity-50">❤️ {recipe.likes}</button>
        </div>

        {/* Ingredients */}
        <section className="bg-[#FFEEE7] p-5 rounded-xl shadow-md border border-[#E0AB8B]/40">
          <h2 className="text-2xl font-semibold mb-3 text-[#5C3D2E]">🥕 Ingredients</h2>
          <ul className="list-inside space-y-2 text-[#5C3D2E]">
            {(recipe.ingredients ?? []).map((item, idx) => (
              <li key={idx} className="flex justify-between items-center group bg-white/50 p-2 rounded">
                <span>- {item}</span>
                <button disabled={isSubmitting} onClick={() => updateRecipe({ action: 'delete-ingredient', index: idx })} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"><Trash2 size={16} /></button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <input className="flex-1 p-2 rounded-md bg-white border border-[#E0AB8B]/40 focus:ring-2 focus:ring-[#E0AB8B] outline-none" value={ingredient} onChange={(e) => setIngredient(e.target.value)} placeholder="Add ingredient" />
            <button disabled={isSubmitting} onClick={() => { if (ingredient.trim()) { updateRecipe({ action: "add-ingredient", ingredient }); setIngredient(""); } }} className="px-4 py-2 rounded-md bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] shadow-md hover:scale-105 transition-transform text-white disabled:opacity-50">Add</button>
          </div>
        </section>

        {/* Steps */}
        <section className="bg-[#FFEEE7] p-5 rounded-xl shadow-md border border-[#E0AB8B]/40">
          <h2 className="text-2xl font-semibold mb-3 text-[#5C3D2E]">📖 Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-[#5C3D2E]">
            {(recipe.steps ?? []).map((item, idx) => (
              <li key={idx} className="flex justify-between items-center group bg-white/50 p-2 rounded ml-4">
                <span className="flex-1">{item}</span>
                <button disabled={isSubmitting} onClick={() => updateRecipe({ action: 'delete-step', index: idx })} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 ml-2"><Trash2 size={16} /></button>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex gap-2">
            <input className="flex-1 p-2 rounded-md bg-white border border-[#E0AB8B]/40 focus:ring-2 focus:ring-[#E0AB8B] outline-none" value={step} onChange={(e) => setStep(e.target.value)} placeholder="Add step" />
            <button disabled={isSubmitting} onClick={() => { if (step.trim()) { updateRecipe({ action: "add-step", step }); setStep(""); } }} className="px-4 py-2 rounded-md bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] shadow-md hover:scale-105 transition-transform text-white disabled:opacity-50">Add</button>
          </div>
        </section>

        {/* Notes */}
        <section className="bg-[#FFEEE7] p-5 rounded-xl shadow-md border border-[#E0AB8B]/40">
          <h2 className="text-2xl font-semibold mb-3 text-[#5C3D2E]">📝 Notes</h2>
          <ul className="space-y-3 text-[#5C3D2E]">
            {(recipe.notes ?? []).map((n, idx) => (
              <li key={idx} className="flex justify-between items-start group border-b border-[#E0AB8B]/30 pb-2 bg-white/50 p-2 rounded">
                <div className="flex-1">
                  {n.text}
                  <span className="block text-xs text-[#a88570] mt-1">({new Date(n.createdAt).toLocaleDateString()})</span>
                </div>
                <button disabled={isSubmitting} onClick={() => updateRecipe({ action: 'delete-note', index: idx })} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 ml-2"><Trash2 size={16} /></button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <textarea className="flex-1 p-2 rounded-md bg-white border border-[#E0AB8B]/40 focus:ring-2 focus:ring-[#E0AB8B] outline-none" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a new note" />
            <button disabled={isSubmitting} onClick={() => { if (note.trim()) { updateRecipe({ action: "add-note", note }); setNote(""); } }} className="px-4 py-2 h-fit rounded-md bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] shadow-md hover:scale-105 transition-transform text-white disabled:opacity-50">Add</button>
          </div>
        </section>

      </div>
    </div>
  );
}