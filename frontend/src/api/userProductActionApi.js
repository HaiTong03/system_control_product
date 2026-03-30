import axios from "axios"

export async function getUserProductActions() {
  const token = localStorage.getItem("token")
  const res = await axios.get("/api/user-product-actions", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return res.data
}