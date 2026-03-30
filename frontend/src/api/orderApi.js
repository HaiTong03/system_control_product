const BASE_URL = "/api/orders"

export const createOrder = async (data) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("បញ្ចូល order មិនបាន")
  return res.json()
}

export const getOrders = async () => {
  const res = await fetch(BASE_URL)
  if (!res.ok) throw new Error("មិនអាចយក order")
  return res.json()
}

export const updateOrder = async (id, data) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("មិនអាចកែ order")
  return res.json()
}

export const deleteOrder = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("មិនអាចលុប order")
  return res.json()
}
