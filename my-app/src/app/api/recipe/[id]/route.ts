// File: src/app/api/recipe/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb.connection";
import Recipe from "@/models/recipe.model"; // Ensure this model has the 'gallery' field
import { getDataFromToken } from "@/helpers/jwt.helper";
import cloudinary from "@/lib/cloudinary.config";

// GET a single recipe
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const userId = await getDataFromToken(request);
    await dbConnect();
    const recipe = await Recipe.findOne({ _id: id, userId });
    if (!recipe) {
      return NextResponse.json({ success: false, message: "Recipe not found or access denied" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: recipe });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE a recipe and its associated images
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const userId = await getDataFromToken(request);
    await dbConnect();
    const deletedRecipe = await Recipe.findOneAndDelete({ _id: id, userId });

    if (!deletedRecipe) {
      return NextResponse.json({ success: false, message: "Recipe not found or access denied" }, { status: 404 });
    }
    
    // Delete main image from Cloudinary
    if (deletedRecipe.imagePublicId) {
      await cloudinary.uploader.destroy(deletedRecipe.imagePublicId);
    }
    
    // Delete all gallery images from Cloudinary
    if (deletedRecipe.gallery && deletedRecipe.gallery.length > 0) {
      const publicIds = deletedRecipe.gallery.map((img: any) => img.public_id);
      if (publicIds.length > 0) {
        await cloudinary.api.delete_resources(publicIds);
      }
    }

    return NextResponse.json({ success: true, message: "Recipe deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Helper for Cloudinary upload
async function uploadToCloudinary(file: File): Promise<any> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder: "recipes" }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    }).end(buffer);
  });
}

// PATCH a recipe with various actions
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await dbConnect();
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return NextResponse.json({ success: false, message: "Recipe not found" }, { status: 404 });
    }

    const contentType = request.headers.get("content-type") || "";

    // Handle image uploads (form-data)
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const mainImageFile = form.get("file") as File | null;
      const galleryFiles = form.getAll("galleryFiles") as File[];

      // Handle main image update
      if (mainImageFile) {
        if (recipe.imagePublicId) {
          await cloudinary.uploader.destroy(recipe.imagePublicId);
        }
        const uploadRes = await uploadToCloudinary(mainImageFile);
        recipe.imageUrl = uploadRes.secure_url;
        recipe.imagePublicId = uploadRes.public_id;
      }
      
      // Handle gallery image uploads
      if (galleryFiles.length > 0) {
        if (!recipe.gallery) recipe.gallery = [];
        for (const file of galleryFiles) {
          if (file.size > 0) {
            const uploadRes = await uploadToCloudinary(file);
            recipe.gallery.push({ url: uploadRes.secure_url, public_id: uploadRes.public_id });
          }
        }
      }

    } else { // Handle JSON data for other updates
      const body = await request.json();
      switch (body.action) {
        case "like":
          recipe.likes = (recipe.likes || 0) + 1;
          break;
        case "add-ingredient":
          if (body.ingredient) recipe.ingredients.push(body.ingredient);
          break;
        case "delete-ingredient":
          if (typeof body.index === 'number') recipe.ingredients.splice(body.index, 1);
          break;
        case "add-step":
          if (body.step) recipe.steps.push(body.step);
          break;
        case "delete-step":
          if (typeof body.index === 'number') recipe.steps.splice(body.index, 1);
          break;
        case "add-note":
          if (body.note) recipe.notes.push({ text: body.note, createdAt: new Date() });
          break;
        case "delete-note":
          if (typeof body.index === 'number') recipe.notes.splice(body.index, 1);
          break;
        case "set-main-image": {
            const { public_id } = body.image;
            const newMainImage = recipe.gallery.find((img: any) => img.public_id === public_id);
            if (!newMainImage) throw new Error("Image not found in gallery");

            const oldMainImage = { url: recipe.imageUrl, public_id: recipe.imagePublicId };
            recipe.imageUrl = newMainImage.url;
            recipe.imagePublicId = newMainImage.public_id;
            
            recipe.gallery = recipe.gallery.filter((img: any) => img.public_id !== public_id);
            if (oldMainImage.public_id) {
              recipe.gallery.push(oldMainImage);
            }
          break;
        }
        case "delete-gallery-image": {
          const { public_id } = body.image;
          await cloudinary.uploader.destroy(public_id);
          recipe.gallery = recipe.gallery.filter((img: any) => img.public_id !== public_id);
          break;
        }
        case undefined: // Direct field updates (name, description)
          if (body.name !== undefined) recipe.name = body.name;
          if (body.description !== undefined) recipe.description = body.description;
          break;
        default:
          return NextResponse.json({ success: false, message: "Invalid action provided" }, { status: 400 });
      }
    }

    const updatedRecipe = await recipe.save();
    return NextResponse.json({ success: true, data: updatedRecipe });
  } catch (error: any) {
    console.error("PATCH recipe error:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred" }, { status: 500 });
  }
}