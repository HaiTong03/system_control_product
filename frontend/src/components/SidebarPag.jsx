import {
  ChartNoAxesCombinedIcon,
  ClipboardClock,
  DatabaseBackup,
  PackagePlus,
  PackageSearch,
  ShoppingCart,
  LogOutIcon,
  Sparkles,
  Moon,
  Sun,
} from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from "../contexts/ThemeContext"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'

const navMain = [
  { to: "/dashboard", icon: ChartNoAxesCombinedIcon, label: "Dashboard" },
]

const navOrder = [
  { to: "/products",    icon: ShoppingCart,   label: "List Products"   },
  { to: "/add-product", icon: PackagePlus,     label: "Insert Products" },
  { to: "/orders",      icon: PackageSearch,   label: "Get Products"    },
]

const navHistory = [
  { to: "/old-products",     icon: DatabaseBackup, label: "Old Products"    },
  { to: "/payment-history",  icon: ClipboardClock, label: "Payment History" },
  { to: "/user-product-actions", icon: ClipboardClock, label: "User Actions" },
]

const SidebarPage = () => {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const isUserRole = user?.role === "user"
  const visibleOrderNav = isUserRole
    ? navOrder.filter((item) => item.to === "/products" || item.to === "/add-product")
    : navOrder
  const visibleHistoryNav = isUserRole ? [] : navHistory

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className={`flex min-h-dvh w-full ${isDark ? "bg-[#070b11]" : "bg-[#f5efe4]"}`}>
      <SidebarProvider>
        <Sidebar className={`border-r ${isDark ? "border-white/[0.06] bg-[#0a0a14]" : "border-[#2f2218]/15 bg-[#f6ecdd]"}`}>
          <SidebarContent className="px-2 py-4">
            {/* Brand header */}
            <div className="mb-6 flex items-center gap-3 px-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/25">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-slate-300" : "text-[#6a4a31]"}`}>Teamwork</span>
            </div>

            {/* Main */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navMain.map(({ to, icon: Icon, label }) => (
                    <SidebarMenuItem key={to}>
                      <SidebarMenuButton asChild>
                        <Link
                          to={to}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                            isActive(to)
                              ? "bg-amber-400/10 text-amber-400 shadow-sm"
                              : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
                          }`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${isActive(to) ? "text-amber-400" : ""}`} />
                          <span>{label}</span>
                          {isActive(to) && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Order Pages */}
            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className={`px-3 text-[10px] font-bold uppercase tracking-[0.16em] ${isDark ? "text-slate-600" : "text-[#8f6c4f]"}`}>
                Order Pages
              </SidebarGroupLabel>
              <SidebarGroupContent className="mt-1">
                <SidebarMenu>
                  {visibleOrderNav.map(({ to, icon: Icon, label }) => (
                    <SidebarMenuItem key={to}>
                      <SidebarMenuButton asChild>
                        <Link
                          to={to}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                            isActive(to)
                              ? "bg-amber-400/10 text-amber-400"
                              : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
                          }`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${isActive(to) ? "text-amber-400" : ""}`} />
                          <span>{label}</span>
                          {isActive(to) && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* History */}
            {visibleHistoryNav.length > 0 && (
            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className={`px-3 text-[10px] font-bold uppercase tracking-[0.16em] ${isDark ? "text-slate-600" : "text-[#8f6c4f]"}`}>
                History
              </SidebarGroupLabel>
              <SidebarGroupContent className="mt-1">
                <SidebarMenu>
                  {visibleHistoryNav.map(({ to, icon: Icon, label }) => (
                    <SidebarMenuItem key={to}>
                      <SidebarMenuButton asChild>
                        <Link
                          to={to}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                            isActive(to)
                              ? "bg-amber-400/10 text-amber-400"
                              : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
                          }`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${isActive(to) ? "text-amber-400" : ""}`} />
                          <span>{label}</span>
                          {isActive(to) && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            )}
          </SidebarContent>
        </Sidebar>

        <div className='flex flex-1 flex-col'>
          {/* Header */}
          <header className={`sticky top-0 z-50 flex h-14 items-center justify-between gap-4 border-b px-4 backdrop-blur-xl sm:px-6 ${isDark ? "border-white/[0.06] bg-[#0a0a14]/80" : "border-[#2f2218]/15 bg-[#f9f0e4]/85"}`}>
            <SidebarTrigger className={`[&_svg]:!size-5 ${isDark ? "text-slate-400 hover:text-slate-200" : "text-[#7f5d42] hover:text-[#4d3422]"}`} />
            <div className='flex items-center gap-3'>
              <button
                type="button"
                onClick={toggleTheme}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${isDark ? "border-[#9ac4ea]/35 bg-[#13273d] text-[#d7ebff] hover:bg-[#17304a]" : "border-[#2f2218]/20 bg-[#f2e6d6] text-[#6b4a31] hover:bg-[#ead8bf]"}`}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                title={isDark ? "Light mode" : "Dark mode"}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              {user && (
                <>
                  <div className="hidden items-center gap-2 sm:flex">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-slate-950">
                      {(user.username || "U")[0].toUpperCase()}
                    </div>
                    <span className={`text-sm ${isDark ? "text-slate-400" : "text-[#7f5d42]"}`}>
                      <span className={`font-semibold ${isDark ? "text-slate-200" : "text-[#4d3422]"}`}>{user.username || "Admin"}</span>
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/20 bg-rose-400/[0.07] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-rose-300/80 transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-300"
                  >
                    <LogOutIcon className="h-3 w-3" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </header>

          <main className={`size-full flex-1 px-4 py-6 sm:px-6 ${isDark ? "text-slate-100" : "text-[#2f2015]"}`}>
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}

export default SidebarPage
