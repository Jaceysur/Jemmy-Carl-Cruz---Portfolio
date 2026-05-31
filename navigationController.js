class NavigationController {
    constructor(domService) {
        this.dom = domService;

        this.links = this.dom.getElementsBySelector(".nav-link");

        this.sections = this.links
            .map((link) => this.dom.getElementBySelector(link.getAttribute("href")))
            .filter(Boolean);
    }

    startNavigation() {
        const observer = new IntersectionObserver(
            (entries) => this.updateActiveLink(entries),
            {
                threshold: 0.45
            }
        );

        this.sections.forEach((section) => {
            observer.observe(section);
        });
    }

    updateActiveLink(entries) {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            const activeId = `#${entry.target.id}`;

            this.links.forEach((link) => {
                link.classList.toggle(
                    "active",
                    link.getAttribute("href") === activeId
                );
            });
        });
    }
}