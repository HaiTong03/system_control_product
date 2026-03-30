import { useEffect, useState, useCallback } from "react";
import { getProducts } from "../api/productApi";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

function StatCard({ label, value, icon, tone, isDark }) {
  return (
    <div className={`rounded-2xl border p-5 ${isDark ? "border-amber-400/20 bg-[#1a100a]/90 shadow-[0_14px_40px_rgba(0,0,0,0.35)]" : "border-[#2f2218]/15 bg-[#fff8ee] shadow-[0_12px_35px_rgba(70,45,20,0.16)]"}`}>
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${tone}`}>
          {icon}
        </div>
        <div>
          <p className={`text-xs uppercase tracking-[0.14em] ${isDark ? "text-amber-300/80" : "text-[#8a5f3f]"}`}>{label}</p>
          <p className={`mt-1 text-2xl font-bold ${isDark ? "text-amber-50" : "text-[#2f2015]"}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message, isDark }) {
  return (
    <div className={`rounded-xl border border-dashed px-4 py-6 text-center text-sm ${isDark ? "border-amber-400/30 bg-amber-500/10 text-amber-200" : "border-[#c49a73]/35 bg-[#f7ecdc] text-[#7a563b]"}`}>
      {message}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalProducts = products.length;
  const totalQty = products.reduce((s, p) => s + (p.qty || 0), 0);
  const totalAmount = products.reduce((s, p) => s + (p.amount || 0), 0);
  const activeCount = products.filter((p) => p.status).length;

  const catMap = {};
  products.forEach((p) => {
    const cat = p.category || "Uncategorized";
    catMap[cat] = (catMap[cat] || 0) + 1;
  });
  const topCat = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const recent = [...products]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6 md:space-y-8">
        <section className={`rounded-3xl border p-6 md:p-8 ${isDark ? "border-amber-400/20 bg-gradient-to-br from-[#24150d]/95 via-[#1a100a]/95 to-[#140c07]/95 shadow-[0_24px_70px_rgba(0,0,0,0.45)]" : "border-[#2f2218]/15 bg-gradient-to-br from-[#fff3e0]/95 via-[#fff8ef]/95 to-[#f5e6d1]/95 shadow-[0_24px_60px_rgba(74,47,20,0.18)]"}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? "text-orange-300" : "text-[#946542]"}`}>Store Control</p>
              <h1 className={`mt-2 text-3xl font-bold md:text-4xl ${isDark ? "text-amber-50" : "text-[#2f2015]"}`}>Dashboard Overview</h1>
              <p className={`mt-2 text-sm ${isDark ? "text-amber-100/75" : "text-[#6f513a]"}`}>Track inventory, sales value, and product activity in one place.</p>
            </div>
            <div className={`rounded-2xl border px-5 py-4 text-right ${isDark ? "border-orange-300/25 bg-gradient-to-br from-orange-400/20 to-amber-300/10" : "border-[#d3ab7e]/35 bg-gradient-to-br from-[#ffe2bb]/70 to-[#fff1dc]/60"}`}>
              <p className={`text-xs uppercase tracking-[0.14em] ${isDark ? "text-amber-100/80" : "text-[#76523a]"}`}>Inventory Value</p>
              <p className="mt-2 text-3xl font-bold text-orange-300">${totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </section>



        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Products" value={totalProducts} icon="📦" tone="bg-orange-500/15 text-orange-300" isDark={isDark} />
          <StatCard label="Total Quantity" value={totalQty} icon="🔢" tone="bg-amber-500/15 text-amber-300" isDark={isDark} />
          <StatCard label="Revenue" value={`$${totalAmount.toFixed(2)}`} icon="💰" tone="bg-orange-500/15 text-orange-300" isDark={isDark} />
          <StatCard label="Active" value={`${activeCount}/${totalProducts}`} icon="✅" tone="bg-amber-500/15 text-amber-300" isDark={isDark} />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className={`rounded-2xl border p-6 ${isDark ? "border-amber-400/20 bg-[#1a100a]/90 shadow-[0_14px_40px_rgba(0,0,0,0.35)]" : "border-[#2f2218]/15 bg-[#fff8ee] shadow-[0_12px_35px_rgba(70,45,20,0.16)]"}`}>
            <h2 className={`text-lg font-bold ${isDark ? "text-amber-50" : "text-[#2f2015]"}`}>Top Categories</h2>
            <p className={`mt-1 text-sm ${isDark ? "text-amber-100/65" : "text-[#74553c]"}`}>Most frequent categories in your catalog.</p>
            <div className="mt-5 space-y-4">
              {topCat.length === 0 ? (
                <EmptyState message="No category data yet" isDark={isDark} />
              ) : (
                topCat.map(([cat, count]) => (
                  <div key={cat}>
                    <div className={`mb-1 flex justify-between text-sm ${isDark ? "text-amber-100/85" : "text-[#5e422e]"}`}>
                      <span>{cat}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                    <div className={`h-2.5 w-full rounded-full ${isDark ? "bg-[#2a1a10]" : "bg-[#ecd6bc]"}`}>
                      <div className="h-2.5 rounded-full bg-linear-to-r from-orange-500 to-amber-300" style={{ width: `${(count / totalProducts) * 100}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={`rounded-2xl border p-6 ${isDark ? "border-amber-400/20 bg-[#1a100a]/90 shadow-[0_14px_40px_rgba(0,0,0,0.35)]" : "border-[#2f2218]/15 bg-[#fff8ee] shadow-[0_12px_35px_rgba(70,45,20,0.16)]"}`}>
            <h2 className={`text-lg font-bold ${isDark ? "text-amber-50" : "text-[#2f2015]"}`}>Recently Added</h2>
            <p className={`mt-1 text-sm ${isDark ? "text-amber-100/65" : "text-[#74553c]"}`}>Latest 5 products from your collection.</p>
            <div className={`mt-4 divide-y ${isDark ? "divide-amber-500/10" : "divide-[#e3cdb3]"}`}>
              {recent.length === 0 ? (
                <EmptyState message="No products yet" isDark={isDark} />
              ) : (
                recent.map((p) => (
                  <div key={p._id} className="flex items-center gap-4 py-3">
                    {p.image ? (
                      <img src={p.image} alt={p.productname} className={`h-11 w-11 rounded-xl border object-cover ${isDark ? "border-amber-400/20" : "border-[#d8b792]"}`} />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/15 text-lg">📦</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-semibold ${isDark ? "text-amber-50" : "text-[#2f2015]"}`}>{p.productname}</p>
                      <p className={`text-xs ${isDark ? "text-amber-100/65" : "text-[#74553c]"}`}>{p.category || "—"} · {p.type || "—"}</p>
                    </div>
                    <span className="text-sm font-bold text-orange-300">${Number(p.amount || 0).toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat and Session Panels */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mt-8">
        {/* Chat Panel */}
        {/* <div className="panel rounded-2xl p-6 flex flex-col h-80">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="text-blue-500 text-xl">💬</span> Chat
          </h2>
          <p className="mt-1 text-sm text-gray-500">Send and receive messages in real time.</p>
          <div className="flex-1 overflow-y-auto mt-4 bg-blue-50/40 rounded-lg p-3 text-sm text-gray-700">
            <div className="text-gray-400 italic">No messages yet. (UI only)</div>
          </div>
          <form className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80"
              disabled
            />
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
              disabled
            >Send</button>
          </form>
        </div> */}

        {/* Session Panel */}
        {/* <div className="panel rounded-2xl p-6 flex flex-col h-80">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="text-green-500 text-xl">🟢</span> Session
          </h2>
          <p className="mt-1 text-sm text-gray-500">Current user and session details.</p>
          <div className="flex-1 flex flex-col justify-center items-center text-gray-700">
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl">👤</span>
              <div className="font-semibold">User: <span className="text-emerald-700">(Not logged in)</span></div>
              <div className="text-xs text-gray-400">Session info will appear here.</div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
