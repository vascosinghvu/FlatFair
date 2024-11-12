export const api: any = {
  get: async (route: string): Promise<any> => {
    const url = `${process.env.REACT_APP_API_URL as string}${route}`
    const token = localStorage.getItem("token")

    console.log("Token being sent:", token)

    return await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ''
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          console.error('Response status:', res.status)
          const errorText = await res.text()
          console.error('Error details:', errorText)
          
          if (res.status === 401) {
            localStorage.removeItem("token")
            // window.location.href = '/login'
          }
          throw new Error(`Server error: ${res.status}`)
        }
        return res.json()
      })
      .catch((err) => {
        console.error("Error fetching data: ", err)
        throw err
      })
  },

  post: async (route: string, payload: any): Promise<any> => {
    const url = `${process.env.REACT_APP_API_URL as string}${route}`
    const token = localStorage.getItem("token")

    console.log("Making POST request to:", url)
    console.log("With payload:", payload)

    return await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const data = await res.json()
        console.log("Response from server:", data)

        if (!res.ok) {
          console.error('Error response:', data)
          throw new Error(data.message || `Server error: ${res.status}`)
        }

        if (data.token) {
          console.log("Saving token:", data.token)
          localStorage.setItem("token", data.token)
        }
        return data
      })
      .catch((err) => {
        console.error("Error in request:", err)
        throw err
      })
  },
  
  // async
  put: async (route: string, data: any): Promise<any> => {
    const url = `${process.env.REACT_APP_API_URL as string}${route}`

    return await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(data)
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok")
        }
        const json = await res.json()
        return {
          data: json,
          status: res.status,
        }
      })
      .catch((err) => {
        console.error("Error updating data: ", err)
        throw err
      })
  },

  delete: async (route: string, data: any): Promise<any> => {
    const url = `${process.env.REACT_APP_API_URL as string}${route}`

    return await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(data)
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok")
        }
        const json = await res.json()
        return {
          data: json,
          status: res.status,
        }
      })
      .catch((err) => {
        console.error("Error deleting data: ", err)
        throw err
      })
  },
}
