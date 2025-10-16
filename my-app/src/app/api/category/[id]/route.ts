// File: app/api/category/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb.connection";
import Category from "@/models/category.model";
import Recipe from "@/models/recipe.model";
import { getDataFromToken } from "@/helpers/jwt.helper";

// GET a single category by ID
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; // Correctly await the params
    await dbConnect();
    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// UPDATE a category by ID
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; // Correctly await the params
    const userId = await getDataFromToken(request);
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ success: false, message: "Name is required" }, { status: 400 });
    }

    await dbConnect();

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: id, userId }, // Use the awaited 'id'
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return NextResponse.json({ success: false, message: "Category not found or permission denied" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Category updated successfully", data: updatedCategory });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

// DELETE a category by ID
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; // Correctly await the params
    const userId = await getDataFromToken(request);
    await dbConnect();

    // Find and delete the category, ensuring it belongs to the user
    const deletedCategory = await Category.findOneAndDelete({ _id: id, userId }); // Use the awaited 'id'

    if (!deletedCategory) {
      return NextResponse.json({ success: false, message: "Category not found or permission denied" }, { status: 404 });
    }
    
    // Optional: Set the categoryId to null for all recipes within this category
    await Recipe.updateMany({ categoryId: id }, { $set: { categoryId: null } }); // Use the awaited 'id'

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}