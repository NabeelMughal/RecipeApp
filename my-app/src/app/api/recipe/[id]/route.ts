// File: src/app/api/recipe/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb.connection";
import Recipe from "@/models/recipe.model";
import { getDataFromToken } from "@/helpers/jwt.helper";
import cloudinary from "@/lib/cloudinary.config";

// Get a single recipe, ensuring it belongs to the user
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = await getDataFromToken(request);
    await dbConnect();

    const recipe = await Recipe.findOne({ _id: id, userId });

    if (!recipe) {
      return NextResponse.json(
        { success: false, message: "Recipe not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: recipe });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Delete a recipe, ensuring it belongs to the user
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = await getDataFromToken(request);
    await dbConnect();

    const deletedRecipe = await Recipe.findOneAndDelete({ _id: id, userId });

    if (!deletedRecipe) {
      return NextResponse.json(
        { success: false, message: "Recipe not found or access denied" },
        { status: 404 }
      );
    }

    // 🆕 Delete image from Cloudinary if it exists
    if (deletedRecipe.imagePublicId) {
      try {
        const res=await cloudinary.uploader.destroy(deletedRecipe.imagePublicId);
        console.log(res)
      } catch (cloudErr) {
        console.error("Cloudinary deletion failed:", cloudErr);
        // Do not fail the request, just log the error
      }
    }

    return NextResponse.json({ success: true, message: "Recipe deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}


/**
 * Handles PATCH requests to update a recipe (e.g., likes, ingredients, etc.).
 */

async function uploadToCloudinary(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "recipes" }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
      .end(buffer);
  });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await dbConnect();

    const contentType = request.headers.get("content-type") || "";

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return NextResponse.json(
        { success: false, message: "Recipe not found" },
        { status: 404 }
      );
    }

    // Handle form-data (for image updates)
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file") as File | null;

      if (file) {
        // delete old image if exists
        if (recipe.imagePublicId) {
          await cloudinary.uploader.destroy(recipe.imagePublicId);
        }

        // upload new image
        const uploadRes: any = await uploadToCloudinary(file);
        recipe.imageUrl = uploadRes.secure_url;
        recipe.imagePublicId = uploadRes.public_id;
      }
    } else {
      // JSON body (your existing super duper logic)
      const body = await request.json();

      switch (body.action) {
        case "like":
          recipe.likes = (recipe.likes || 0) + 1;
          break;
        case "add-ingredient":
          if (body.ingredient) {
            recipe.ingredients.push(body.ingredient);
          }
          break;
        case "add-step":
          if (body.step) {
            recipe.steps.push(body.step);
          }
          break;
        case "add-note":
          if (body.note) {
            recipe.notes.push({ text: body.note, createdAt: new Date() });
          }
          break;
        case undefined: // direct field updates (name, description, etc.)
          if (body.name !== undefined) recipe.name = body.name;
          if (body.description !== undefined) recipe.description = body.description;
          break;
        default:
          return NextResponse.json(
            { success: false, message: "Invalid action provided" },
            { status: 400 }
          );
      }
    }

    const updatedRecipe = await recipe.save();
    return NextResponse.json({ success: true, data: updatedRecipe });
  } catch (error: any) {
    console.error("PATCH recipe error:", error);
    return NextResponse.json(
      { success: false, message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}