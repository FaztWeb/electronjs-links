// DOM Elements
const linksSection = document.querySelector('.links')
const errorMessage = document.querySelector('.error-message')
const newLinkForm = document.querySelector('.new-link-form')
const newLinkURL = document.querySelector('.new-link-url')
const newLinkButton = document.querySelector('.new-link-button')
const clearStorageButton = document.querySelector('.clear-storage')

// APIS
const parser = new DOMParser();
const { shell } = require('electron')

const parserResponse = text => {
    return parser.parseFromString(text, 'text/html');
};
const findTitle = (nodes) => {
    return nodes.querySelector('title').innerText;
};

// Local Storage
const storeLink = (title, url) => {
    localStorage.setItem(url, JSON.stringify({ title, url }));
};

const getLinks = () => {
    return Object.keys(localStorage)
        .map(key => JSON.parse(localStorage.getItem(key)));
};

// Create HTML Elements
const createLinkElement = link => {
    return `
        <div class="link">
            <h3>${link.title}</h3>
            <p>
                <a href="${link.url}">${link.url}</a>
            </p>
        </div>
    `;
};

const renderLinks = () => {
    const linkElements = getLinks().map(createLinkElement).join('');
    linksSection.innerHTML = linkElements;
};

// Element's Events
renderLinks();

newLinkURL.addEventListener('keyup', () => {
    newLinkButton.disabled = !newLinkURL.validity.valid;
});

const clearForm = () => {
    newLinkURL.value = null;
};

const handleError = (error, url) => {
    errorMessage.innerHTML = `
        There was an issue adding "${url}": ${error.message}
    `.trim();
    setTimeout(() => {
        errorMessage.innerText = null;
    }, 5000);
};

const validateResponse = response => {
    if (response.ok) { return response; }
    throw new Error(`Status Code of ${response.status} ${response.statusText}`);
};

newLinkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = newLinkURL.value;
    // Make a Request to the URL
    try {
        let response = await fetch(url);
        response = validateResponse(response);
        // Convert the Promise Response to a Text (because is a website)
        const text = await response.text();
        // Use the Chromium DOM Parser, to convert to a DOM
        const html = parserResponse(text);
        const title = findTitle(html);
        storeLink(title, url);
        clearForm();
        renderLinks();
    } catch (e) {
        handleError(e, url);
    }
});

clearStorageButton.addEventListener('click', () => {
    localStorage.clear();
    linksSection.innerHTML = '';
})

linksSection.addEventListener('click', (e) => {
    if (e.target.href) {
        e.preventDefault();
        shell.openExternal(e.target.href);
    }
})