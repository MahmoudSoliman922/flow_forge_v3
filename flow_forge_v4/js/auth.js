// Authentication logic
const auth = {
    isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    },

    login(email, password) {
        // In a real application, you would validate credentials here
        localStorage.setItem('isLoggedIn', 'true');
        window.location.hash = 'home';
    },

    logout() {
        localStorage.removeItem('isLoggedIn');
        window.location.hash = 'login';
    }
};
