import React, { useEffect, useState } from "react";

const PaymentForm = ({
  orderId,
  amount,
  onPaid,
  mode = "amount",
  maxQty = 1,
  unitPrice = 0,
}) => {
  const [method, setMethod] = useState("លុយក្រៅ");
  const [paymentMode, setPaymentMode] = useState(mode === "both" ? "quantity" : mode);
  const [payAmount, setPayAmount] = useState(amount);
  const [payQty, setPayQty] = useState(maxQty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isQuantityMode = paymentMode === "quantity";

  useEffect(() => {
    setPaymentMode(mode === "both" ? "quantity" : mode);
  }, [mode]);

  useEffect(() => {
    setPayAmount(amount);
  }, [amount]);

  useEffect(() => {
    setPayQty(maxQty);
  }, [maxQty]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const normalizedQty = Math.max(1, Math.min(maxQty, Number(payQty) || 1));
      const normalizedAmount =
        isQuantityMode
          ? Number((normalizedQty * Number(unitPrice || 0)).toFixed(2))
          : Number(payAmount);

      await onPaid({
        orderId,
        method,
        amount,
        payAmount: normalizedAmount,
        payQty: isQuantityMode ? normalizedQty : undefined,
      });
      setLoading(false);
      setPayAmount(amount);
      setPayQty(maxQty);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const calculatedAmount = Number((Number(payQty || 0) * Number(unitPrice || 0)).toFixed(2));
  const moneyModeAmount = Number(payAmount || 0);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 w-lg max-w-xs  mx-auto"
      autoComplete="off"
    >
      {mode === "both" && (
        <div>
          <label className="mb-1 block font-semibold text-gray-700">Payment Option</label>
          <div className="flex gap-2">
            <button
              type="button"
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold border transition ${
                isQuantityMode
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white border-gray-200 text-gray-700 hover:border-emerald-400"
              }`}
              onClick={() => setPaymentMode("quantity")}
            >
              Pay by Product
            </button>
            <button
              type="button"
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold border transition ${
                !isQuantityMode
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white border-gray-200 text-gray-700 hover:border-emerald-400"
              }`}
              onClick={() => setPaymentMode("amount")}
            >
              Pay by Money
            </button>
          </div>
        </div>
      )}

      <div>
        <label className="block mb-1 font-semibold text-gray-700">
          វិធីបង់ប្រាក់
        </label>
        <div className="flex gap-3">
          {/* <button
            type="button"
            className={`flex-1 rounded-lg px-4 py-2 font-semibold border transition text-sm ${method === "លុយក្រៅ" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-gray-200 text-gray-700 hover:border-emerald-400"}`}
            onClick={() => setMethod("លុយក្រៅ")}
          >
            លុយក្រៅ
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg px-4 py-2 font-semibold border transition text-sm ${method === "ធនាគារ" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-gray-200 text-gray-700 hover:border-emerald-400"}`}
            onClick={() => setMethod("ធនាគារ")}
          >
            ធនាគារ
          </button> */}
        </div>
      </div>
      {isQuantityMode ? (
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            ចំនួនផលិតផល
          </label>
          <input
            type="number"
            min={1}
            max={maxQty}
            step="1"
            value={payQty}
            onChange={(e) => setPayQty(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-right font-bold text-lg text-emerald-700 focus:border-emerald-500 focus:ring-emerald-200 outline-none transition"
          />
          <div className="mt-1 text-xs text-gray-400">
            Qty available: <span className="font-semibold text-emerald-700">{maxQty}</span>
          </div>
          <div className="mt-1 text-xs text-gray-400">
            Unit price: <span className="font-semibold text-emerald-700">${Number(unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="mt-1 text-xs text-gray-400">
            Total to pay: <span className="font-semibold text-emerald-700">${calculatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      ) : (
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            ចំនួនទឹកប្រាក់ <span className="text-xs text-gray-400">(អាចបង់ 50%)</span>
          </label>
          <input
            type="number"
            min={amount * 0.5}
            max={amount}
            step="0.01"
            value={payAmount}
            onChange={e => setPayAmount(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-right font-bold text-lg text-emerald-700 focus:border-emerald-500 focus:ring-emerald-200 outline-none transition"
          />
          <div className="mt-1 text-xs text-gray-400">
            Qty available: <span className="font-semibold text-emerald-700">{maxQty}</span>
          </div>
          <div className="mt-1 text-xs text-gray-400">
            Unit price: <span className="font-semibold text-emerald-700">${Number(unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="mt-1 text-xs text-gray-400">
            Total to pay: <span className="font-semibold text-emerald-700">${moneyModeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-rose-100 text-rose-700 px-3 py-2 text-sm font-semibold">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-600 py-2 font-bold text-white shadow-lg transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "កំពុងបង់..." : "បង់ប្រាក់"}
      </button>
    </form>
  );
};

export default PaymentForm;
