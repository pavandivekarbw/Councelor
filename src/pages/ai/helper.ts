function formatToHTML(str: string) {
    // convert **bold** to <strong>
    const html = str.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // split by numbers (1., 2., 3., etc.)
    const parts = html.split(/\d+\.\s/).filter(Boolean);

    // wrap as <ol><li>
    const listItems = parts.map((item) => `<li>${item.trim()}</li>`).join("");

    return `<ol>${listItems}</ol>`;
}

export { formatToHTML };
