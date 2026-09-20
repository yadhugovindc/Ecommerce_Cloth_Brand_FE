const COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-violet-100 text-violet-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded px-2 py-0.5 text-[11px] capitalize ${
        COLORS[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}