export function renderLogin(container, updateAuth) {
    const loginHtml = `
        <div class="container">
            <h1>Login</h1>
            <form id="login-form">
                <input type="text" id="username" placeholder="Username" required>
                <input type="password" id="password" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>
        </div>
    `;

    container.innerHTML = loginHtml;

    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Simulate login (replace with actual authentication logic)
        if (username && password) {
            updateAuth(true);
            window.location.hash = '#';
        }
    });
}
