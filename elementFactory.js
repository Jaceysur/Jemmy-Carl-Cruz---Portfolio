class ElementFactory {
    constructor(documentContext) {
        this.document = documentContext;
    }

    createElement(tagName, options = {}) {
        const element = this.document.createElement(tagName);

        if (options.className) {
            element.className = options.className;
        }

        if (options.text) {
            element.textContent = options.text;
        }

        if (options.href) {
            element.href = options.href;
        }

        return element;
    }

    createExternalLink(text, url, className = "") {
        const link = this.createElement("a", {
            text: text,
            href: url,
            className: className
        });

        link.target = "_blank";
        link.rel = "noopener noreferrer";

        return link;
    }
}