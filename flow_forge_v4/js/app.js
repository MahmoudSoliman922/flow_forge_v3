// Main application logic
const app = {
    flows: [],

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
                this.setupCreateFlowButton();
                break;
            case 'login':
                content.innerHTML = this.loginTemplate();
                this.setupLoginForm();
                break;
            case 'flows':
                content.innerHTML = this.flowsTemplate();
                break;
            case 'manage-flows':
                content.innerHTML = this.manageFlowsTemplate();
                this.setupManageFlowsHandlers();
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

    flowsTemplate() {
        return `
            <div class="flows">
                <h1 class="text-4xl font-bold text-purple-400 mb-8">My Flows</h1>
                ${this.flows.length > 0 ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${this.flows.map(flow => `
                            <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
                                <h2 class="text-2xl font-semibold text-purple-300 mb-4">${flow.name}</h2>
                                <p class="text-gray-400 mb-4">Last edited: ${new Date(flow.id).toLocaleDateString()}</p>
                                <button class="edit-flow bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded" data-id="${flow.id}">
                                    Edit Flow
                                </button>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-xl text-gray-300">You have no flows yet. Create one from the home page!</p>'}
            </div>
        `;
    },

    manageFlowsTemplate() {
        return `
            <div class="manage-flows">
                <h1 class="text-4xl font-bold text-purple-400 mb-8">Manage Flows</h1>
                ${this.flows.length > 0 ? `
                    <div class="overflow-x-auto">
                        <table class="min-w-full bg-gray-800 text-white">
                            <thead>
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Edited</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.flows.map(flow => `
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap">${flow.name}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">${new Date(flow.id).toLocaleDateString()}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <button class="edit-flow bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded mr-2" data-id="${flow.id}">Edit</button>
                                            <button class="delete-flow bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded" data-id="${flow.id}">Delete</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : '<p class="text-xl text-gray-300">You have no flows to manage.</p>'}
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
    },

    setupCreateFlowButton() {
        const createFlowButton = document.getElementById('create-flow');
        createFlowButton.addEventListener('click', () => {
            const flowName = prompt('Enter a name for your new flow:');
            if (flowName) {
                const newFlow = {
                    id: Date.now(),
                    name: flowName
                };
                this.flows.push(newFlow);
                alert('Flow created successfully!');
                window.location.hash = 'flows';
            }
        });
    },

    setupManageFlowsHandlers() {
        const editButtons = document.querySelectorAll('.edit-flow');
        const deleteButtons = document.querySelectorAll('.delete-flow');

        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const flowId = parseInt(e.target.getAttribute('data-id'));
                const flow = this.flows.find(f => f.id === flowId);
                const newName = prompt('Enter a new name for the flow:', flow.name);
                if (newName) {
                    flow.name = newName;
                    this.handleRouting();
                }
            });
        });

        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const flowId = parseInt(e.target.getAttribute('data-id'));
                if (confirm('Are you sure you want to delete this flow?')) {
                    this.flows = this.flows.filter(f => f.id !== flowId);
                    this.handleRouting();
                }
            });
        });
    }
};

window.addEventListener('load', () => app.init());
window.addEventListener('hashchange', () => app.handleRouting());
