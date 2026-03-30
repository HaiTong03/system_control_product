export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed right-5 top-5 z-50 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-xl transition-all ${
        toast.type === "error"
          ? "bg-gradient-to-r from-rose-600 to-rose-500"
          : "bg-gradient-to-r from-emerald-700 to-emerald-500"
      }`}
    >
      {toast.type === "error" ? "❌" : "✅"} {toast.message}
    </div>
  )
}
