import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  createProduct,
  updateProduct,
  getProductById,
  deleteProduct,
} from "../api/productApi"
import Toast from "../components/Toast"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Food",
  "Furniture",
  "Beauty",
  "Sports",
  "Books",
  "Other",
]
const TYPES = ["New", "Used", "Refurbished", "Sale", "Limited Edition"]
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const EMPTY = {
  productname: "",
  qty: "",
  price: "",
  category: "",
  type: "",
  image: "",
  description: "",
  status: true,
}

export default function AddProductPage() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [form, setForm] = useState(EMPTY)
  const [categoryOptions, setCategoryOptions] = useState(CATEGORIES)
  const [customCategory, setCustomCategory] = useState("")
  const [preview, setPreview] = useState("")
  const [selectedImageName, setSelectedImageName] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [toast, setToast] = useState(null)
  const [searchParams] = useSearchParams()
  const editId = searchParams.get("id")
  const navigate = useNavigate()
  const isEdit = Boolean(editId)

  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  /* Load existing product when editing */
  useEffect(() => {
    if (!editId) {
      setForm(EMPTY)
      setCategoryOptions(CATEGORIES)
      setCustomCategory("")
      setPreview("")
      setSelectedImageName("")
      return
    }
    setFetching(true)
    getProductById(editId)
      .then((p) => {
        const loadedCategory = p.category || ""
        const isPredefinedCategory = CATEGORIES.includes(loadedCategory)

        setCategoryOptions((prev) => (
          loadedCategory && !prev.includes(loadedCategory)
            ? [...prev, loadedCategory]
            : prev
        ))
        setCustomCategory(isPredefinedCategory ? "" : loadedCategory)

        setForm({
          productname: p.productname || "",
          qty: p.qty ?? "",
          price: p.price ?? "",
          category: loadedCategory,
          type: p.type || "",
          image: p.image || "",
          description: p.description || "",
          status: p.status ?? true,
        })
        setPreview(p.image || "")
        setSelectedImageName("")
      })
      .catch(() => showToast("Failed to load product", "error"))
      .finally(() => setFetching(false))
  }, [editId])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === "checkbox" ? checked : value
    setForm((prev) => ({ ...prev, [name]: val }))
  }

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value

    setForm((prev) => ({ ...prev, category: selectedCategory }))
    if (selectedCategory !== "Other") {
      setCustomCategory("")
    }
  }

  const handleAddCustomCategory = () => {
    const trimmed = customCategory.trim()

    if (!trimmed) {
      showToast("Please enter a category name", "error")
      return
    }

    const isExisting = categoryOptions.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase(),
    )

    if (!isExisting) {
      setCategoryOptions((prev) => [...prev, trimmed])
    }

    setForm((prev) => ({ ...prev, category: trimmed }))
    showToast("Category added")
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file", "error")
      e.target.value = ""
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      showToast("Image must be smaller than 5MB", "error")
      e.target.value = ""
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const imageData = typeof reader.result === "string" ? reader.result : ""
      setForm((prev) => ({ ...prev, image: imageData }))
      setPreview(imageData)
      setSelectedImageName(file.name)
    }

    reader.onerror = () => {
      showToast("Failed to read image", "error")
    }

    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, image: "" }))
    setPreview("")
    setSelectedImageName("")
  }

  const computed = () => {
    const q = Number(form.qty) || 0
    const p = Number(form.price) || 0
    return (q * p).toFixed(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const finalCategory = form.category === "Other" ? customCategory.trim() : form.category

    if (form.category === "Other" && !finalCategory) {
      showToast("Please enter a category name", "error")
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...form,
        category: finalCategory,
        qty: Number(form.qty),
        price: Number(form.price),
      }
      if (isEdit) {
        await updateProduct(editId, payload)
        showToast("Product updated!")
        setTimeout(() => navigate("/products"), 1200)
      } else {
        await createProduct(payload)
        showToast("Product added!")
        setForm(EMPTY)
        setCategoryOptions(CATEGORIES)
        setCustomCategory("")
        setPreview("")
        setSelectedImageName("")
      }
    } catch (error) {
      showToast(error.message || "Save failed", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) return
    try {
      await deleteProduct(editId)
      showToast("Product deleted")
      setTimeout(() => navigate("/products"), 1200)
    } catch (error) {
      showToast(error.message || "Delete failed", "error")
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-400 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto  space-y-6">
      <Toast toast={toast} />

      <div className={`flex items-center justify-between rounded-3xl border p-6 ${isDark ? "border-amber-400/20 bg-gradient-to-br from-[#24150d]/95 via-[#1a100a]/95 to-[#140c07]/95 shadow-[0_24px_70px_rgba(0,0,0,0.45)]" : "border-[#2f2218]/15 bg-gradient-to-br from-[#fff3e0]/95 via-[#fff8ef]/95 to-[#f5e6d1]/95 shadow-[0_24px_60px_rgba(74,47,20,0.18)]"}`}>
        <div>
          <p className={`text-xs uppercase tracking-[0.16em] ${isDark ? "text-orange-300" : "text-[#946542]"}`}>
            Editor
          </p>
          <h1 className={`mt-2 text-3xl font-bold ${isDark ? "text-amber-50" : "text-[#2f2015]"}`}>
            {isEdit ? "Edit Product" : "Add New Product"}
          </h1>
          {/* <p className="mt-1 text-sm text-gray-500">
            {isEdit
              ? `Editing product ID: ${editId}`
              : "Fill in the details below"}
          </p> */}
        </div>
        <button
          onClick={() => navigate("/products")}
          className={`flex items-center gap-1 text-sm font-medium transition ${isDark ? "text-amber-100/70 hover:text-orange-300" : "text-[#77583f] hover:text-[#9a653d]"}`}
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: image preview */}
          <div className="lg:col-span-1">
            <div className={`rounded-2xl border p-5 shadow-[0_14px_40px_rgba(0,0,0,0.35)] space-y-4 ${isDark ? "border-amber-400/20 bg-[#1a100a]/90" : "border-[#2f2218]/15 bg-[#fff8ee] shadow-[0_12px_35px_rgba(70,45,20,0.16)]"}`}>
              <h2 className={`text-sm font-semibold ${isDark ? "text-amber-100" : "text-[#2f2015]"}`}>
                Product Image
              </h2>
              <div className={`flex h-44 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed ${isDark ? "border-amber-400/25 bg-[#22140c]" : "border-[#d6b48f] bg-[#fffdf8]"}`}>
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="h-full w-full object-cover rounded-xl"
                    onError={() => setPreview("")}
                  />
                ) : (
                  <div className={`text-center ${isDark ? "text-amber-100/35" : "text-[#8a6549]"}`}>
                    <div className="mb-2 text-5xl">🖼️</div>
                    <p className="text-xs">Image preview</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className={`block text-xs font-medium ${isDark ? "text-amber-100/70" : "text-[#74553c]"}`}>
                  Select Image From PC
                </label>
                <label className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition ${isDark ? "border-amber-400/25 bg-[#22140c] text-amber-100 hover:bg-[#2b1a10]" : "border-[#d6b48f] bg-[#fffdf8] text-[#5f412b] hover:bg-[#f5e8d6]"}`}>
                  Click to choose image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                <p className={`text-xs break-all ${isDark ? "text-amber-100/55" : "text-[#7a5a42]"}`}>
                  {selectedImageName ||
                    (preview ? "Current saved image" : "No image selected")}
                </p>
                {preview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-xs font-medium text-red-500 transition hover:text-red-600"
                  >
                    Remove image
                  </button>
                )}
              </div>

              {/* Total display */}
              <div className={`rounded-xl border p-4 text-center ${isDark ? "border-orange-300/25 bg-orange-500/10" : "border-[#d8af84] bg-[#ffe9cc]"}`}>
                <p className={`mb-1 text-xs ${isDark ? "text-amber-100/75" : "text-[#76523a]"}`}>Total Amount</p>
                <p className="text-2xl font-bold text-orange-300">
                  ${computed()}
                </p>
                <p className={`mt-1 text-xs ${isDark ? "text-amber-100/55" : "text-[#7a5a42]"}`}>Qty × Price</p>
              </div>
            </div>
          </div>

          {/* Right: form fields */}
          <div className={`lg:col-span-2 rounded-2xl border p-6 space-y-4 ${isDark ? "border-amber-400/20 bg-[#1a100a]/90 shadow-[0_14px_40px_rgba(0,0,0,0.35)]" : "border-[#2f2218]/15 bg-[#fff8ee] shadow-[0_12px_35px_rgba(70,45,20,0.16)]"}`}>
            <h2 className={`text-sm font-semibold ${isDark ? "text-amber-100" : "text-[#2f2015]"}`}>
              Product Details
            </h2>

            {/* Product name */}
            <div>
              <label className={`mb-1 block text-xs font-medium ${isDark ? "text-amber-100/70" : "text-[#6f4d35]"}`}>
                Product Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="productname"
                value={form.productname}
                // onChange={handleChange}
                onChange={(e) => {
                  const value = e.target.value.replace(/[0-9]/g, "") // remove numbers
                  handleChange({ target: { name: e.target.name, value } })
                }}
                pattern="[A-Za-z\s]+"
                required
                placeholder="Enter product name"
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${isDark
                  ? "border-amber-400/25 bg-[#22140c] text-amber-50 placeholder:text-amber-100/40 focus:ring-orange-500/40"
                  : "border-[#d6b48f] bg-[#fffdf8] text-[#2f2015] placeholder:text-[#9a7b60] focus:ring-[#b1733f]/35"
                }`}
              />
            </div>

            {/* Qty & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`mb-1 block text-xs font-medium ${isDark ? "text-amber-100/70" : "text-[#6f4d35]"}`}>
                  Quantity <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="qty"
                  value={form.qty}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="0"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${isDark
                    ? "border-amber-400/25 bg-[#22140c] text-amber-50 placeholder:text-amber-100/40 focus:ring-orange-500/40"
                    : "border-[#d6b48f] bg-[#fffdf8] text-[#2f2015] placeholder:text-[#9a7b60] focus:ring-[#b1733f]/35"
                  }`}
                />
              </div>
              <div>
                <label className={`mb-1 block text-xs font-medium ${isDark ? "text-amber-100/70" : "text-[#6f4d35]"}`}>
                  Price ($)
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${isDark
                    ? "border-amber-400/25 bg-[#22140c] text-amber-50 placeholder:text-amber-100/40 focus:ring-orange-500/40"
                    : "border-[#d6b48f] bg-[#fffdf8] text-[#2f2015] placeholder:text-[#9a7b60] focus:ring-[#b1733f]/35"
                  }`}
                />
              </div>
            </div>

            {/* Category & Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`mb-1 block text-xs font-medium ${isDark ? "text-amber-100/70" : "text-[#6f4d35]"}`}>
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleCategoryChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${isDark
                    ? "border-amber-400/25 bg-[#22140c] text-amber-50 focus:ring-orange-500/40"
                    : "border-[#d6b48f] bg-[#fffdf8] text-[#2f2015] focus:ring-[#b1733f]/35"
                  }`}
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {form.category === "Other" && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter new category"
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${isDark
                        ? "border-amber-400/25 bg-[#22140c] text-amber-50 placeholder:text-amber-100/40 focus:ring-orange-500/40"
                        : "border-[#d6b48f] bg-[#fffdf8] text-[#2f2015] placeholder:text-[#9a7b60] focus:ring-[#b1733f]/35"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCategory}
                      className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-[#2b1508] transition hover:bg-orange-400"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className={`mb-1 block text-xs font-medium ${isDark ? "text-amber-100/70" : "text-[#6f4d35]"}`}>
                  Type
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${isDark
                    ? "border-amber-400/25 bg-[#22140c] text-amber-50 focus:ring-orange-500/40"
                    : "border-[#d6b48f] bg-[#fffdf8] text-[#2f2015] focus:ring-[#b1733f]/35"
                  }`}
                >
                  <option value={TYPES[0]}>{TYPES[0]}</option>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={`mb-1 block text-xs font-medium ${isDark ? "text-amber-100/70" : "text-[#6f4d35]"}`}>
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Optional product description..."
                className={`w-full resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${isDark
                  ? "border-amber-400/25 bg-[#22140c] text-amber-50 placeholder:text-amber-100/40 focus:ring-orange-500/40"
                  : "border-[#d6b48f] bg-[#fffdf8] text-[#2f2015] placeholder:text-[#9a7b60] focus:ring-[#b1733f]/35"
                }`}
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="status"
                id="status"
                checked={form.status}
                onChange={handleChange}
                className="h-4 w-4 accent-orange-500"
              />
              <label
                htmlFor="status"
                className={`text-sm font-medium ${isDark ? "text-amber-100/80" : "text-[#6f4d35]"}`}
              >
                Active (visible in store)
              </label>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-2.5 text-sm font-medium text-[#2b1508] transition hover:brightness-110 disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : isEdit
                ? "💾 Update Product"
                : "➕ Add Product"}
          </button>

          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-xl bg-red-500 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-red-600"
            >
              🗑️ Delete Product
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate("/products")}
            className={`rounded-xl border px-6 py-2.5 text-sm font-medium transition ${isDark ? "border-amber-400/20 bg-[#24150d] text-amber-100/80 hover:bg-[#2d1a10]" : "border-[#d6b48f] bg-[#fffaf2] text-[#5f412b] hover:bg-[#f3e2cb]"}`}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
