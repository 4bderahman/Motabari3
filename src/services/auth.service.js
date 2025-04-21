// Add this function to handle login
const login = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password
    });

    if (response.data.token) {
      const userData = {
        ...response.data.user,
        token: response.data.token
      };
      localStorage.setItem('user', JSON.stringify(userData));
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add this function to check if user is logged in
const isLoggedIn = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}; 