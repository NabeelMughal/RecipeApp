"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"; // Import useRouter
import Link from "next/link"; // Import Link

export default function RegisterPage() {
  const router = useRouter(); // Initialize router
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return toast.error("Please fill in all fields.");
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Registration successful! Please log in.");
        router.push("/login"); // Use router for navigation
      } else {
        toast.error(data.message || "Registration failed.");
      }
    } catch (error) {
      toast.error("An error occurred.");
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
            Create Account
          </h1>
          <p className="text-[#7a5c49] mt-2">
            Start organizing your personal recipes today.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="w-full px-4 py-3 rounded-lg bg-[#fff2ea] border border-[#E0AB8B]/40 text-[#4a2c1a] placeholder-[#a88570] focus:outline-none focus:ring-2 focus:ring-[#E0AB8B]"
          />
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
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        <p className="text-center text-sm text-[#7a5c49]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#c97c54] hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}


