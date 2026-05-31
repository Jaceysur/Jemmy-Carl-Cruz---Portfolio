class DomService {
    constructor(documentContext) {
        this.document = documentContext;
    }

    getElementById(id) {
        return this.document.getElementById(id);
    }

    getElementsBySelector(selector) {
        return Array.from(this.document.querySelectorAll(selector));
    }

    getElementBySelector(selector) {
        return this.document.querySelector(selector);
    }

    setElementText(id, value) {
        const element = this.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }

    setElementLink(id, text, url) {
        const link = this.getElementById(id);

        if (link) {
            link.textContent = text;
            link.href = url;
        }
    }

    clearElement(element) {
        if (element) {
            element.textContent = "";
        }
    }
}