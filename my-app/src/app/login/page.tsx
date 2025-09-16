"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"; // Import useRouter
import Link from "next/link"; // Import Link

export default function LoginPage() {
  const router = useRouter(); // Initialize router
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error("Please fill in all fields.");
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Welcome back!");
        router.push("/"); // Use router for navigation
        router.refresh(); // Refresh the page to update server components/layout state
      } else {
        toast.error(data.message || "Login failed.");
      }
    } catch (error) {
      toast.error("An error occurred.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ffeee7] via-[#fff4ef] to-[#ffeee7] p-6 text-[#4a2c1a] overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute w-[400px] h-[400px] bg-[#E0AB8B]/30 rounded-full blur-[120px] top-[-10%] left-[-10%]"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "mirror" }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] bg-[#d08a65]/20 rounded-full blur-[130px] bottom-[-15%] right-[-15%]"
          animate={{ scale: [1, 1.05, 1], rotate: [0, -10, 0] }}
          transition={{ duration: 25, repeat: Infinity, repeatType: "mirror" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-6 bg-[#fff7f3]/80 backdrop-blur-md rounded-2xl shadow-xl border border-[#E0AB8B]/40"
      >
        <div className="text-center">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#E0AB8B] via-[#c97c54] to-[#a85f3c]">
            Welcome Back
          </h1>
          <p className="text-[#7a5c49] mt-2">Sign in to continue to your recipes.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg bg-[#fff2ea] border border-[#E0AB8B]/40 text-[#4a2c1a] placeholder-[#a88570] focus:outline-none focus:ring-2 focus:ring-[#E0AB8B]"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg bg-[#fff2ea] border border-[#E0AB8B]/40 text-[#4a2c1a] placeholder-[#a88570] focus:outline-none focus:ring-2 focus:ring-[#E0AB8B]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 cursor-pointer rounded-lg bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] text-white font-semibold shadow-md hover:scale-105 transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <p className="text-center text-sm text-[#7a5c49]">
          Don not have an account?{" "}
          <Link href="/register" className="font-semibold text-[#c97c54] hover:underline">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}


