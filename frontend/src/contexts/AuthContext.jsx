import { createContext, useContext, useState, useEffect } from "react"
import { getCurrentUser, isAuthenticated, logoutUser } from "../api/userApi"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    if (isAuthenticated()) {
      const currentUser = getCurrentUser()
      setUser(currentUser)
    }
    setIsLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
  }

  const updateUser = (userData) => {
    setUser(userData)
  }

  const logout = () => {
    logoutUser()
    setUser(null)
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    updateUser,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}