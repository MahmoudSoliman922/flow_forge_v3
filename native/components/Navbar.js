export function renderNavbar(container, isLoggedIn, navigate) {
    const navHtml = `
        <a href="#" class="brand">Flow Forge</a>
        ${isLoggedIn ? `
            <a href="#">Home</a>
            <a href="#flows">My Flows</a>
            <a href="#manage-flows">Manage Flows</a>
            <a href="#" id="logout">Logout</a>
        ` : `
            <a href="#login">Login</a>
        `}
    `;

    container.innerHTML = navHtml;

    if (isLoggedIn) {
        document.getElementById('logout').addEventListener('click', (e) => {
            e.preventDefault();
            navigate(false);
            window.location.hash = '#login';
        });
    }
}
