import mongoose, { Document, Schema } from "mongoose";

export interface INote {
  text: string;
  createdAt: Date;
}

export interface IRecipe extends Document {
  name: string;
  slug?: string;
  description?: string;
  ingredients: string[];
  steps: string[];
  notes: INote[];
  imageUrl: string;
  imagePublicId?: string;
  categoryId: mongoose.Types.ObjectId;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
  userId: mongoose.Schema.Types.ObjectId;
  gallery: { url: string; public_id: string }[];
}

const NoteSchema = new Schema<INote>({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const RecipeSchema = new Schema<IRecipe>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name for this recipe."],
      maxlength: [120, "Name cannot be more than 120 characters"],
      trim: true,
    },
    slug: { type: String, lowercase: true, trim: true },
    description: { type: String, maxlength: [2000, "Description too long"] },
    ingredients: { type: [String], default: [] },
    steps: { type: [String], default: [] },
    notes: { type: [NoteSchema], default: [] },
    imageUrl: {
      type: String,
      required: [true, "Please provide an image URL for this recipe."],
    },
    imagePublicId: { type: String },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required."],
    },
    likes: { type: Number, default: 0, min: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    gallery: [{ url: String, public_id: String }],
  },
  { timestamps: true }
);

RecipeSchema.index({ name: "text", description: "text" });

export default mongoose.models.Recipe ||
  mongoose.model<IRecipe>("Recipe", RecipeSchema);
