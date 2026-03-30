import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Sparkles, Boxes } from "lucide-react";
import { getProducts, deleteProduct } from "../api/productApi";
import Toast from "../components/Toast";
import { createOrder, deleteOrder, getOrders, updateOrder } from "../api/orderApi";
import CardProductDemo from "../components/CardProductDemo";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export default function ProductsPage() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const isUserRole = user?.role === "user"
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState("")
  const [nameInitial, setNameInitial] = useState("All")
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getProducts()
      setProducts(data)
    } catch {
      showToast("Failed to load products", "error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return
    try {
      await deleteProduct(id)
      showToast("Product deleted")
      load()
    } catch (error) {
      showToast(error.message || "Delete failed", "error")
    }
  }


  const handleAddToOrder = async (product) => {
    try {
      const orders = await getOrders();
      console.log('All orders:', orders);
      // Find all Unpaid orders for this product
      const unpaidOrders = orders.filter((o) => o.productId === product._id && o.status === "Unpaid");
      console.log('Unpaid orders for product', product._id, unpaidOrders);
      if (unpaidOrders.length > 0) {
        // Only increase qty/total, never create new order for same product
        const mainOrder = unpaidOrders[0];
        console.log('Main order:', mainOrder);
        const oldQty = unpaidOrders.reduce((sum, o) => sum + o.qty, 0);
        const newQty = oldQty + 1;
        const price = Number(product.price || mainOrder.price || 0);
        const newTotal = Number((newQty * price).toFixed(2));
        // Delete all other Unpaid orders for this product
        for (let i = 1; i < unpaidOrders.length; i++) {
          await deleteOrder(unpaidOrders[i]._id);
        }
        await updateOrder(mainOrder._id, { qty: newQty, price, total: newTotal });
        showToast("Order quantity increased");
      } else {
        // Only create new order if no Unpaid order exists for this product
        await createOrder({
          productId: product._id,
          product: product.productname,
          image: product.image || "",
          category: product.category || "-",
          qty: 1,
          price: Number(product.price || 0),
          total: Number(product.price || 0),
          status: "Unpaid",
          addedAt: new Date().toISOString(),
        });
        showToast("Product added to order");
      }
    } catch (err) {
      showToast("Add to order failed", "error");
    }
  };

  const alphabetOptions = ["All", ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))]

  const filtered = products
    .filter((p) => {
      const productName = (p.productname || "").trim()
      const matchSearch = productName.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(search.toLowerCase())
      const matchInitial = nameInitial === "All" || productName.toUpperCase().startsWith(nameInitial)
      return matchSearch && matchInitial
    })
    .sort((a, b) => (a.productname || "").localeCompare(b.productname || "", undefined, { sensitivity: "base" }))

  return (
    <div className="premium-page floating-in space-y-4">
      <Toast toast={toast} />

      <section className={`relative overflow-hidden rounded-3xl border p-4 md:p-6 ${isDark
        ? "border-amber-300/20 bg-[linear-gradient(140deg,#1e120a_0%,#120b06_45%,#24160c_100%)] shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
        : "border-[#2f2218]/15 bg-[linear-gradient(140deg,#fff7ea_0%,#fffdf7_45%,#f8ead7_100%)] shadow-[0_16px_40px_rgba(70,45,20,0.14)]"
      }`}>
        <div className={`pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full blur-3xl ${isDark ? "bg-orange-300/15" : "bg-[#ffb36a]/30"}`} />
        <div className={`pointer-events-none absolute -left-14 bottom-0 h-36 w-36 rounded-full blur-3xl ${isDark ? "bg-amber-200/10" : "bg-[#ffd9a8]/35"}`} />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${isDark ? "border-amber-200/30 bg-amber-200/10 text-amber-100/85" : "border-[#cda681] bg-[#f7e2c8] text-[#7b5438]"}`}>
              <Sparkles className="h-3.5 w-3.5" />
              Catalog
            </div>

            <h1 className={`mt-2.5 text-2xl font-bold md:text-3xl ${isDark ? "text-amber-50" : "text-[#2f2015]"}`}>
              Products
            </h1>

            <p className={`mt-1.5 text-sm ${isDark ? "text-amber-100/75" : "text-[#6e4f38]"}`}>
              Showing {filtered.length} of {products.length} products
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${isDark ? "border-amber-300/25 bg-[#2a1a10]/70 text-amber-100/90" : "border-[#d6b48f] bg-[#fff6e8] text-[#6e4f38]"}`}>
              <Boxes className="h-3.5 w-3.5" />
              Total: {products.length}
            </div>

            <button
              onClick={() => navigate("/add-product")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2.5 text-sm font-semibold text-[#2b1508] transition hover:-translate-y-0.5 hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>
      </section>

      <section className={`premium-surface p-3.5 md:p-4 ${isDark ? "" : "border border-[#2f2218]/15 bg-[#fff8ee] shadow-[0_12px_35px_rgba(70,45,20,0.16)]"}`}>
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isDark ? "text-amber-100/45" : "text-[#8f6a4f]"}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or description"
              className={`w-full rounded-xl border py-2 pl-10 pr-4 text-sm transition ${isDark ? "border-amber-400/25 bg-[#22140c] text-amber-50 placeholder:text-amber-100/40" : "border-[#d6b48f] bg-[#fffdf8] text-[#2f2015] placeholder:text-[#9a7b60]"}`}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${isDark ? "text-amber-100/65" : "text-[#7e5a40]"}`}>
              Filter by first letter
            </p>

            <div className="flex w-full items-center justify-end md:w-auto">
              <div className="relative w-full max-w-xs md:w-[200px]">
                <select
                  value={nameInitial}
                  onChange={(e) => setNameInitial(e.target.value)}
                  className={`w-full appearance-none rounded-xl border px-3 py-2 pr-10 text-sm font-medium transition ${isDark ? "border-amber-400/25 bg-[#22140c] text-amber-50 focus:border-amber-300/50 focus:outline-none" : "border-[#d6b48f] bg-[#fffdf8] text-[#2f2015] focus:border-[#bf9066] focus:outline-none"}`}
                >
                  {alphabetOptions.map((letter) => (
                    <option key={letter} value={letter}>
                      {letter === "All" ? "All" : letter}
                    </option>
                  ))}
                </select>
                <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs ${isDark ? "text-amber-100/55" : "text-[#8f6a4f]"}`}>
                  ▼
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-400 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className={`premium-surface py-16 text-center ${isDark ? "text-amber-100/70" : "border border-[#2f2218]/15 bg-[#fff8ee] text-[#74553c]"}`}>
          <div className="mb-3 text-5xl">📭</div>
          <p className="text-sm">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <CardProductDemo
              key={p._id}
              product={p}
              productname={p.productname}
              image={p.image}
              price={p.price}
              created_date={p.created_date}
              description={p.description}
              qty={p.qty}
              category={p.category}
              sizes={p.sizes}
              colors={p.colors}
              handleAddToOrder={isUserRole ? undefined : handleAddToOrder}
              handleDelete={handleDelete}
              canEdit={true}
              canDelete={true}
              canAddToOrder={!isUserRole}
            />
          ))}
        </div>
      )}
    </div>
  )
}
