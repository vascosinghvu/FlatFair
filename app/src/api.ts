// Fix the BASE_URL by ensuring no trailing slash
const BASE_URL = 'https://flat-fair-api-git-app-3-vasco-singhs-projects.vercel.app';

// Update the fetch functions to properly handle endpoint paths
export const fetchData = async (endpoint: string) => {
  // Ensure endpoint starts with a single slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching data: ', error);
    throw error;
  }
};

export const postData = async (endpoint: string, data: any) => {
  // Ensure endpoint starts with a single slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (error) {
    console.error('Error posting data: ', error);
    throw error;
  }
};

// If you need a default export, add this:
export default {
  fetchData,
  postData
};
