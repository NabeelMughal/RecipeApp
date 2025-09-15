import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb.connection";
import Category from "@/models/category.model";
import { getDataFromToken } from "@/helpers/jwt.helper";

// Get all categories for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const userId = await getDataFromToken(request);
    await dbConnect();
    const categories = await Category.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 401 });
  }
}

// Create a new category for the logged-in user
export async function POST(request: NextRequest) {
  try {
    const userId = await getDataFromToken(request);
    const { name } = await request.json();
    await dbConnect();

    const newCategory = new Category({ name, userId });
    await newCategory.save();

    return NextResponse.json(
      { success: true, message: "Category created", data: newCategory },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
