import { useEffect, useState } from "react"
import { getProductHistory } from "../api/productHistoryApi"
import Toast from "../components/Toast"
import DataTableWithColumnFilterDemo from "../components/DataTable"
import { useTheme } from "../contexts/ThemeContext"

export default function OldProductsPage() {
  const { isDark } = useTheme()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    getProductHistory()
      .then(setHistory)
      .catch(() => setToast({ message: "Failed to load old products", type: "error" }))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <Toast toast={toast} />
      <div className={`rounded-3xl border p-6 ${isDark ? "border-amber-400/20 bg-gradient-to-br from-[#24150d]/95 via-[#1a100a]/95 to-[#140c07]/95 shadow-[0_24px_70px_rgba(0,0,0,0.45)]" : "border-[#2f2218]/15 bg-gradient-to-br from-[#fff3e0]/95 via-[#fff8ef]/95 to-[#f5e6d1]/95 shadow-[0_24px_60px_rgba(74,47,20,0.18)]"}`}>
        <h1 className={`text-3xl font-bold ${isDark ? "text-amber-50" : "text-[#2f2015]"}`}>Old Products (History)</h1>
        <p className={`mt-1 text-sm ${isDark ? "text-amber-100/70" : "text-[#74553c]"}`}>{history.length} records</p>
      </div>
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-400 border-t-transparent" />
        </div>
      ) : history.length === 0 ? (
        <div className={`rounded-2xl border py-16 text-center shadow-[0_14px_40px_rgba(0,0,0,0.35)] ${isDark ? "border-amber-400/20 bg-[#1a100a]/90 text-amber-100/70" : "border-[#2f2218]/15 bg-[#fff8ee] text-[#74553c] shadow-[0_12px_35px_rgba(70,45,20,0.16)]"}`}>
          <div className="mb-3 text-5xl">📦</div>
          <p className="text-sm">No old products found</p>
        </div>
      ) : (
        
        <DataTableWithColumnFilterDemo />)}

    </div>
  )
}
