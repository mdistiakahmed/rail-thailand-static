"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const Topbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { name: "Train Schedule", href: "/trains" },
    { name: "Station schedule", href: "/stations" },
    { name: "City schedule", href: "/cities" },
    { name: "Blogs", href: "/blogs" },
    // { 
    //   name: "Live Tracking", 
    //   href: "https://ttsview.railway.co.th/v3/",
    //   external: true 
    // },
    { 
      name: "Book Ticket", 
      href: "https://dticket.railway.co.th/DTicketPublicWeb/home/Home",
      external: true 
    },
  ];

  return (
    <nav className="bg-white shadow-md w-full">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" prefetch={false} className="flex items-center">
              <span className="text-xl font-bold text-red-600">
                RailThailand
              </span>
              <span className="text-xs text-gray-500 ml-1">.com</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              link.external ? (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-3 py-2 text-sm font-medium ${
                    isActive(link.href) 
                      ? "text-red-600 border-b-2 border-red-600" 
                      : "text-gray-700 hover:text-red-600"
                  }`}
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  prefetch={false}
                  className={`px-3 py-2 text-sm font-medium ${
                    isActive(link.href) 
                      ? "text-red-600 border-b-2 border-red-600" 
                      : "text-gray-700 hover:text-red-600"
                  }`}
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-red-600 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              link.external ? (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-red-600"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  prefetch={false}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(link.href)
                      ? "text-red-600 bg-red-50"
                      : "text-gray-700 hover:bg-gray-100 hover:text-red-600"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Topbar;