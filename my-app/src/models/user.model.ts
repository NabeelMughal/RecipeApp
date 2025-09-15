import mongoose from "mongoose";
import { Schema, Document, models, Model } from "mongoose";

// Interface for the User document
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Password is not always selected
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email."],
      unique: true,
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password."],
      minlength: 6,
      select: false, // Do not return password by default
    },
  },
  { timestamps: true }
);

// Check if the model already exists before defining it
const User: Model<IUser> = models.User || mongoose.model<IUser>("chef", UserSchema);

export default User;
