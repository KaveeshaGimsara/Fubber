import React from "react";

export function FubberLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" className="fill-sky-500" />
      {/* Modern geometric architectural 'F' mark */}
      <path
        d="M9 7H23C23.5523 7 24 7.44772 24 8V11C24 11.5523 23.5523 12 23 12H13.5V14.5H20C20.5523 14.5 21 14.9477 21 15.5V18C21 18.5523 20.5523 19 20 19H13.5V24C13.5 24.5523 13.0523 25 12.5 25H9.5C8.94772 25 8.5 24.5523 8.5 24V8C8.5 7.44772 8.94772 7 9.5 7H9Z"
        fill="white"
      />
      {/* Accent energy notch */}
      <circle cx="21" cy="9.5" r="1.5" className="fill-sky-200" />
    </svg>
  );
}

export function FubberWordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <FubberLogo className="w-6 h-6 shrink-0 shadow-sm" />
      <div className="flex items-center tracking-tight">
        <span className="font-extrabold text-base text-slate-900 dark:text-white">
          Fubber
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 ml-0.5 mt-1" />
      </div>
    </div>
  );
}

export function FubberAvatar({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div
      className={`rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-gradient-to-br from-sky-400 to-blue-600 p-[1.5px] shadow-sm ${className}`}
    >
      <div className="w-full h-full rounded-full bg-sky-500 flex items-center justify-center">
        <FubberLogo className="w-full h-full rounded-full" />
      </div>
    </div>
  );
}

export const FUBBER_AVATAR_DATA_URI =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%230ea5e9'/><path d='M9 7H23C23.55 7 24 7.45 24 8V11C24 11.55 23.55 12 23 12H13.5V14.5H20C20.55 14.5 21 14.95 21 15.5V18C21 18.55 20.55 19 20 19H13.5V24C13.5 24.55 13.05 25 12.5 25H9.5C8.95 25 8.5 24.55 8.5 24V8C8.5 7.45 8.95 7 9.5 7H9Z' fill='white'/><circle cx='21' cy='9.5' r='1.5' fill='%23bae6fd'/></svg>";

