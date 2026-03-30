const { useEffect, useMemo, useState } = React
const {
  HeaderSection,
  DashboardSection,
  OrdersSection,
  ProductsSection,
  AddProductSection,
  EditProductModal,
} = window.UIComponents

const API_BASE = "/api"

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

async function extractError(response, fallbackMessage) {
  const contentType = response.headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    const data = await response.json().catch(() => null)
    return data?.message || fallbackMessage
  }

  const text = await response.text().catch(() => "")
  return text || fallbackMessage
}

function App() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [page, setPage] = useState("dashboard")
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [message, setMessage] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const [form, setForm] = useState({
    productname: "",
    price: "",
    qty: "",
    description: "",
    status: true,
  })

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    const demoOrders = products.slice(0, 5).map((product, index) => ({
      id: `ORD-${String(index + 1).padStart(3, "0")}`,
      item: product.productname,
      qty: product.qty,
      total: product.amount ?? product.price * product.qty,
      status: index % 2 === 0 ? "Delivered" : "Pending",
    }))

    setOrders(demoOrders)
  }, [products])

  const filteredProducts = useMemo(() => {
    const keyword = query.trim().toLowerCase()

    if (!keyword) {
      return products
    }

    return products.filter((p) => p.productname.toLowerCase().includes(keyword))
  }, [products, query])

  const stats = useMemo(() => {
    const totalProducts = products.length
    const totalInventory = products.reduce(
      (sum, p) => sum + Number(p.qty || 0),
      0,
    )
    const totalRevenue = products.reduce(
      (sum, p) => sum + Number(p.amount ?? p.price * p.qty),
      0,
    )

    return { totalProducts, totalInventory, totalRevenue }
  }, [products])

  async function loadProducts() {
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch(`${API_BASE}/getallproduct`)

      if (!response.ok) {
        throw new Error(await extractError(response, "Cannot load products"))
      }

      const data = await response.json()
      setProducts(data)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditingProduct(null)
    setForm({
      productname: "",
      price: "",
      qty: "",
      description: "",
      status: true,
    })
    setPage("add")
    setShowAddModal(false)
  }

  function openEdit(product) {
    setEditingProduct(product)
    setForm({
      productname: product.productname || "",
      price: String(product.price || 0),
      qty: String(product.qty || 0),
      description: product.description || "",
      status: Boolean(product.status),
    })
    setShowAddModal(true)
  }

  function updateForm(event) {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  async function saveProduct(event) {
    event.preventDefault()
    setMessage("")

    if (!form.productname.trim()) {
      setMessage("Product name is required")
      return
    }

    if (/\d/.test(form.productname)) {
      setMessage("Product name should not contain numbers")
      return
    }

    const payload = {
      productname: form.productname.trim(),
      price: Number(form.price || 0),
      qty: Number(form.qty || 0),
      description: form.description.trim(),
      status: Boolean(form.status),
    }

    const endpoint = editingProduct
      ? `${API_BASE}/products/${editingProduct._id}`
      : `${API_BASE}/products`

    const method = editingProduct ? "PUT" : "POST"

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(await extractError(response, "Failed to save product"))
      }

      setShowAddModal(false)
      await loadProducts()
      setPage("products")
      setMessage(editingProduct ? "Product updated" : "Product created")
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function removeProduct(product) {
    const shouldDelete = window.confirm(`Delete ${product.productname}?`)

    if (!shouldDelete) {
      return
    }

    setMessage("")

    try {
      const response = await fetch(`${API_BASE}/products/${product._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(await extractError(response, "Delete failed"))
      }

      await loadProducts()
      setMessage("Product deleted")
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#d9eaff_0%,#eef6ff_30%,#f8fafc_100%)] text-slate-800">
      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        <HeaderSection
          page={page}
          onSetPage={setPage}
          onOpenCreate={openCreate}
        />

        {message ? (
          <div className="mb-4 rounded-lg border border-brand-100 bg-white p-3 text-sm text-slate-700 shadow-sm">
            {message}
          </div>
        ) : null}

        {page === "dashboard" ? (
          <DashboardSection stats={stats} formatCurrency={formatCurrency} />
        ) : null}

        {page === "orders" ? (
          <OrdersSection orders={orders} formatCurrency={formatCurrency} />
        ) : null}

        {page === "products" ? (
          <ProductsSection
            loading={loading}
            query={query}
            filteredProducts={filteredProducts}
            onChangeQuery={setQuery}
            onRefresh={loadProducts}
            onEdit={openEdit}
            onDelete={removeProduct}
            formatCurrency={formatCurrency}
          />
        ) : null}

        {page === "add" ? (
          <AddProductSection
            form={form}
            editingProduct={editingProduct}
            onChange={updateForm}
            onSubmit={saveProduct}
            onCancel={() => setPage("products")}
          />
        ) : null}
      </div>

      <EditProductModal
        isOpen={showAddModal}
        form={form}
        editingProduct={editingProduct}
        onChange={updateForm}
        onSubmit={saveProduct}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />)
