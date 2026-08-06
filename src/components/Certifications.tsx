"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiExternalLink } from "react-icons/fi";
import { SiGoogle, SiAmazon, SiCisco, SiUdemy } from "react-icons/si";
import { FaChalkboardTeacher, FaMicrosoft } from "react-icons/fa";
import { HiAcademicCap } from "react-icons/hi";
import { BiBrain } from "react-icons/bi";
import { MdDesignServices } from "react-icons/md";

const certifications = [
  {
    title: "30 days of Google Cloud Program 2021",
    issuer: "Google for Developers",
    issueDate: "Nov 2021",
    credentialId: "42c905e4-ef05-4e66-b443-cde1f4d644d0",
    icon: <SiGoogle className="w-5 md:w-6 h-5 md:h-6" />,
    iconColor: "text-blue-400",
  },
  {
    title: "AWS Academy Graduate - AWS Academy Cloud Foundations",
    issuer: "Amazon Web Services (AWS)",
    issueDate: "Nov 2021",
    icon: <SiAmazon className="w-5 md:w-6 h-5 md:h-6" />,
    iconColor: "text-orange-400",
  },
  {
    title: "AWS Cloud Masterclass - Cloud Practitioner Essentials",
    issuer: "nasscom",
    issueDate: "Oct 2021",
    credentialId: "FSP/2021/10/993881",
    icon: <HiAcademicCap className="w-5 md:w-6 h-5 md:h-6" />,
    iconColor: "text-purple-400",
  },
  {
    title: "Graphic Designing Team Leader",
    issuer: "Skillarena",
    issueDate: "Jun 2021",
    credentialId: "SAGD001",
    icon: <MdDesignServices className="w-5 md:w-6 h-5 md:h-6" />,
    iconColor: "text-pink-400",
  },
  {
    title: "Introduction to Cybersecurity",
    issuer: "Cisco",
    issueDate: "Mar 2021",
    icon: <SiCisco className="w-5 md:w-6 h-5 md:h-6" />,
    iconColor: "text-blue-500",
  },
  {
    title: "Introduction to Packet Tracer",
    issuer: "Cisco",
    issueDate: "Mar 2021",
    icon: <SiCisco className="w-5 md:w-6 h-5 md:h-6" />,
    iconColor: "text-blue-500",
  },
  {
    title: "Microsoft Certified: Azure AI Fundamentals",
    issuer: "Microsoft",
    issueDate: "Mar 2021",
    icon: <FaMicrosoft className="w-5 md:w-6 h-5 md:h-6" />,
    iconColor: "text-blue-400",
  },
  {
    title: "Microsoft Certified: Azure Fundamentals",
    issuer: "Microsoft",
    issueDate: "Mar 2021",
    icon: <FaMicrosoft className="w-5 md:w-6 h-5 md:h-6" />,
    iconColor: "text-blue-400",
  },
  {
    title: "Deep Learning: Convolutional Neural Networks in Python",
    issuer: "Udemy",
    issueDate: "Oct 2020",
    icon: <BiBrain className="w-5 md:w-6 h-5 md:h-6" />,
    iconColor: "text-purple-500",
  },
  {
    title: "Introduction to Data Science",
    issuer: "Cognitive Class",
    issueDate: "Oct 2020",
    icon: <FaChalkboardTeacher className="w-5 md:w-6 h-5 md:h-6" />,
    iconColor: "text-green-400",
  },
  {
    title: "Adobe Photoshop CC – Essentials Training",
    issuer: "Udemy",
    issueDate: "Jun 2020",
    icon: <SiUdemy className="w-5 md:w-6 h-5 md:h-6" />,
    iconColor: "text-red-400",
  },
];

export default function Certifications() {
  return (
    <motion.div
      className="space-y-6 md:space-y-8 px-4 md:px-0 pt-16 md:pt-32"
      initial="initial"
      animate="animate"
      variants={{
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      <motion.h2
        className="font-bold text-4xl md:text-7xl leading-none"
        variants={{
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
        }}
      >
        <span className="text-white">LICENSES &</span>{" "}
        <span className="text-gray-600">CERTIFICATIONS</span>
      </motion.h2>

      <motion.div
        className="gap-3 md:gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        variants={{
          initial: { opacity: 0 },
          animate: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {certifications.map((cert) => (
          <motion.div
            key={cert.title}
            className="relative flex flex-col gap-3 border-white/5 md:hover:border-white/20 bg-black/20 backdrop-blur-xs p-3 md:p-4 border rounded-2xl transition-colors overflow-hidden active:scale-[0.99] group"
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex items-center justify-center bg-white/5 rounded-lg w-8 h-8 md:w-10 md:h-10 shrink-0 ${cert.iconColor}`}
              >
                {cert.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="md:group-hover:text-blue-400 line-clamp-2 font-semibold text-sm text-white md:text-base transition-colors">
                  {cert.title}
                </h3>
                <p className="text-[10px] text-gray-400 md:text-xs truncate">
                  {cert.issuer}
                </p>
                <p className="text-[10px] text-gray-500 md:text-xs">
                  Issued {cert.issueDate}
                </p>
                {cert.credentialId && (
                  <p className="text-[10px] text-gray-600 md:text-xs truncate">
                    ID: {cert.credentialId}
                  </p>
                )}
              </div>
              <FiExternalLink className="md:group-hover:text-blue-400 mt-1 w-3 md:w-4 h-3 md:h-4 text-gray-500 transition-colors shrink-0" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
