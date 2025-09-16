"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Upload } from "lucide-react";

type Recipe = {
  _id: string;
  name: string;
  description?: string;
  imageUrl: string;
  ingredients?: string[];
  steps?: string[];
  notes?: { text: string; createdAt: string }[];
  likes: number;
  gallery?: string[];
};

const Skeleton = ({ className }: { className: string }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-[#E0AB8B]/40 via-[#FFEEE7] to-[#E0AB8B]/40 rounded-md ${className}`}
  />
);

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  const [note, setNote] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [step, setStep] = useState("");

  // edit states
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

  async function updateRecipe(data: any) {
    const res = await fetch(`/api/recipe/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const payload = await res.json();
    if (payload.success) setRecipe(payload.data);
  }

  async function deleteRecipe() {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    const res = await fetch(`/api/recipe/${id}`, {
      method: "DELETE",
    });
    const payload = await res.json();
    if (payload.success) {
      router.push("/");
    } else {
      alert(payload.message || "Failed to delete");
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // simple base64 example (you might replace with cloud upload)
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      await updateRecipe({ imageUrl: base64 });
    };
    reader.readAsDataURL(file);
  }

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#FFEEE7] via-white to-[#FFEEE7] text-[#5C3D2E]">
        <div className="w-full max-w-2xl space-y-6 p-6">
          <Skeleton className="w-32 h-10" />
          <Skeleton className="w-full h-72" />
          <Skeleton className="w-1/2 h-6" />
          <Skeleton className="w-full h-24" />
        </div>
      </div>
    );

  if (!recipe)
    return <p className="p-4 text-red-600">Recipe not found.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFEEE7] via-white to-[#FFEEE7] text-[#5C3D2E] p-6 overflow-y-scroll">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back + Delete */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 flex items-center justify-center gap-2 cursor-pointer rounded-md bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] shadow-md hover:scale-105 transition-transform flex items-center text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="size-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
             Back
          </button>
          <button
            onClick={deleteRecipe}
            className="px-4 py-2 rounded-md cursor-pointer bg-red-500 text-white hover:bg-red-600 transition"
            title="Delete Recipe"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>

          </button>
        </div>

        {/* Hero Image */}
        <motion.img
          src={recipe.imageUrl}
          alt={recipe.name}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full h-72 object-cover rounded-2xl shadow-lg border border-[#E0AB8B]/40"
        />

       

        {/* Title + Description */}
        <div className="space-y-2">
          <div className="flex justify-between items-center rounded-lg p-2 shadow-md bg-[#FFEEE7] overflow-hidden">
            {isEditingTitle ? (
              <input
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={() => {
                  setIsEditingTitle(false);
                  if (titleValue.trim()) updateRecipe({ name: titleValue });
                }}
                className="text-2xl font-semibold tracking-tight text-[#E0AB8B] bg-transparent border-b border-[#E0AB8B] focus:outline-none"
                autoFocus
              />
            ) : (
              <h1 className="text-2xl font-semibold tracking-tight text-[#E0AB8B]">
                {recipe.name}
              </h1>
            )}
            <button className="text-[#E0AB8B] cursor-pointer" onClick={() => setIsEditingTitle((p) => !p)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>

            </button>
          </div>

          <div className="flex justify-between items-center bg-[#FFEEE7] rounded-md mt-2 mb-3 relative shadow-md p-3 overflow-hidden">
            {isEditingDescription ? (
              <textarea
                value={descValue}
                onChange={(e) => setDescValue(e.target.value)}
                onBlur={() => {
                  setIsEditingDescription(false);
                  updateRecipe({ description: descValue });
                }}
                className="w-full p-2 bg-transparent border-b border-[#E0AB8B] focus:outline-none text-[#5C3D2E]"
                autoFocus
              />
            ) : (
              <p className="text-[#5C3D2E] leading-relaxed">
                {recipe.description}
              </p>
            )}
            <button
              onClick={() => setIsEditingDescription((p) => !p)}
              className="text-[#E0AB8B] cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>
          </div>
        </div>

        {/* Like */}
        <button
          onClick={() => updateRecipe({ action: "like" })}
          className="bg-[#E0AB8B] cursor-pointer text-white px-5 py-2 rounded-lg shadow hover:bg-[#c89273] transition"
        >
          ❤️ {recipe.likes}
        </button>

        {/* Ingredients */}
        <section className="bg-[#FFEEE7] p-5 rounded-xl shadow-md border border-[#E0AB8B]/40 overflow-x-hidden">
          <h2 className="text-2xl font-semibold mb-3 text-[#5C3D2E]">
            🥕 Ingredients
          </h2>
          <ul className="ingredients list-inside space-y-1 text-[#5C3D2E]">
            {(recipe.ingredients ?? []).map((i, idx) => (
              <li className="" key={idx}>{i}</li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <input
              className="flex-1 p-2 rounded-md bg-white border border-[#E0AB8B]/40 focus:ring-2 focus:ring-[#E0AB8B] outline-none"
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              placeholder="Add ingredient"
            />
            <button
              onClick={() => {
                if (ingredient.trim()) {
                  updateRecipe({ action: "add-ingredient", ingredient });
                  setIngredient("");
                }
              }}
              className="px-4 py-2 flex items-center justify-center gap-1 cursor-pointer rounded-md bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] shadow-md hover:scale-105 transition-transform  text-white"
            >
              Add
            </button>
          </div>
        </section>

        {/* Steps */}
        <section className="bg-[#FFEEE7] p-5 rounded-xl shadow-md border border-[#E0AB8B]/40">
          <h2 className="text-2xl font-semibold mb-3 text-[#5C3D2E]">
            📖 Steps
          </h2>
          <ol className="ingredients list-inside space-y-2 text-[#5C3D2E]">
            {(recipe.steps ?? []).map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ol>
          <div className="mt-3 flex gap-2">
            <input
              className="flex-1 p-2 rounded-md bg-white border border-[#E0AB8B]/40 focus:ring-2 focus:ring-[#E0AB8B] outline-none"
              value={step}
              onChange={(e) => setStep(e.target.value)}
              placeholder="Add step"
            />
            <button
              onClick={() => {
                if (step.trim()) {
                  updateRecipe({ action: "add-step", step });
                  setStep("");
                }
              }}
              className="px-4 py-2 flex items-center justify-center gap-1 cursor-pointer rounded-md bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] shadow-md hover:scale-105 transition-transform  text-white"
            >
              Add
            </button>
          </div>
        </section>

        {/* Notes */}
        <section className="bg-[#FFEEE7] p-5 rounded-xl shadow-md border border-[#E0AB8B]/40 overflow-x-hidden">
          <h2 className="text-2xl font-semibold mb-3 text-[#5C3D2E]">
            📝 Notes
          </h2>
          <ul className="space-y-2 text-[#5C3D2E]">
            {(recipe.notes ?? []).map((n, idx) => (
              <li key={idx} className="border-b border-[#E0AB8B]/30 pb-1">
                {n.text}{" "}
                <span className="text-xs text-[#E0AB8B]">
                  ({new Date(n.createdAt).toLocaleDateString()})
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <textarea
              className="flex-1 p-2 rounded-md bg-white border border-[#E0AB8B]/40 focus:ring-2 focus:ring-[#E0AB8B] outline-none"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add note"
            />
            <button
              onClick={() => {
                if (note.trim()) {
                  updateRecipe({ action: "add-note", note });
                  setNote("");
                }
              }}
              className="px-4 py-2 h-fit gap-1 cursor-pointer rounded-md bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] shadow-md hover:scale-105 transition-transform  text-white"
            >
              Add
            </button>
          </div>
        </section>
        <div className="">
            <button
              onClick={() => router.back()}
              className="px-4 py-3 w-full font-semibold text-lg flex items-center justify-center gap-2 cursor-pointer rounded-md bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] shadow-md hover:scale-105 transition-transform flex items-center text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="size-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Back
            </button>
          </div>
      </div>
    </div>
  );
}
