"use client";

import { FiUser, FiMail, FiMessageSquare, FiBriefcase } from "react-icons/fi";
import { FaLinkedinIn, FaGithub } from "react-icons/fa";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import emailjs from "@emailjs/browser";
import { FaXTwitter } from "react-icons/fa6";

interface EmailJSError extends Error {
  text?: string;
}

export default function ContactForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    const initEmailJS = async () => {
      try {
        const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
        const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
        const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;

        // Debug logging
        console.log("Environment Variables Status:", {
          hasPublicKey: !!publicKey,
          hasServiceId: !!serviceId,
          hasTemplateId: !!templateId,
        });

        if (!publicKey) {
          console.error("EmailJS public key is missing");
          return;
        }

        // Add a small delay to ensure environment variables are loaded
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Initialize with just the public key
        await emailjs.init(publicKey);

        setIsInitialized(true);
        console.log("EmailJS initialized successfully");
      } catch (error) {
        console.error("Failed to initialize EmailJS:", error);
      }
    };

    initEmailJS();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!isInitialized) {
      toast.error("Email service is still initializing. Please try again.");
      setIsLoading(false);
      return;
    }

    if (
      !process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ||
      !process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ||
      !process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
    ) {
      toast.error("Email service is not configured properly.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );

      if (result.text === "OK") {
        toast.success("Message sent successfully!");
        setFormData({ name: "", email: "", subject: "", message: "" });
      }
    } catch (error) {
      const emailJSError = error as EmailJSError;
      toast.error(
        emailJSError?.text || "Failed to send message. Please try again."
      );
      console.error("Error sending email:", {
        message: emailJSError?.text,
        details: emailJSError,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Toaster position="top-right" />
      <div className="space-y-4">
        <h1 className="font-bold text-4xl text-white md:text-5xl">
          Let&apos;s Work Together
        </h1>
        <p className="max-w-2xl text-zinc-400 leading-relaxed">
          Have a project in mind? Fill out the form below with some info about
          your project and I will get back to you as soon as I can.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 border-zinc-800/50 bg-zinc-900/50 p-6 border rounded-2xl"
      >
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-medium text-sm text-zinc-300">
              <FiUser className="w-4 h-4" /> Name
            </label>
            <div className="group relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="border-zinc-700/50 focus:border-indigo-500/50 bg-zinc-800/50 focus:bg-zinc-800/70 px-4 py-3 pl-12 rounded-xl w-full text-zinc-100 placeholder:text-zinc-500 transition-all duration-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/20"
                placeholder="John Doe"
              />
              <FiUser className="group-focus-within:text-indigo-400 top-1/2 left-4 absolute w-4 h-4 text-zinc-500 transition-colors -translate-y-1/2 duration-300" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-medium text-sm text-zinc-300">
              <FiMail className="w-4 h-4" /> Email
            </label>
            <div className="group relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="border-zinc-700/50 focus:border-indigo-500/50 bg-zinc-800/50 focus:bg-zinc-800/70 px-4 py-3 pl-12 rounded-xl w-full text-zinc-100 placeholder:text-zinc-500 transition-all duration-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/20"
                placeholder="john@example.com"
              />
              <FiMail className="group-focus-within:text-indigo-400 top-1/2 left-4 absolute w-4 h-4 text-zinc-500 transition-colors -translate-y-1/2 duration-300" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium text-sm text-zinc-300">
            <FiBriefcase className="w-4 h-4" /> Subject
          </label>
          <div className="group relative">
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="border-zinc-700/50 focus:border-indigo-500/50 bg-zinc-800/50 focus:bg-zinc-800/70 px-4 py-3 pl-12 rounded-xl w-full text-zinc-100 placeholder:text-zinc-500 transition-all duration-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/20"
              placeholder="Tell me about your project"
            />
            <FiBriefcase className="group-focus-within:text-indigo-400 top-1/2 left-4 absolute w-4 h-4 text-zinc-500 transition-colors -translate-y-1/2 duration-300" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium text-sm text-zinc-300">
            <FiMessageSquare className="w-4 h-4" /> Message
          </label>
          <div className="group relative">
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="border-zinc-700/50 focus:border-indigo-500/50 bg-zinc-800/50 focus:bg-zinc-800/70 px-4 py-3 pl-12 rounded-xl w-full text-zinc-100 placeholder:text-zinc-500 transition-all duration-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/20 resize-none"
              placeholder="Share the details of your project, timeline, and any specific requirements..."
            />
            <FiMessageSquare className="group-focus-within:text-indigo-400 top-4 left-4 absolute w-4 h-4 text-zinc-500 transition-colors duration-300" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !isInitialized}
          className={`w-full bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
            isLoading || !isInitialized ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (
            <span className="flex justify-center items-center gap-2">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sending...
            </span>
          ) : !isInitialized ? (
            "Initializing..."
          ) : (
            "Send Message"
          )}
        </button>

        <div className="flex sm:flex-row flex-col justify-between items-center gap-4 pt-4 text-sm text-zinc-500">
          <p className="font-medium">Made with 💜 by Yash</p>
          <div className="flex gap-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-800/50 md:hover:bg-zinc-800 p-2 rounded-full transition-all duration-300 md:hover:scale-110 active:scale-95"
            >
              <FaXTwitter className="w-4 md:w-5 h-4 md:h-5 text-zinc-400" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-800/50 md:hover:bg-zinc-800 p-2 rounded-full transition-all duration-300 md:hover:scale-110 active:scale-95"
            >
              <FaLinkedinIn className="w-4 md:w-5 h-4 md:h-5 text-zinc-400" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-800/50 md:hover:bg-zinc-800 p-2 rounded-full transition-all duration-300 md:hover:scale-110 active:scale-95"
            >
              <FaGithub className="w-4 md:w-5 h-4 md:h-5 text-zinc-400" />
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
