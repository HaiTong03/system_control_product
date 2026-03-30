const STORAGE_KEY = "shop_orders_v1"

const readOrders = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeOrders = (orders) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

const formatOrderId = () => {
  const stamp = Date.now().toString().slice(-6)
  const rand = Math.floor(Math.random() * 900 + 100)
  return `ORD-${stamp}-${rand}`
}

export const getOrders = () => readOrders()

export const addProductToOrder = (product) => {
  const orders = readOrders()

  const activeIndex = orders.findIndex(
    (o) => o.productId === product._id && o.status === "Unpaid",
  )

  if (activeIndex >= 0) {
    const old = orders[activeIndex]
    const nextQty = old.qty + 1
    orders[activeIndex] = {
      ...old,
      qty: nextQty,
      total: Number((nextQty * old.price).toFixed(2)),
      updatedAt: new Date().toISOString(),
    }
    writeOrders(orders)
    return { merged: true, order: orders[activeIndex] }
  }

  const price = Number(product.price || 0)
  const order = {
    id: formatOrderId(),
    productId: product._id,
    product: product.productname,
    image: product.image || "",
    category: product.category || "-",
    qty: 1,
    price,
    total: Number(price.toFixed(2)),
    status: "Unpaid",
    addedAt: new Date().toISOString(),
    paidAt: null,
  }

  orders.unshift(order)
  writeOrders(orders)
  return { merged: false, order }
}

export const payOrderById = (orderId) => {
  const orders = readOrders()
  const next = orders.map((o) => {
    if (o.id !== orderId || o.status === "Paid") return o
    return {
      ...o,
      status: "Paid",
      paidAt: new Date().toISOString(),
    }
  })
  writeOrders(next)
  return next
}

export const payAllOrders = () => {
  const now = new Date().toISOString()
  const orders = readOrders().map((o) =>
    o.status === "Paid"
      ? o
      : {
          ...o,
          status: "Paid",
          paidAt: now,
        },
  )
  writeOrders(orders)
  return orders
}
