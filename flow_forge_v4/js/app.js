// Main application logic
const app = {
    init() {
        this.renderNavbar();
        this.handleRouting();
    },

    renderNavbar() {
        const navbar = document.getElementById('navbar');
        navbar.innerHTML = `
            <div class="container">
                <a href="#" class="logo">Flow Forge</a>
                <div class="nav-links">
                    ${auth.isLoggedIn() ? `
                        <a href="#home">Home</a>
                        <a href="#flows">My Flows</a>
                        <a href="#manage-flows">Manage Flows</a>
                        <a href="#" id="logout">Logout</a>
                    ` : `
                        <a href="#login">Login</a>
                    `}
                </div>
            </div>
        `;

        if (auth.isLoggedIn()) {
            document.getElementById('logout').addEventListener('click', (e) => {
                e.preventDefault();
                auth.logout();
                this.init();
            });
        }
    },

    handleRouting() {
        const content = document.getElementById('content');
        const hash = window.location.hash.slice(1) || 'home';

        if (!auth.isLoggedIn() && hash !== 'login') {
            window.location.hash = 'login';
            return;
        }

        switch (hash) {
            case 'home':
                content.innerHTML = this.homeTemplate();
                break;
            case 'login':
                content.innerHTML = this.loginTemplate();
                this.setupLoginForm();
                break;
            case 'flows':
                content.innerHTML = '<h1>Flow Editor</h1><p>Flow editor component will be implemented here.</p>';
                break;
            case 'manage-flows':
                content.innerHTML = '<h1>Manage Flows</h1><p>Manage flows component will be implemented here.</p>';
                break;
            default:
                content.innerHTML = '<h1>404 Not Found</h1>';
        }
    },

    homeTemplate() {
        return `
            <div class="home">
                <h1>Welcome to Flow Forge</h1>
                <p>Create and manage your flows with ease</p>
                <button id="create-flow">Create New Flow</button>
            </div>
        `;
    },

    loginTemplate() {
        return `
            <div class="login">
                <h1>Login</h1>
                <form id="login-form">
                    <input type="email" id="email" placeholder="Email" required>
                    <input type="password" id="password" placeholder="Password" required>
                    <button type="submit">Login</button>
                </form>
            </div>
        `;
    },

    setupLoginForm() {
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            auth.login(email, password);
            this.init();
        });
    }
};

window.addEventListener('load', () => app.init());
window.addEventListener('hashchange', () => app.handleRouting());
