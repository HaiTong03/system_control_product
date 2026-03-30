
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../contexts/ThemeContext";

const getStatusColor = (status, isDark) => {
  const palette = {
    paid: isDark ? "bg-orange-500/20 text-orange-300" : "bg-orange-100 text-orange-700",
    partial: isDark ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-700",
    unpaid: isDark ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-700",
  }

  return palette[status] || palette.unpaid
}

const getPaymentTypeStyle = (type, isDark) => {
  if (type === "product") {
    return isDark ? "bg-emerald-500/20 text-emerald-200" : "bg-emerald-100 text-emerald-700"
  }

  return isDark ? "bg-blue-500/20 text-blue-200" : "bg-blue-100 text-blue-700"
}

const PaymentHistoryPage = () => {
  const { isDark } = useTheme();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/payment/history")
      .then((res) => {
        setPayments(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className={`rounded-3xl border p-6 ${isDark ? "border-amber-400/20 bg-gradient-to-br from-[#24150d]/95 via-[#1a100a]/95 to-[#140c07]/95 shadow-[0_24px_70px_rgba(0,0,0,0.45)]" : "border-[#2f2218]/15 bg-gradient-to-br from-[#fff3e0]/95 via-[#fff8ef]/95 to-[#f5e6d1]/95 shadow-[0_24px_60px_rgba(74,47,20,0.18)]"}`}>
        <h1 className={`mb-1 text-2xl font-bold ${isDark ? "text-amber-50" : "text-[#2f2015]"}`}>ប្រវត្តិការទូទាត់</h1>
        <p className={`text-sm ${isDark ? "text-amber-100/70" : "text-[#74553c]"}`}>បង្ហាញប្រវត្តិការទូទាត់ទាំងអស់</p>
      </div>
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-400 border-t-transparent" />
        </div>
      ) : payments.length === 0 ? (
        <div className={`rounded-2xl border py-16 text-center shadow-[0_14px_40px_rgba(0,0,0,0.35)] ${isDark ? "border-amber-400/20 bg-[#1a100a]/90 text-amber-100/70" : "border-[#2f2218]/15 bg-[#fff8ee] text-[#74553c] shadow-[0_12px_35px_rgba(70,45,20,0.16)]"}`}>
          <div className="mb-3 text-5xl">💸</div>
          <p className="text-sm">មិនទាន់មានប្រវត្តិការទូទាត់</p>
        </div>
      ) : (
        <div className={`overflow-x-auto rounded-2xl border shadow-[0_14px_40px_rgba(0,0,0,0.35)] ${isDark ? "border-amber-400/20 bg-[#1a100a]/90" : "border-[#2f2218]/15 bg-[#fff8ee] shadow-[0_12px_35px_rgba(70,45,20,0.16)]"}`}>
          <table className="min-w-full text-sm">
            <thead>
              <tr className={`border-b text-left ${isDark ? "border-amber-500/20 bg-[#24150d] text-amber-100/80" : "border-[#ddc0a0] bg-[#f5e6d1] text-[#6c4a32]"}`}>
                {/* <th className="px-5 py-3 font-medium">Order ID</th> */}
                 <th className="px-5 py-3 font-medium">Product name</th>
                <th className="px-5 py-3 font-medium">Payment Style</th>
                <th className="px-5 py-3 font-medium">Product Detail</th>
                <th className="px-5 py-3 font-medium">វិធីបង់ប្រាក់</th>
                <th className="px-5 py-3 font-medium">តម្លៃសរុប</th>
                <th className="px-5 py-3 font-medium">បានបង់សរុប</th>
                <th className="px-5 py-3 font-medium">ស្ថានភាព</th>
                <th className="px-5 py-3 font-medium">ប្រវត្តិបង់ប្រាក់</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-amber-500/10" : "divide-[#ead5bf]"}`}>
              {payments.map((p) => (
                <tr key={p._id} className={`transition ${isDark ? "hover:bg-[#2b1a10]" : "text-[#3d2a1c] hover:bg-[#f7ebdb]"}`}>
                  {/* <td className="px-5 py-3 font-mono text-xs text-gray-500">{p.orderId?._id || "-"}</td> */}
                    <td className="px-5 py-3">{p.productName}</td>
                  <td className="px-5 py-3">
                    {p.paymentType === "product" ? (
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPaymentTypeStyle("product", isDark)}`}>
                        Pay by Product{p.quantity ? ` (Qty: ${p.quantity})` : ""}
                      </span>
                    ) : (
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPaymentTypeStyle("order", isDark)}`}>
                        Pay by Money
                      </span>
                    )}
                  </td>
                  <td className={`px-5 py-3 text-xs ${isDark ? "text-amber-100/80" : "text-[#6f513a]"}`}>
                    <div>Qty: {Number(p.quantity || p.orderId?.qty || 0)}</div>
                    <div>Unit: ${Number(p.unitPrice || p.orderId?.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </td>
                  <td className="px-5 py-3">{p.method}</td>
                  <td className={`px-5 py-3 font-semibold ${isDark ? "text-orange-300" : "text-orange-700"}`}>{Number(p.amount).toLocaleString()} $</td>
                  <td className={`px-5 py-3 font-semibold ${isDark ? "text-orange-300" : "text-orange-700"}`}>{Number(p.paidAmount).toLocaleString()} $</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(p.status, isDark)}`}>
                      {p.status === "paid"
                        ? "បង់រួច"
                        : p.status === "partial"
                        ? "បង់មួយផ្នែក"
                        : "មិនទាន់បង់"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <ul className="space-y-1">
                      {p.history.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((h, i) => (
                        <li key={i} className={`text-xs ${isDark ? "text-amber-100/70" : "text-[#6f513a]"}`}>
                          <span className={`font-semibold ${isDark ? "text-orange-300" : "text-orange-700"}`}>{Number(h.paidAmount).toLocaleString()} $</span>
                          <span className="mx-1">/</span>
                          <span>{h.method}</span>
                          <span className="mx-1">-</span>
                          <span className={isDark ? "text-amber-100/45" : "text-[#8f6f55]"}>{new Date(h.date).toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryPage;
