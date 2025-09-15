import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const getDataFromToken = (request: NextRequest): string => {
  try {
    const token = request.cookies.get("token")?.value || "";
    if (!token) {
      throw new Error("No token found");
    }
    const decodedToken: any = jwt.verify(token, process.env.TOKEN_SECRET! || "my lazy secret");
    return decodedToken.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
