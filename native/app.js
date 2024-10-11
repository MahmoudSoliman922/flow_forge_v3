import { renderNavbar } from './components/Navbar.js';
import { renderHome } from './components/Home.js';
import { renderLogin } from './components/Login.js';
import { renderFlowEditor } from './components/FlowEditor.js';
import { renderManageFlows } from './components/ManageFlows.js';

const app = document.getElementById('app');
const navbar = document.getElementById('navbar');

let isLoggedIn = false;

function updateAuth(loggedIn) {
    isLoggedIn = loggedIn;
    renderNavbar(navbar, isLoggedIn, navigate);
    navigate(window.location.hash);
}

function navigate(route) {
    const protectedRoutes = ['#flows', '#manage-flows'];
    if (protectedRoutes.includes(route) && !isLoggedIn) {
        window.location.hash = '#login';
        return;
    }

    app.innerHTML = '<div class="loading-spinner"></div>';

    setTimeout(() => {
        switch (route) {
            case '':
            case '#':
                renderHome(app, navigate);
                break;
            case '#login':
                renderLogin(app, updateAuth);
                break;
            case '#flows':
                renderFlowEditor(app);
                break;
            case '#manage-flows':
                renderManageFlows(app);
                break;
            default:
                app.innerHTML = '<h1>404 Not Found</h1>';
        }
    }, 500);
}

window.addEventListener('hashchange', () => navigate(window.location.hash));

updateAuth(false);
navigate(window.location.hash);
