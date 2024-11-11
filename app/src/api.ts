export const api: any = {
  get: async (route: string): Promise<any> => {
    const url = `${process.env.REACT_APP_API_URL as string}${route}`
    const token = localStorage.getItem("token");

    return await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ''
      }
    })
    .then(async (res) => {
      if (!res.ok) {
        throw new Error("Network response was not ok")
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

    return await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok")
        }
        return res.json()
      })
      .catch((err) => {
        console.error("Error posting data: ", err)
        throw err
      })
  },

  put: async (route: string, data: any): Promise<any> => {
    const url = `${process.env.REACT_APP_API_URL as string}${route}`

    return await fetch(url, {
      method: "PUT",
      credentials: "include",
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
      credentials: "include",
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
