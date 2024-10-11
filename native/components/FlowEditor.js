export function renderFlowEditor(container) {
    const editorHtml = `
        <div class="container">
            <h1>Flow Editor</h1>
            <p>This is where you can create and edit your flows.</p>
        </div>
    `;

    container.innerHTML = editorHtml;
}
