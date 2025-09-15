import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb.connection";
import User from "@/models/user.model";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 400 }
      );
    }

    const isMatch = await bcryptjs.compare(password, user.password!);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 400 }
      );
    }

    // Create token data
    const tokenData = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    // Create token
    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET! || "my lazy secret", {
      expiresIn: "1d",
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
