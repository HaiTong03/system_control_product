const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/users"

const handleApiResponse = async (response) => {
  const text = await response.text()
  let data

  try {
    data = text ? JSON.parse(text) : {}
  } catch (e) {
    data = { error: text || response.statusText }
  }

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`)
  }

  return data
}

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await handleApiResponse(response)

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
    }

    return data
  } catch (error) {
    throw error
  }
}

export const registerUser = async (username, email, password, role = "user") => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password, role }),
    })

    const data = await handleApiResponse(response)

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
    }

    return data
  } catch (error) {
    throw error
  }
}

export const logoutUser = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

export const getCurrentUser = () => {
  const user = localStorage.getItem("user")
  return user ? JSON.parse(user) : null
}

export const getToken = () => {
  return localStorage.getItem("token")
}

export const setUiAuthSession = (token, user) => {
  if (token) {
    localStorage.setItem("token", token)
  }
  if (user) {
    localStorage.setItem("user", JSON.stringify(user))
  }
}

export const isAuthenticated = () => {
  return !!getToken()
}

export const updateProfile = async (username, email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ username, email }),
    })

    const data = await handleApiResponse(response)

    // Update stored user data
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user))
    }

    return data
  } catch (error) {
    throw error
  }
}