const styles = {
  upcoming:    "bg-indigo-50 text-indigo-600",
  ongoing:     "bg-emerald-50 text-emerald-600",
  completed:   "bg-gray-100 text-gray-500",
  cancelled:   "bg-red-50 text-red-500",
  registered:  "bg-emerald-50 text-emerald-600",
  present:     "bg-emerald-50 text-emerald-600",
  absent:      "bg-orange-50 text-orange-500",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}