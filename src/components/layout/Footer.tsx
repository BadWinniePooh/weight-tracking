"use client";

import { useThemeColor } from "@/hooks/useThemeColor";

export function Footer() {
  const backgroundMuted = useThemeColor("Main", "Secondary");
  const border = useThemeColor("Border", "Secondary");
  const secondaryText = useThemeColor("Text", "Secondary");
  return (
    <footer className={`${backgroundMuted} ${border} border-t`}>
      <div
        className={`container mx-auto p-4 text-center text-sm ${secondaryText}`}
      >
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>&copy; {new Date().getFullYear()} ScaleTrack v0.3.1</div>
          <div className="mt-2 md:mt-0">
            Track your progress, achieve your goals
          </div>
        </div>
      </div>
    </footer>
  );
}
