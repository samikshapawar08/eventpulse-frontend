export default function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 text-gray-400">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-gray-800 font-[Poppins]">{title}</h3>
      <p className="text-sm text-gray-400 mt-1 max-w-xs">{subtitle}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}