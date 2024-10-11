export function renderHome(container, navigate) {
    const homeHtml = `
        <div class="container">
            <h1>Welcome to Flow Forge</h1>
            <p>Create and manage your flows with ease</p>
            <button class="circular-button" id="create-flow">+</button>
        </div>
    `;

    container.innerHTML = homeHtml;

    document.getElementById('create-flow').addEventListener('click', () => {
        navigate('#flows');
    });
}
