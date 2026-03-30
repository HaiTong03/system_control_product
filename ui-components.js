function shellClass(active, key) {
  return active === key
    ? "bg-brand-700 text-white shadow"
    : "bg-white/70 text-slate-700 hover:bg-white"
}

function HeaderSection({ page, onSetPage, onOpenCreate }) {
  return (
    <header className="mb-6 flex flex-col gap-4 rounded-3xl bg-brand-900 p-6 text-white shadow-xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-blue-200">
            Admin Panel
          </p>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Inventory Dashboard
          </h1>
        </div>
        <button
          onClick={onOpenCreate}
          className="rounded-xl bg-brand-500 px-4 py-2 font-semibold transition hover:bg-brand-700"
        >
          Add Product
        </button>
      </div>
      <nav className="flex flex-wrap gap-2">
        <button
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${shellClass(page, "dashboard")}`}
          onClick={() => onSetPage("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${shellClass(page, "orders")}`}
          onClick={() => onSetPage("orders")}
        >
          Orders
        </button>
        <button
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${shellClass(page, "products")}`}
          onClick={() => onSetPage("products")}
        >
          Products
        </button>
        <button
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${shellClass(page, "add")}`}
          onClick={onOpenCreate}
        >
          Add Product
        </button>
      </nav>
    </header>
  )
}

function ProductForm({ form, editingProduct, onChange, onSubmit, onCancel }) {
  return (
    <form className="grid gap-3" onSubmit={onSubmit}>
      <input
        name="productname"
        value={form.productname}
        onChange={onChange}
        placeholder="Product name"
        className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-brand-500"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="price"
          type="number"
          min="0"
          value={form.price}
          onChange={onChange}
          placeholder="Price"
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-brand-500"
        />
        <input
          name="qty"
          type="number"
          min="0"
          value={form.qty}
          onChange={onChange}
          placeholder="Qty"
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-brand-500"
        />
      </div>
      <textarea
        name="description"
        value={form.description}
        onChange={onChange}
        placeholder="Description"
        className="min-h-24 rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-brand-500"
      />
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          name="status"
          type="checkbox"
          checked={form.status}
          onChange={onChange}
          className="h-4 w-4 rounded"
        />
        Active product
      </label>

      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          className="rounded-lg bg-slate-100 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white hover:bg-brand-700"
        >
          {editingProduct ? "Update" : "Create"}
        </button>
      </div>
    </form>
  )
}

function DashboardSection({ stats, formatCurrency }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-100">
        <p className="text-sm text-slate-500">Total Products</p>
        <h2 className="mt-2 text-3xl font-bold text-brand-700">
          {stats.totalProducts}
        </h2>
      </article>
      <article className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-100">
        <p className="text-sm text-slate-500">Total Inventory Qty</p>
        <h2 className="mt-2 text-3xl font-bold text-brand-700">
          {stats.totalInventory}
        </h2>
      </article>
      <article className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-100 sm:col-span-2 xl:col-span-1">
        <p className="text-sm text-slate-500">Inventory Value</p>
        <h2 className="mt-2 text-3xl font-bold text-brand-700">
          {formatCurrency(stats.totalRevenue)}
        </h2>
      </article>
    </section>
  )
}

function OrdersSection({ orders, formatCurrency }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-100">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Order Page</h2>
        <p className="text-xs text-slate-500">Demo orders based on products</p>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-3 py-3">Order ID</th>
              <th className="px-3 py-3">Item</th>
              <th className="px-3 py-3">Qty</th>
              <th className="px-3 py-3">Total</th>
              <th className="px-3 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-slate-500" colSpan={5}>
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-t border-slate-100">
                  <td className="px-3 py-3 font-medium">{order.id}</td>
                  <td className="px-3 py-3">{order.item}</td>
                  <td className="px-3 py-3">{order.qty}</td>
                  <td className="px-3 py-3">{formatCurrency(order.total)}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        order.status === "Delivered"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ProductsSection({
  loading,
  query,
  filteredProducts,
  onChangeQuery,
  onRefresh,
  onEdit,
  onDelete,
  formatCurrency,
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-100">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-slate-800">Product Page</h2>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(event) => onChangeQuery(event.target.value)}
            placeholder="Search product..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-brand-500 sm:w-72"
          />
          <button
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            onClick={onRefresh}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Price</th>
              <th className="px-3 py-3">Qty</th>
              <th className="px-3 py-3">Amount</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-4 text-slate-500" colSpan={6}>
                  Loading...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-slate-500" colSpan={6}>
                  Product not found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id} className="border-t border-slate-100">
                  <td className="px-3 py-3 font-medium">
                    {product.productname}
                  </td>
                  <td className="px-3 py-3">{formatCurrency(product.price)}</td>
                  <td className="px-3 py-3">{product.qty}</td>
                  <td className="px-3 py-3">
                    {formatCurrency(
                      product.amount ?? product.price * product.qty,
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        product.status
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {product.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button
                        className="rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-200"
                        onClick={() => onEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-md bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200"
                        onClick={() => onDelete(product)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function AddProductSection({
  form,
  editingProduct,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-100">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Add Product</h2>
        <p className="text-xs text-slate-500">Create a new product record</p>
      </div>
      <ProductForm
        form={form}
        editingProduct={editingProduct}
        onChange={onChange}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </section>
  )
}

function EditProductModal({
  isOpen,
  form,
  editingProduct,
  onChange,
  onSubmit,
  onClose,
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="mb-4 text-xl font-bold text-slate-800">
          {editingProduct ? "Edit Product" : "Add Product"}
        </h2>

        <ProductForm
          form={form}
          editingProduct={editingProduct}
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  )
}

window.UIComponents = {
  HeaderSection,
  DashboardSection,
  OrdersSection,
  ProductsSection,
  AddProductSection,
  EditProductModal,
}
