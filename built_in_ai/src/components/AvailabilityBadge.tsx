"use client";

type Props = {
  availability: "readily" | "after-download" | "no" | "unknown" | "checking";
};

export function AvailabilityBadge({ availability }: Props) {
  const config = {
    readily: { label: "利用可能", className: "bg-green-100 text-green-800 border-green-300" },
    "after-download": { label: "DL後利用可", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
    no: { label: "非対応", className: "bg-red-100 text-red-800 border-red-300" },
    unknown: { label: "不明", className: "bg-gray-100 text-gray-600 border-gray-300" },
    checking: { label: "確認中…", className: "bg-blue-100 text-blue-700 border-blue-300" },
  }[availability] ?? { label: availability, className: "bg-gray-100 text-gray-600 border-gray-300" };

  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded border ${config.className}`}>
      {config.label}
    </span>
  );
}
