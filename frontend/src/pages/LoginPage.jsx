import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { loginUser, logoutUser, registerUser, setUiAuthSession } from "../api/userApi"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, Crown, Loader2, Lock, Moon, ShieldCheck, Sparkles, Sun } from "lucide-react"

const ADMIN_EMAIL = "teamwork123@gmail.com"
const ADMIN_PASSWORD = "team12345"

export default function LoginPage() {
  const [mode, setMode] = useState("login")
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [registeredEmails, setRegisteredEmails] = useState(() => {
    // Load previously registered emails from localStorage
    const stored = localStorage.getItem("registeredEmails")
    return stored ? JSON.parse(stored) : []
  })
  const navigate = useNavigate()
  const { login } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const isRegister = mode === "register"
  const isAdmin = mode === "admin"

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Check for duplicate registration attempt
      if (isRegister) {
        if (registeredEmails.includes(formData.email.toLowerCase())) {
          throw new Error("This email is already registered. Please sign in instead.")
        }
      }

      // Admin role: check admin credentials
      if (isAdmin) {
        if (formData.email !== ADMIN_EMAIL || formData.password !== ADMIN_PASSWORD) {
          throw new Error("Invalid admin credentials.")
        }

        // Disconnect any existing session
        logoutUser()

        const adminUser = {
          role: "admin",
        }

        setUiAuthSession("ui-admin-token", adminUser)
        login(adminUser)
        navigate("/dashboard")
        return
      }

      // Check if trying admin credentials in Sign in form
      if (!isRegister && formData.email === ADMIN_EMAIL && formData.password === ADMIN_PASSWORD) {
        // Disconnect any existing session
        logoutUser()

        const adminUser = {
          role: "admin",
        }

        setUiAuthSession("ui-admin-token", adminUser)
        login(adminUser)
        navigate("/dashboard")
        return
      }

      // Regular user login/register
      const response = isRegister
        ? await registerUser(formData.username, formData.email, formData.password, "user")
        : await loginUser(formData.email, formData.password)

      if (!isRegister && response?.user?.role !== "user") {
        logoutUser()
        throw new Error("User sign in only. Use Admin role button for admin login.")
      }

      // Add email to registered list if registering
      if (isRegister) {
        const updatedEmails = [...registeredEmails, formData.email.toLowerCase()]
        setRegisteredEmails(updatedEmails)
        localStorage.setItem("registeredEmails", JSON.stringify(updatedEmails))
      }

      login(response.user)
      navigate("/dashboard")
    } catch (error) {
      setError(error.message)
    } finally {
      setFormData((prev) => ({
        ...prev,
        email: "",
        password: "",
      }))
      setIsLoading(false)
    }
  }

  return (
    <div className={`relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 sm:py-10 lg:px-8 ${isDark ? "bg-[#070b11]" : "bg-[#f6efe4]"}`}>
      <style>{`
        @keyframes drift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(0, -18px, 0) scale(1.04); }
        }
        @keyframes rise {
          0% { opacity: 0; transform: translateY(18px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute inset-0 ${isDark
          ? "bg-[radial-gradient(120%_80%_at_20%_10%,#2d3f56_0%,transparent_58%),radial-gradient(100%_70%_at_90%_75%,#2f6f89_0%,transparent_55%),linear-gradient(160deg,#070b11_0%,#0d1826_45%,#0f1b2b_100%)]"
          : "bg-[radial-gradient(120%_80%_at_20%_10%,#ffdd96_0%,transparent_58%),radial-gradient(100%_70%_at_90%_75%,#f8b86c_0%,transparent_55%),linear-gradient(160deg,#f6efe4_0%,#efe3d1_45%,#efe7db_100%)]"
        }`} />
        <div
          className={`absolute -left-20 top-8 h-72 w-72 rounded-full blur-[80px] ${isDark ? "bg-[#2f8fb3]/35" : "bg-[#f2be6f]/45"}`}
          style={{ animation: "drift 8s ease-in-out infinite" }}
        />
        <div
          className={`absolute -right-10 bottom-10 h-80 w-80 rounded-full blur-[110px] ${isDark ? "bg-[#5e7fb1]/25" : "bg-[#d49d65]/35"}`}
          style={{ animation: "drift 11s ease-in-out infinite" }}
        />
        <div
          className={`absolute inset-0 ${isDark ? "opacity-[0.08]" : "opacity-[0.075]"}`}
          style={{
            backgroundImage: isDark
              ? "repeating-linear-gradient(0deg, #9ec4e7 0px, #9ec4e7 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, #9ec4e7 0px, #9ec4e7 1px, transparent 1px, transparent 28px)"
              : "repeating-linear-gradient(0deg, #3b2b1f 0px, #3b2b1f 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, #3b2b1f 0px, #3b2b1f 1px, transparent 1px, transparent 28px)",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div
          className={`grid w-full overflow-hidden rounded-[2rem] border backdrop-blur-xl lg:grid-cols-[1.08fr_1fr] ${isDark
            ? "border-[#9ec4e7]/20 bg-[#0f1c2b]/80 shadow-[0_45px_120px_rgba(4,12,24,0.65)]"
            : "border-[#2a1f15]/20 bg-[#fff9f0]/85 shadow-[0_45px_120px_rgba(51,36,20,0.2)]"
          }`}
          style={{ animation: "rise 0.8s ease-out both" }}
        >
          <section className={`relative hidden overflow-hidden border-r p-10 lg:flex lg:flex-col lg:justify-between ${isDark ? "border-[#9ec4e7]/20" : "border-[#2a1f15]/15"}`}>
            <div className={`pointer-events-none absolute inset-0 ${isDark
              ? "bg-[linear-gradient(130deg,#102237_0%,#0d1725_45%,#142c41_100%)]"
              : "bg-[linear-gradient(130deg,#2f2117_0%,#1f1610_45%,#342417_100%)]"
            }`} />
            <div className={`pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full blur-[80px] ${isDark ? "bg-[#95c4f2]/20" : "bg-[#ffcf84]/15"}`} />
            <div className={`pointer-events-none absolute -bottom-24 -left-14 h-72 w-72 rounded-full blur-[90px] ${isDark ? "bg-[#5d9cd6]/20" : "bg-[#ff9d58]/15"}`} />

            <div className="relative">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#f4c983]/40 bg-gradient-to-br from-[#ffcc86] to-[#d38a49] shadow-[0_12px_26px_rgba(244,172,94,0.45)]">
                  <Sparkles className={`h-5 w-5 ${isDark ? "text-[#112337]" : "text-[#2b1f16]"}`} />
                </div>
                <span className={`text-xs font-semibold uppercase tracking-[0.22em] ${isDark ? "text-[#d7ecff]/85" : "text-[#ffe7c2]/80"}`}>Teamwork Suite</span>
              </div>

              <div className={`mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] ${isDark ? "border-[#8ec4f5]/45 bg-[#82b5e9]/10 text-[#d9ecff]" : "border-[#f9ce95]/35 bg-[#f9ce95]/10 text-[#f8d7ab]"}`}>
                <span className={`h-2 w-2 animate-pulse rounded-full ${isDark ? "bg-[#bee0ff]" : "bg-[#ffd9a8]"}`} />
                Private preview
              </div>

              <h1 className={`max-w-sm text-4xl font-semibold leading-[1.15] tracking-tight ${isDark ? "text-[#edf6ff]" : "text-[#fff4e4]"}`} style={{ fontFamily: '"Cormorant Garamond", "Times New Roman", serif' }}>
                A cleaner command center for premium operations.
              </h1>

              <p className={`mt-4 max-w-sm text-sm leading-7 ${isDark ? "text-[#d2e6fb]/75" : "text-[#f4dcc0]/75"}`}>
                Consolidate products, orders, and payments in one secure workspace designed for fast moving teams.
              </p>
            </div>

            <div className="relative grid gap-3 text-sm">
              <div className={`rounded-2xl border px-4 py-3.5 backdrop-blur-sm ${isDark ? "border-[#92c0ea]/30 bg-[#84b6e5]/10" : "border-[#f6cf9a]/25 bg-[#f6cf9a]/10"}`}>
                <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? "bg-[#84b6e5]/20" : "bg-[#f6cf9a]/20"}`}>
                  <ShieldCheck className={`h-4 w-4 ${isDark ? "text-[#cfe7ff]" : "text-[#ffd59f]"}`} />
                </div>
                <p className={`font-medium ${isDark ? "text-[#e7f3ff]" : "text-[#fff0dd]"}`}>Secure by design</p>
                <p className={`text-xs ${isDark ? "text-[#c8e0f8]/70" : "text-[#f4dcc0]/65"}`}>Role-based controls with session isolation.</p>
              </div>
              <div className={`rounded-2xl border px-4 py-3.5 backdrop-blur-sm ${isDark ? "border-[#92c0ea]/30 bg-[#84b6e5]/10" : "border-[#f6cf9a]/25 bg-[#f6cf9a]/10"}`}>
                <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? "bg-[#84b6e5]/20" : "bg-[#f6cf9a]/20"}`}>
                  <Lock className={`h-4 w-4 ${isDark ? "text-[#cfe7ff]" : "text-[#ffd59f]"}`} />
                </div>
                <p className={`font-medium ${isDark ? "text-[#e7f3ff]" : "text-[#fff0dd]"}`}>Reliable control</p>
                <p className={`text-xs ${isDark ? "text-[#c8e0f8]/70" : "text-[#f4dcc0]/65"}`}>Built for focused teams and daily execution.</p>
              </div>
            </div>
          </section>

          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="space-y-5 px-6 pb-2 pt-10 sm:px-10 sm:pt-12">
              <div className="flex items-center justify-between gap-2 lg:hidden">
                <div className="flex items-center gap-2">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg border bg-gradient-to-br from-[#ffce8d] to-[#df9758] ${isDark ? "border-[#9ac4ea]/30" : "border-[#3a2b1f]/20"}`}>
                    <Sparkles className={`h-4 w-4 ${isDark ? "text-[#112337]" : "text-[#2e2117]"}`} />
                  </div>
                  <span className={`text-xs font-semibold uppercase tracking-[0.22em] ${isDark ? "text-[#c7e0f8]" : "text-[#654630]"}`}>Teamwork Suite</span>
                </div>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${isDark ? "border-[#9ac4ea]/35 bg-[#13273d] text-[#d7ebff] hover:bg-[#17304a]" : "border-[#2f2218]/20 bg-[#f2e6d6] text-[#6b4a31] hover:bg-[#ead8bf]"}`}
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                  title={isDark ? "Light mode" : "Dark mode"}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
              </div>

              <div className="hidden justify-end lg:flex">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${isDark ? "border-[#9ac4ea]/35 bg-[#13273d] text-[#d7ebff] hover:bg-[#17304a]" : "border-[#2f2218]/20 bg-[#f2e6d6] text-[#6b4a31] hover:bg-[#ead8bf]"}`}
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                  title={isDark ? "Light mode" : "Dark mode"}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {isDark ? "Light" : "Dark"}
                </button>
              </div>

              <div className={`flex gap-1 rounded-2xl border p-1 ${isDark ? "border-[#9ec4e7]/20 bg-[#13273d]" : "border-[#2f2218]/15 bg-[#f2e6d6]"}`}>
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError("") }}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    !isRegister && !isAdmin
                      ? isDark
                        ? "bg-[#a8d0f6] text-[#12293d] shadow-[0_10px_20px_rgba(7,16,28,0.5)]"
                        : "bg-[#2e2117] text-[#f9e7cd] shadow-[0_10px_20px_rgba(46,33,23,0.3)]"
                      : isDark
                        ? "text-[#c4ddf5] hover:bg-[#18344f]"
                        : "text-[#6e4b31] hover:bg-[#ebdbc6]"
                  }`}
                >
                  Sign-in
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("register"); setError("") }}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isRegister
                      ? isDark
                        ? "bg-[#a8d0f6] text-[#12293d] shadow-[0_10px_20px_rgba(7,16,28,0.5)]"
                        : "bg-[#2e2117] text-[#f9e7cd] shadow-[0_10px_20px_rgba(46,33,23,0.3)]"
                      : isDark
                        ? "text-[#c4ddf5] hover:bg-[#18344f]"
                        : "text-[#6e4b31] hover:bg-[#ebdbc6]"
                  }`}
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("admin"); setError("") }}
                  aria-label="Admin"
                  title="Admin"
                  className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isAdmin
                      ? isDark
                        ? "bg-[#a8d0f6] text-[#12293d] shadow-[0_10px_20px_rgba(7,16,28,0.5)]"
                        : "bg-[#2e2117] text-[#f9e7cd] shadow-[0_10px_20px_rgba(46,33,23,0.3)]"
                      : isDark
                        ? "text-[#c4ddf5] hover:bg-[#18344f]"
                        : "text-[#6e4b31] hover:bg-[#ebdbc6]"
                  }`}
                >
                  <Crown className="mx-auto h-4 w-4" />
                </button>
              </div>

              <div>
                <CardTitle className={`text-[2rem] font-semibold leading-tight tracking-tight ${isDark ? "text-[#eef6ff]" : "text-[#2e2117]"}`} style={{ fontFamily: '"Cormorant Garamond", "Times New Roman", serif' }}>
                  {isRegister ? "Create your account" : isAdmin ? "Admin access" : "Welcome back"}
                </CardTitle>
                <CardDescription className={`mt-1.5 text-sm ${isDark ? "text-[#bed6ef]" : "text-[#6d4d34]"}`}>
                  {isRegister
                    ? "Fill in your details to unlock the dashboard."
                    : isAdmin
                      ? "Enter your admin credentials to continue."
                      : "Sign in and continue where you left off."}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="px-6 pb-10 pt-4 sm:px-10 sm:pb-12">
              <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                {error && (
                  <Alert variant="destructive" className={`rounded-xl border-red-600/35 bg-red-500/[0.08] ${isDark ? "text-red-200" : "text-red-700"}`}>
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                {isRegister && (
                  <div className="space-y-1.5">
                    <Label htmlFor="username" className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${isDark ? "text-[#bdd7ef]" : "text-[#6a4b33]"}`}>
                      Username
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="yourname"
                      value={formData.username}
                      onChange={handleChange}
                      className={`h-11 rounded-xl ${isDark
                        ? "border-[#9ec4e7]/25 bg-[#102235] text-[#e8f3ff] placeholder:text-[#aac6e4]/60 focus-visible:border-[#8fc3f2] focus-visible:ring-1 focus-visible:ring-[#8fc3f2]/40"
                        : "border-[#3d2c1f]/20 bg-[#fffaf3] text-[#2e2117] placeholder:text-[#8e7058]/60 focus-visible:border-[#b1733f] focus-visible:ring-1 focus-visible:ring-[#b1733f]/40"
                      }`}
                      required={isRegister}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${isDark ? "text-[#bdd7ef]" : "text-[#6a4b33]"}`}>
                    Email address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="off"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`h-11 rounded-xl ${isDark
                      ? "border-[#9ec4e7]/25 bg-[#102235] text-[#e8f3ff] placeholder:text-[#aac6e4]/60 focus-visible:border-[#8fc3f2] focus-visible:ring-1 focus-visible:ring-[#8fc3f2]/40"
                      : "border-[#3d2c1f]/20 bg-[#fffaf3] text-[#2e2117] placeholder:text-[#8e7058]/60 focus-visible:border-[#b1733f] focus-visible:ring-1 focus-visible:ring-[#b1733f]/40"
                    }`}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${isDark ? "text-[#bdd7ef]" : "text-[#6a4b33]"}`}>
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className={`text-xs font-medium transition ${isDark ? "text-[#9cc8f3] hover:text-[#cbe5ff]" : "text-[#8a5830] hover:text-[#6f4222]"}`}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="off"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={`h-11 rounded-xl ${isDark
                      ? "border-[#9ec4e7]/25 bg-[#102235] text-[#e8f3ff] placeholder:text-[#aac6e4]/60 focus-visible:border-[#8fc3f2] focus-visible:ring-1 focus-visible:ring-[#8fc3f2]/40"
                      : "border-[#3d2c1f]/20 bg-[#fffaf3] text-[#2e2117] placeholder:text-[#8e7058]/60 focus-visible:border-[#b1733f] focus-visible:ring-1 focus-visible:ring-[#b1733f]/40"
                    }`}
                    minLength={6}
                    required
                  />
                </div>

                <div className="pt-1">
                  <Button
                    type="submit"
                    className={`group h-11 w-full rounded-xl font-semibold transition-all disabled:opacity-60 ${isDark
                      ? "bg-[#9dc9f5] text-[#11253a] shadow-[0_14px_30px_rgba(8,18,32,0.5)] hover:-translate-y-0.5 hover:bg-[#b2d5fa] hover:shadow-[0_18px_34px_rgba(8,18,32,0.55)]"
                      : "bg-[#2e2117] text-[#f7e4c8] shadow-[0_14px_30px_rgba(46,33,23,0.3)] hover:-translate-y-0.5 hover:bg-[#3a291c] hover:shadow-[0_18px_34px_rgba(46,33,23,0.34)]"
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isRegister ? "Creating account..." : isAdmin ? "Verifying..." : "Signing in..."}
                      </>
                    ) : (
                      <>
                        {isRegister ? "Create account" : isAdmin ? "Continue as admin" : "Continue to dashboard"}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
