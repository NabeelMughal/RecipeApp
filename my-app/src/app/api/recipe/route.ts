import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb.connection";
import RecipeModel from "@/models/recipe.model";
import cloudinary from "@/lib/cloudinary.config";
import { getDataFromToken } from "@/helpers/jwt.helper";

export const config = {
  api: {
    bodyParser: false, // allow streaming FormData
  },
};

// Stream upload helper - No changes needed here
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

/**
 * GET recipes for the currently logged-in user.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getDataFromToken(req); // Securely get the user's ID
    await dbConnect();
    const url = new URL(req.url);
    const categoryId = url.searchParams.get("categoryId") || undefined;

    // Filter recipes by the logged-in user's ID
    const filter: any = { userId };
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    const recipes = await RecipeModel.find(filter)
      .select("name imageUrl categoryId likes createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: recipes }, { status: 200 });
  } catch (err: any) {
    // Handle potential errors, including unauthorized access
    return NextResponse.json(
        { success: false, message: err.message || "Failed to fetch recipes" },
        { status: err.message.includes("token") ? 401 : 500 }
    );
  }
}

/**
 * POST a new recipe for the currently logged-in user.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getDataFromToken(req); // Securely get the user's ID
    await dbConnect();
    const form = await req.formData();

    const name = form.get("name")?.toString().trim();
    const description = form.get("description")?.toString().trim(); // Added description
    const categoryId = form.get("categoryId")?.toString();
    const file = form.get("file") as File | null;

    if (!name || !categoryId || !file) {
      return NextResponse.json(
        { success: false, message: "Name, categoryId and file are required" },
        { status: 400 }
      );
    }

    // Your existing Cloudinary upload function
    const uploadRes: any = await uploadToCloudinary(file);

    // Create the recipe and associate it with the logged-in user
    const recipe = await RecipeModel.create({
      name,
      description,
      categoryId,
      userId, // This line fixes the error
      imageUrl: uploadRes.secure_url,
      imagePublicId: uploadRes.public_id, // Saving for potential deletion later
    });

    return NextResponse.json({ success: true, data: recipe }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/recipe error", err);
    return NextResponse.json(
      { success: false, message: "Failed to create recipe" },
      { status: 500 }
    );
  }
}

/**
 * PATCH functionality should be handled in the [id] route for specific recipes.
 * This keeps the API clean and follows REST conventions.
 */
export async function PATCH(req: NextRequest) {
  return NextResponse.json(
    { success: false, message: "This action is not supported. Use /api/recipe/[id] instead." },
    { status: 405 } // Method Not Allowed
  );
}


