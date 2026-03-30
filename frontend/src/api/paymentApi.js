const BASE_URL = "/api/payment"

export const payOrder = async ({ orderId, method, amount, payAmount, paymentScope, payQty }) => {
  const res = await fetch(`${BASE_URL}/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, method, amount, payAmount, paymentScope, payQty }),
  })
  if (!res.ok) throw new Error("បញ្ចូលការទូទាត់មិនបាន")
  return res.json()
}

export const getPaymentHistory = async () => {
  const res = await fetch(`${BASE_URL}/history`)
  if (!res.ok) throw new Error("មិនអាចយកប្រវត្តិទូទាត់")
  return res.json()
}
