import { useEffect, useState } from "react"
import { getUserProductActions } from "../api/userProductActionApi"
import { useTheme } from "../contexts/ThemeContext"

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-"
  }

  if (typeof value === "boolean") {
    return value ? "Active" : "Inactive"
  }

  return String(value)
}

const fieldLabels = {
  productname: "Product name",
  qty: "Quantity",
  price: "Price",
  amount: "Amount",
  category: "Category",
  type: "Type",
  status: "Status",
  description: "Description",
}

const detailFields = ["productname", "qty", "price", "amount", "category", "type", "status", "description"]

function DetailBlock({ title, data, isDark }) {
  return (
    <div className={`rounded-2xl border p-4 ${isDark ? "border-amber-400/15 bg-[#130c08]" : "border-[#d6b48f] bg-[#fff3e3]"}`}>
      <h3 className={`mb-4 text-sm font-semibold uppercase tracking-[0.14em] ${isDark ? "text-amber-300/80" : "text-[#8d6343]"}`}>{title}</h3>
      <div className="space-y-3">
        {detailFields.map((field) => (
          <div key={field} className={`grid gap-1 border-b pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[120px_1fr] ${isDark ? "border-amber-400/10" : "border-[#e8d2b8]"}`}>
            <span className={`text-xs font-medium uppercase tracking-[0.12em] ${isDark ? "text-amber-100/45" : "text-[#8f6d52]"}`}>{fieldLabels[field]}</span>
            <span className={`text-sm ${isDark ? "text-amber-50/90" : "text-[#3b2a1c]"}`}>{formatValue(data?.[field])}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function UserProductActionsPage() {
  const { isDark } = useTheme()
  const [actions, setActions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedActionId, setSelectedActionId] = useState(null)
  const [showAllActions, setShowAllActions] = useState(false)

  useEffect(() => {
    getUserProductActions()
      .then((data) => {
        setActions(data)
        if (data.length > 0) {
          setSelectedActionId(data[0]._id)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const normalUserActions = actions.filter((action) => action.action_user_role !== "admin")
  const visibleActions = showAllActions ? actions : normalUserActions
  const selectedAction = visibleActions.find((action) => action._id === selectedActionId) || visibleActions[0] || null
  const editedCount = visibleActions.filter((action) => action.action === "edited").length
  const deletedCount = visibleActions.filter((action) => action.action === "deleted").length

  const handleSelectAction = (actionId) => {
    setSelectedActionId(actionId)
  }

  return (
    <div className="space-y-6">
      <div className={`rounded-3xl border p-6 ${isDark ? "border-amber-400/20 bg-gradient-to-br from-[#24150d]/95 via-[#1a100a]/95 to-[#140c07]/95 shadow-[0_24px_70px_rgba(0,0,0,0.45)]" : "border-[#2f2218]/15 bg-gradient-to-br from-[#fff3e0]/95 via-[#fff8ef]/95 to-[#f5e6d1]/95 shadow-[0_24px_60px_rgba(74,47,20,0.18)]"}`}>
        <h1 className={`text-3xl font-bold ${isDark ? "text-amber-50" : "text-[#2f2015]"}`}>User Product Actions</h1>
        <p className={`mt-1 text-sm ${isDark ? "text-amber-100/70" : "text-[#74553c]"}`}>Admin view with more detail for normal user update and delete activity</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-400 border-t-transparent" />
        </div>
      ) : visibleActions.length === 0 ? (
        <div className={`rounded-2xl border py-16 text-center shadow-[0_14px_40px_rgba(0,0,0,0.35)] ${isDark ? "border-amber-400/20 bg-[#1a100a]/90 text-amber-100/70" : "border-[#2f2218]/15 bg-[#fff8ee] text-[#74553c] shadow-[0_12px_35px_rgba(70,45,20,0.16)]"}`}>
          <div className="mb-3 text-5xl">🗂️</div>
          <p className="text-sm">No user actions found</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className={`rounded-2xl border p-5 ${isDark ? "border-amber-400/15 bg-[#1a100a]/90 shadow-[0_14px_40px_rgba(0,0,0,0.35)]" : "border-[#2f2218]/15 bg-[#fff8ee] shadow-[0_12px_35px_rgba(70,45,20,0.16)]"}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${isDark ? "text-amber-100/50" : "text-[#8d6343]"}`}>Visible actions</p>
              <p className={`mt-3 text-3xl font-bold ${isDark ? "text-amber-50" : "text-[#2f2015]"}`}>{visibleActions.length}</p>
            </div>
            <div className={`rounded-2xl border p-5 ${isDark ? "border-amber-400/15 bg-[#1a100a]/90 shadow-[0_14px_40px_rgba(0,0,0,0.35)]" : "border-[#2f2218]/15 bg-[#fff8ee] shadow-[0_12px_35px_rgba(70,45,20,0.16)]"}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${isDark ? "text-amber-100/50" : "text-[#8d6343]"}`}>Updated</p>
              <p className={`mt-3 text-3xl font-bold ${isDark ? "text-orange-300" : "text-orange-700"}`}>{editedCount}</p>
            </div>
            <div className={`rounded-2xl border p-5 ${isDark ? "border-amber-400/15 bg-[#1a100a]/90 shadow-[0_14px_40px_rgba(0,0,0,0.35)]" : "border-[#2f2218]/15 bg-[#fff8ee] shadow-[0_12px_35px_rgba(70,45,20,0.16)]"}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${isDark ? "text-amber-100/50" : "text-[#8d6343]"}`}>Deleted</p>
              <p className={`mt-3 text-3xl font-bold ${isDark ? "text-red-300" : "text-red-700"}`}>{deletedCount}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowAllActions(false)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                !showAllActions
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950"
                  : isDark
                    ? "border border-amber-400/20 bg-[#1a100a]/90 text-amber-100/70 hover:bg-[#2a170e]"
                    : "border border-[#d6b48f] bg-[#fff8ee] text-[#6f513a] hover:bg-[#f5e8d6]"
              }`}
            >
              Normal user only
            </button>
            <button
              type="button"
              onClick={() => setShowAllActions(true)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                showAllActions
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950"
                  : isDark
                    ? "border border-amber-400/20 bg-[#1a100a]/90 text-amber-100/70 hover:bg-[#2a170e]"
                    : "border border-[#d6b48f] bg-[#fff8ee] text-[#6f513a] hover:bg-[#f5e8d6]"
              }`}
            >
              Show all roles
            </button>
          </div>

          <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <div className={`overflow-hidden rounded-2xl border ${isDark ? "border-amber-400/20 bg-[#1a100a]/90 shadow-[0_14px_40px_rgba(0,0,0,0.35)]" : "border-[#2f2218]/15 bg-[#fff8ee] shadow-[0_12px_35px_rgba(70,45,20,0.16)]"}`}>
              <div className={`border-b px-5 py-4 ${isDark ? "border-amber-500/15" : "border-[#e6ceb1]"}`}>
                <h2 className={`text-lg font-semibold ${isDark ? "text-amber-50" : "text-[#2f2015]"}`}>Activity list</h2>
                <p className={`mt-1 text-sm ${isDark ? "text-amber-100/60" : "text-[#74553c]"}`}>Select a record to see old and new product details.</p>
              </div>

              <div className="max-h-[720px] overflow-y-auto">
                {visibleActions.map((action) => {
                  const isSelected = action._id === selectedAction?._id

                  return (
                    <button
                      key={action._id}
                      type="button"
                      onClick={() => handleSelectAction(action._id)}
                      className={`w-full border-b px-5 py-4 text-left transition last:border-b-0 ${isDark ? "border-amber-500/10" : "border-[#ead5bf]"} ${
                        isSelected ? (isDark ? "bg-[#2a170f]" : "bg-[#f5e8d6]") : (isDark ? "hover:bg-[#23140d]" : "hover:bg-[#f9edde]")
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={`font-semibold ${isDark ? "text-amber-50" : "text-[#2f2015]"}`}>{action.productname}</p>
                          <p className={`mt-1 text-xs uppercase tracking-[0.12em] ${isDark ? "text-amber-100/45" : "text-[#8f6d52]"}`}>
                            {action.action_by || "Unknown user"} • {action.action_user_role || "user"}
                          </p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                          action.action === "deleted"
                            ? isDark ? "bg-red-500/15 text-red-200" : "bg-red-100 text-red-700"
                            : isDark ? "bg-orange-500/15 text-orange-200" : "bg-orange-100 text-orange-700"
                        }`}>
                          {action.action}
                        </span>
                      </div>
                      <div className={`mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs ${isDark ? "text-amber-100/60" : "text-[#76573e]"}`}>
                        <span>{new Date(action.action_date).toLocaleString()}</span>
                        <span>ID: {action.action_user_id || "-"}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedAction && (
              <div className={`space-y-6 rounded-2xl border p-6 ${isDark ? "border-amber-400/20 bg-[#1a100a]/90 shadow-[0_14px_40px_rgba(0,0,0,0.35)]" : "border-[#2f2218]/15 bg-[#fff8ee] shadow-[0_12px_35px_rgba(70,45,20,0.16)]"}`}>
                <div className={`flex flex-wrap items-start justify-between gap-4 border-b pb-5 ${isDark ? "border-amber-500/10" : "border-[#ead5bf]"}`}>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${isDark ? "text-amber-100/45" : "text-[#8f6d52]"}`}>Selected activity</p>
                    <h2 className={`mt-2 text-2xl font-bold ${isDark ? "text-amber-50" : "text-[#2f2015]"}`}>{selectedAction.productname}</h2>
                    <p className={`mt-2 text-sm ${isDark ? "text-amber-100/70" : "text-[#74553c]"}`}>
                      {selectedAction.action_by || "Unknown user"} ({selectedAction.action_user_role || "user"})
                      {" "}performed a {selectedAction.action} action on {new Date(selectedAction.action_date).toLocaleString()}.
                    </p>
                  </div>
                  <div className={`rounded-2xl border px-4 py-3 text-sm ${isDark ? "border-amber-400/15 bg-[#130c08] text-amber-100/75" : "border-[#d6b48f] bg-[#fff3e3] text-[#74553c]"}`}>
                    <p>User ID: {selectedAction.action_user_id || "-"}</p>
                  </div>
                </div>

                <div className={`grid gap-4 ${selectedAction.action === "edited" ? "lg:grid-cols-2" : "grid-cols-1"}`}>
                  <DetailBlock title="Data before action" data={selectedAction.old_data} isDark={isDark} />
                  {selectedAction.action === "edited" && (
                    <DetailBlock title="Data after update" data={selectedAction.new_data} isDark={isDark} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}