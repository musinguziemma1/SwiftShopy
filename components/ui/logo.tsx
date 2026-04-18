"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  showSlogan?: boolean;
}

export const Logo = ({ className = "", showSlogan = false }: LogoProps) => {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <div className="relative h-10 w-48">
        <Image
          src="/logo.png"
          alt="SwiftShopy"
          fill
          className="object-contain object-left"
          priority
        />
      </div>
    </Link>
  );
};
