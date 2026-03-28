"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaChevronRight } from "react-icons/fa";

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent?: boolean;
}

export const Breadcrumb = () => {
  const pathname = usePathname();

  // Don't show breadcrumb on homepage
  if (pathname === "/") return null;

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [];
    const pathSegments = pathname.split("/").filter(Boolean);

    // Always start with Home
    breadcrumbs.push({
      label: "Home",
      href: "/",
    });

    // Generate breadcrumbs based on path segments
    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Format the segment for display
      let label = segment;

      // Handle different route patterns
      if (segment === "stations") {
        label = "Stations";
      } else if (segment === "trains") {
        label = "Trains";
      } else if (segment.includes("-to-")) {
        // Handle route slugs like "bangkok-to-chiang-mai"
        const [from, to] = segment.split("-to-");
        label = `${formatStationName(decodeURIComponent(from))} to ${formatStationName(decodeURIComponent(to))}`;
      } else if (index > 0 && pathSegments[index - 1] === "stations") {
        // Handle station name slugs
        label = formatStationName(decodeURIComponent(segment));
      } else {
        // Default formatting
        label = formatStationName(decodeURIComponent(segment));
      }

      breadcrumbs.push({
        label,
        href: currentPath,
        isCurrent: index === pathSegments.length - 1,
      });
    });

    return breadcrumbs;
  };

  const formatStationName = (slug: string): string => {
    if (/^\d+$/.test(slug)) {
      return slug; // Return the number as-is
    }
    return slug
      .split(/[-%20]/) // Handle both hyphens and %20 spaces
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center space-x-2 py-3 text-sm">
          {breadcrumbs.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index === 0 ? (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <FaHome className="h-4 w-4 mr-1" />
                  {item.label}
                </Link>
              ) : (
                <>
                  <FaChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                  {item.isCurrent ? (
                    <span className="text-gray-900 font-medium">
                      <span className="hidden sm:inline">{item.label}</span>
                      <span className="sm:hidden">
                        {item.label.includes(" to ")
                          ? truncateText(item.label.split(" to ")[0], 15) +
                            "..."
                          : truncateText(item.label, 20)}
                      </span>
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <span className="hidden sm:inline">{item.label}</span>
                      <span className="sm:hidden">
                        {truncateText(item.label, 20)}
                      </span>
                    </Link>
                  )}
                </>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;
