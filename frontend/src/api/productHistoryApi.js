import axios from "axios"

export async function getProductHistory() {
  const res = await axios.get("/api/product-history")
  return res.data
}
