const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api"

const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    : { "Content-Type": "application/json" }
}

const parseError = async (res, fallbackMessage) => {
  const contentType = res.headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    const data = await res.json()
    throw new Error(data.message || fallbackMessage)
  }

  const text = await res.text()
  throw new Error(text || fallbackMessage)
}

export const getProducts = async () => {
  const res = await fetch(`${BASE_URL}/getallproduct`)
  console.log("getProducts response:", res.json)
  if (!res.ok) await parseError(res, "Failed to fetch products")
  return res.json()
}

export const getProductById = async (id) => {
  const res = await fetch(`${BASE_URL}/getproductByID/${id}`)
  if (!res.ok) await parseError(res, "Failed to fetch product")
  return res.json()
}

export const createProduct = async (data) => {
  const res = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) await parseError(res, "Failed to create product")
  return res.json()
}

export const updateProduct = async (id, data) => {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) await parseError(res, "Failed to update product")
  return res.json()
}

export const deleteProduct = async (id) => {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })
  if (!res.ok) await parseError(res, "Failed to delete product")
  return res.json()
}
