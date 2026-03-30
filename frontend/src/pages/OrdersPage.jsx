import { useEffect, useState, useCallback } from "react";
import Toast from "../components/Toast";
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../api/orderApi";
import PaymentForm from "../components/PaymentForm";
import { payOrder as payOrderApi } from "../api/paymentApi";
import { getProducts } from "../api/productApi";
import { Input } from "../components/ui/input";
import { useTheme } from "../contexts/ThemeContext";
const STATUS_COLOR = {
  Unpaid: "bg-red-500/20 text-red-300",
  Paid: "bg-orange-500/20 text-orange-300",
  Partial: "bg-amber-500/20 text-amber-300",
};

export default function OrdersPage() {
  const { isDark } = useTheme();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("All");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [qtys, setQtys] = useState({}); // { [productId]: qty }
  const [showPayAll, setShowPayAll] = useState(false);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  // 💰 Pay all unpaid orders (with form)
  const unpaidOrders = orders.filter((o) => o.total - (o.paidAmount || 0) > 0);
  // unpaidTotal will be declared later for filtered orders, so use a different name here
  const unpaidTotalAll = unpaidOrders.reduce((s, o) => {
    const paid = o.paidAmount || 0;
    return s + (o.total - paid);
  }, 0);

  const handlePayAll = () => {
    if (unpaidOrders.length === 0) {
      showToast("No unpaid orders", "info");
      return;
    }
    setShowPayAll(true);
  };

  const handlePayProduct = () => {
    if (unpaidOrders.length === 0) {
      showToast("No unpaid orders", "info");
      return;
    }

    setSelectedOrder(unpaidOrders[0]);
    setShowPayAll(false);
    setShowPayment(true);
  };

  // Actually process pay all after form submit
  const handlePayAllSubmit = async ({ method, payAmount }) => {
    setLoading(true);
    let remaining = payAmount;
    let successCount = 0;
    let failCount = 0;
    for (const o of unpaidOrders) {
      const orderUnpaid = o.total - (o.paidAmount || 0);
      if (remaining <= 0) break;
      const thisPay = Math.min(orderUnpaid, remaining);
      try {
        const payment = await payOrderApi({
          orderId: o._id,
          method,
          amount: o.total,
          payAmount: thisPay,
        });
        if (payment.status === "paid" || payment.status === "Paid") {
          await deleteOrder(o._id);
        } else {
          const unpaid = payment.amount - payment.paidAmount;
          if (unpaid > 0) {
            await updateOrder(o._id, { total: unpaid });
          }
        }
        successCount++;
        remaining -= thisPay;
      } catch {
        failCount++;
      }
    }
    await load();
    setLoading(false);
    setShowPayAll(false);
    if (successCount > 0) {
      showToast(`Paid ${successCount} order(s) successfully`);
    }
    if (failCount > 0) {
      showToast(`${failCount} order(s) failed to pay`, "error");
    }
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [orderData, productData] = await Promise.all([
        getOrders(),
        getProducts(),
      ]);

      setOrders(Array.isArray(orderData) ? orderData : []);
      setProducts(Array.isArray(productData) ? productData : []);
    } catch (err) {
      console.error(err);
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ➕ Add product
  const handleAddProducts = async (product, qty) => {
    try {
      const existing = orders.find(
        (o) => o.productId === product._id && o.status === "Unpaid",
      );

      if (existing) {
        const newQty = existing.qty + qty;
        const price = Number(product.price || existing.price || 0);

        await updateOrder(existing._id, {
          qty: newQty,
          total: Number((newQty * price).toFixed(2)),
        });

        showToast("Quantity updated");
      } else {
        await createOrder({
          productId: product._id,
          product: product.productname || "Unknown",
          image: product.image || "",
          category: product.category || "-",
          qty: qty,
          price: Number(product.price || 0),
          total: Number(product.price || 0) * qty,
          status: "Unpaid",
          addedAt: new Date().toISOString(),
        });

        showToast("Product added");
        setQtys({ ...qtys, [product._id]: 1 }); // reset qty input to 1 after adding
      }

      await load();
    } catch {
      showToast("Error adding product", "error");
    }
  };

  // ➕ Add product
  const handleAddProduct = async (product) => {
    try {
      const existing = orders.find(
        (o) =>
          String(o.productId?._id || o.productId) === String(product._id) &&
          o.status?.toLowerCase() === "unpaid",
      );

      if (existing) {
        const newQty = existing.qty + 1;
        const price = Number(product.price || existing.price || 0);

        await updateOrder(existing._id, {
          qty: newQty,
          total: Number((newQty * price).toFixed(2)),
        });

        showToast("Quantity updated");
      } else {
        await createOrder({
          productId: product._id,
          product: product.productname || "Unknown",
          image: product.image || "",
          category: product.category || "-",
          qty: 1,
          price: Number(product.price || 0),
          total: Number(product.price || 0),
          status: "Unpaid",
          addedAt: new Date().toISOString(),
        });

        showToast("Product added");
      }

      await load();
    } catch {
      showToast("Error adding product", "error");
    }
  };

  // ➖ Decrease (FIXED)
  const handleDecreaseOrder = async (order) => {
    if (!order) return;

    try {
      if (order.qty > 1) {
        await updateOrder(order._id, {
          qty: order.qty - 1,
          total: Number(((order.qty - 1) * order.price).toFixed(2)),
        });
      } else {
        await deleteOrder(order._id);
      }

      await load();
      showToast("Order updated");
    } catch {
      showToast("Error updating", "error");
    }
  };

  // 💰 Pay (accepts method and payAmount from PaymentForm)
  const handlePayOrder = async ({ orderId, method, amount, payAmount, payQty }) => {
    try {
      const currentOrder = orders.find((order) => order._id === orderId);
      const isProductPayment = Number(payQty || 0) > 0;
      const payment = await payOrderApi({
        orderId,
        method,
        amount: isProductPayment ? payAmount : amount,
        payAmount,
        paymentScope: isProductPayment ? "product" : "order",
        payQty,
      });

      const paidByQty = isProductPayment && currentOrder;

      if (paidByQty) {
        const remainingQty = Math.max(0, Number(currentOrder.qty || 0) - Number(payQty || 0));

        if (remainingQty <= 0) {
          await deleteOrder(orderId);
        } else {
          await updateOrder(orderId, {
            qty: remainingQty,
            total: Number((remainingQty * Number(currentOrder.price || 0)).toFixed(2)),
          });
        }
      } else if (payment.status === "paid" || payment.status === "Paid") {
        await deleteOrder(orderId);
      } else {
        const unpaid = payment.amount - payment.paidAmount;
        if (unpaid > 0) {
          await updateOrder(orderId, { total: unpaid });
        }
      }

      await load();
      showToast("Payment success");

      setShowPayment(false);
      setSelectedOrder(null);
    } catch (err) {
      showToast(err.message || "Payment failed", "error");
    }
  };

  // 🔍 FILTER FIXED
  const filtered = orders.filter((o) => {
    const product = o.product || "";
    const id = o._id || "";

    return (
      product.toLowerCase().includes(search.toLowerCase()) ||
      id.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalRevenue = filtered.reduce((s, o) => s + Number(o.total || 0), 0);

  const unpaidTotal = filtered.reduce((s, o) => {
    const paid = o.paidAmount || 0;
    return s + (o.total - paid);
  }, 0);

  return (
    <div className="space-y-6 p-4">
      <Toast toast={toast} />

      {/* PRODUCTS */}
      <table className={`w-full overflow-hidden rounded-2xl border ${isDark ? "border-amber-400/20 bg-[#1a100a]/90 shadow-[0_14px_40px_rgba(0,0,0,0.35)]" : "border-[#2f2218]/15 bg-[#fff8ee] shadow-[0_12px_35px_rgba(70,45,20,0.16)]"}`}>
        <thead>
          <tr>
            <th className={`p-2 text-left ${isDark ? "text-white" : "text-[#3f2b1c]"}`}>Image</th>
            <th className={`p-2 text-left ${isDark ? "text-white" : "text-[#3f2b1c]"}`}>Name</th>
            {/* <th className={`p-2 text-left ${isDark ? "text-white" : "text-[#3f2b1c]"}`}>Product</th> */}
            <th className={`p-2 text-left ${isDark ? "text-white" : "text-[#3f2b1c]"}`}>Price</th>
            <th className={`p-2 text-left ${isDark ? "text-white" : "text-[#3f2b1c]"}`}>Created Date</th>
            <th className={`p-2 text-center ${isDark ? "text-white" : "text-[#3f2b1c]"}`}>Qty</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => {
            const order = orders.find(
              (o) => o.productId === p._id && o.status === "Unpaid",
            );

            return (
              <tr key={p._id} className={`border-t ${isDark ? "border-amber-500/15 text-white" : "border-[#ead5bf] text-[#3f2b1c]"}`}>
                {/* IMAGE */}
                <td className="p-2">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.productname}
                      className="h-12 w-12 rounded-lg border border-amber-400/20 object-cover"
                    />
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </td>

                {/* NAME */}
                <td className="p-2">{p.productname}</td>
                <td className="p-2">${p.price.toFixed(2)}</td>
                <td className="p-2">
                  {new Date(p.created_date).toLocaleDateString("en-GB")}
                </td>

                {/* QTY INPUT */}
                <td className="p-2 text-center">
                  <Input
                    type="number"
                    value={qtys[p._id] ?? 1}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) =>
                      setQtys({
                        ...qtys,
                        [p._id]: e.target.value === "" ? "" : Math.max(1, parseInt(e.target.value, 10) || 1),
                      })
                    }
                    onBlur={() =>
                      setQtys((prev) => ({
                        ...prev,
                        [p._id]: parseInt(prev[p._id]) || 1,
                      }))
                    }
                    className={`mx-auto w-20 text-center ${isDark ? "border-amber-400/25 bg-[#22140c] text-amber-50" : "border-[#d6b48f] bg-[#fffdf8] text-[#2f2015]"}`}
                  />
                </td>

                {/* ACTION */}
                <td className="p-2 text-center">
                  <button
                    className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-400 px-3 py-1 font-semibold text-[#2b1508]"
                    onClick={() => handleAddProducts(p, qtys[p._id] || 1)}
                  >
                    Add
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ORDERS */}
      <div className={`rounded-2xl border p-4 ${isDark ? "border-amber-400/20 bg-[#1a100a]/90 shadow-[0_14px_40px_rgba(0,0,0,0.35)]" : "border-[#2f2218]/15 bg-[#fff8ee] shadow-[0_12px_35px_rgba(70,45,20,0.16)]"}`}>
        <div className="flex justify-between items-end mb-4">
          <div className={`rounded-2xl border p-5 shadow-lg ${isDark ? "border-amber-400/20 bg-[#24150d]" : "border-[#d6b48f] bg-[#f7ead8]"}`}>
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${isDark ? "text-amber-50" : "text-[#2f2015]"}`}>
                🧾 Orders Summary
              </h2>
            </div>

            {/* TOTALS */}
            <div className="">
              <div className="  rounded-xl">
                <p className={`text-sm ${isDark ? "text-amber-100/70" : "text-[#74553c]"}`}>Total Revenue</p>
                <p className="text-xl font-bold text-orange-300">
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>

              <div className=" rounded-xl">
                <p className={`text-sm ${isDark ? "text-amber-100/70" : "text-[#74553c]"}`}>Unpaid</p>
                <p className="text-xl font-bold text-red-300">
                  ${unpaidTotalAll.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* BUTTON */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              className={`flex items-center justify-center rounded-xl border px-3 py-3 font-semibold shadow-md transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${isDark ? "border-amber-400/20 bg-[#24150d] text-amber-100 hover:bg-[#2d1a10]" : "border-[#d6b48f] bg-[#f7ead8] text-[#5f412b] hover:bg-[#efdfc8]"}`}
              onClick={handlePayProduct}
              disabled={loading || unpaidTotalAll === 0}
            >
              💵 Pay Product
            </button>
            <button
              className="flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-3 py-3 font-semibold text-[#2b1508] shadow-md transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handlePayAll}
              disabled={loading || unpaidTotalAll === 0}
            >
              💳 Pay All Orders
            </button>
          </div>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className={`mt-2 w-full rounded-xl border p-2 ${isDark ? "border-amber-400/25 bg-[#22140c] text-amber-50 placeholder:text-amber-100/40" : "border-[#d6b48f] bg-[#fffdf8] text-[#2f2015] placeholder:text-[#9a7b60]"}`}
        />

        {loading ? (
          <p className="py-8 text-center text-amber-100/70">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-amber-100/70">No orders found</p>
        ) : (
          <table className={`w-full overflow-hidden rounded-xl border-collapse border shadow-sm ${isDark ? "border-amber-400/20 bg-[#22140c]" : "border-[#d6b48f] bg-[#fffdf8]"}`}>
            <thead>
              <tr className={`border-b-2 ${isDark ? "border-amber-500/25 bg-gradient-to-r from-[#2a180e] to-[#23140c]" : "border-[#e2c4a4] bg-gradient-to-r from-[#f5e5cf] to-[#f1dec5]"}`}>
                <th className={`p-3 text-left text-sm font-semibold ${isDark ? "text-amber-100/80" : "text-[#5a3e29]"}`}>Image</th>
                <th className={`p-3 text-left text-sm font-semibold ${isDark ? "text-amber-100/80" : "text-[#5a3e29]"}`}>Product Name</th>
                <th className={`p-3 text-left text-sm font-semibold ${isDark ? "text-amber-100/80" : "text-[#5a3e29]"}`}>Product</th>
                <th className={`p-3 text-center text-sm font-semibold ${isDark ? "text-amber-100/80" : "text-[#5a3e29]"}`}>Qty</th>
                <th className={`p-3 text-left text-sm font-semibold ${isDark ? "text-amber-100/80" : "text-[#5a3e29]"}`}>Unit Price</th>
                <th className={`p-3 text-left text-sm font-semibold ${isDark ? "text-amber-100/80" : "text-[#5a3e29]"}`}>Total</th>
                <th className={`p-3 text-center text-sm font-semibold ${isDark ? "text-amber-100/80" : "text-[#5a3e29]"}`}>Status</th>
                <th className={`p-3 text-center text-sm font-semibold ${isDark ? "text-amber-100/80" : "text-[#5a3e29]"}`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, index) => {
                const paid = o.paidAmount || 0;
                const unpaid = o.total - paid;
                const isFullyPaid = unpaid <= 0;
                return (
                  <tr
                    key={o._id}
                    className={`border-b transition-colors ${isDark ? "border-amber-500/10" : "border-[#ead5bf]"} ${
                      index % 2 === 0
                        ? (isDark ? "bg-[#1f120b]" : "bg-[#fff8ee]")
                        : (isDark ? "bg-[#24150d]" : "bg-[#fff3e3]")
                    } ${isDark ? "hover:bg-[#2b1a10]" : "hover:bg-[#f5e8d6]"}`}
                  >
                    <td className="p-3">
                      {o.image ? (
                        <img
                          src={o.image}
                          alt={o.product}
                          className="h-12 w-12 rounded-lg border border-amber-400/20 object-cover shadow"
                        />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </td>
                    <td className={`p-3 text-sm font-medium ${isDark ? "text-amber-50" : "text-[#3d2a1c]"}`}>{o.product}</td>
                    <td className={`p-3 text-sm ${isDark ? "text-amber-100/70" : "text-[#6f513a]"}`}>{o.category || "-"}</td>
                    <td className="p-3 text-center">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 text-sm font-semibold text-orange-300">
                        {o.qty}
                      </span>
                    </td>
                    <td className={`p-3 text-sm font-medium ${isDark ? "text-amber-100" : "text-[#5a3e29]"}`}>${o.price.toFixed(2)}</td>
                    <td className="p-3 text-sm font-bold text-orange-300">${o.total.toFixed(2)}</td>
                    <td className="p-3 text-center">
                      {isFullyPaid ? (
                        <span className="inline-flex items-center rounded-full bg-orange-500/15 px-3 py-1 text-xs font-semibold text-orange-300">
                          ✓ Paid
                        </span>
                      ) : (
                        <div className="text-xs">
                          <p className="font-semibold text-red-300">Unpaid: ${unpaid.toFixed(2)}</p>
                          {paid > 0 && (
                            <p className="text-xs text-orange-300">Partial: ${paid.toFixed(2)}</p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {!isFullyPaid ? (
                        <button
                          className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2 text-sm font-semibold text-[#2b1508] shadow-sm transition-colors hover:brightness-110"
                          onClick={() => {
                            setSelectedOrder(o);
                            setShowPayment(true);
                          }}
                        >
                          💵 Pay Product
                        </button>
                      ) : (
                        <span className="text-sm font-semibold text-orange-300">Done</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* PAYMENT MODAL */}
      {/* PAYMENT MODAL */}
      {showPayment && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`relative mx-4 w-full max-w-md rounded-2xl border p-6 shadow-xl animate-fadeIn ${isDark ? "border-amber-400/20 bg-[#1a100a]" : "border-[#d6b48f] bg-[#fff8ee]"}`}>
            {/* Close Button */}
            <button
              onClick={() => setShowPayment(false)}
              className={`absolute right-3 top-3 transition ${isDark ? "text-amber-100/45 hover:text-amber-100/80" : "text-[#916e54] hover:text-[#654630]"}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal Title */}
            <h3 className={`mb-4 text-2xl font-semibold ${isDark ? "text-amber-50" : "text-[#2f2015]"}`}>
              Payment
            </h3>

            {/* Payment Form */}
            <PaymentForm
              orderId={selectedOrder._id}
              amount={selectedOrder.total}
              onPaid={handlePayOrder}
              mode="both"
              maxQty={selectedOrder.qty}
              unitPrice={selectedOrder.price}
            />

            {/* Footer Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowPayment(false)}
                className={`rounded-lg border px-4 py-2 transition ${isDark ? "border-amber-400/20 bg-[#24150d] text-amber-100/80 hover:bg-[#2d1a10]" : "border-[#d6b48f] bg-[#f7ead8] text-[#5f412b] hover:bg-[#efdfc8]"}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAY ALL MODAL */}
      {showPayAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`relative mx-4 w-full max-w-md rounded-2xl border p-6 shadow-xl animate-fadeIn ${isDark ? "border-amber-400/20 bg-[#1a100a]" : "border-[#d6b48f] bg-[#fff8ee]"}`}>
            {/* Close Button */}
            <button
              onClick={() => setShowPayAll(false)}
              className={`absolute right-3 top-3 transition ${isDark ? "text-amber-100/45 hover:text-amber-100/80" : "text-[#916e54] hover:text-[#654630]"}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal Title */}
            <h3 className={`mb-4 text-2xl font-semibold ${isDark ? "text-amber-50" : "text-[#2f2015]"}`}>
              Pay All Orders
            </h3>

            {/* Payment Form */}
            <PaymentForm
              orderId={null}
              amount={unpaidTotalAll}
              onPaid={({ method, payAmount }) =>
                handlePayAllSubmit({ method, payAmount })
              }
            />

            {/* Footer Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowPayAll(false)}
                className={`rounded-lg border px-4 py-2 transition ${isDark ? "border-amber-400/20 bg-[#24150d] text-amber-100/80 hover:bg-[#2d1a10]" : "border-[#d6b48f] bg-[#f7ead8] text-[#5f412b] hover:bg-[#efdfc8]"}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
