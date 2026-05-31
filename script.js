document.addEventListener("DOMContentLoaded", () => {
    const domService = new DomService(document);
    const elementFactory = new ElementFactory(document);

    const socialLinkRenderer = new SocialLinkRenderer(
        domService,
        elementFactory
    );

    const renderers = {
        profile: new ProfileRenderer(domService),
        about: new AboutRenderer(domService),
        skills: new SkillRenderer(domService, elementFactory),
        projects: new ProjectRenderer(domService, elementFactory),
        reflection: new ReflectionRenderer(domService, elementFactory),
        contact: new ContactRenderer(domService, socialLinkRenderer)
    };

    const navigationController = new NavigationController(domService);

    const app = new PortfolioApp(
        portfolioData,
        renderers,
        navigationController
    );

    initializeScrollAnimation();
    initializeEmailJsForm();
    initializeThemeToggle();

    app.initializeApp();
});

function initializeScrollAnimation() {
    const scrollElements = document.querySelectorAll(".scroll-animate");

    const scrollObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                }
            });
        },
        {
            threshold: 0.18
        }
    );

    scrollElements.forEach((element) => {
        scrollObserver.observe(element);
    });
}

function initializeEmailJsForm() {
    const contactForm = document.getElementById("contactForm");
    const formStatus = document.getElementById("formStatus");
    const sendMessageButton = document.getElementById("sendMessageButton");

    if (!contactForm) {
        return;
    }

    emailjs.init({
        publicKey: "JGrBi75LrRCBXKz3o"
    });

    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();

        sendMessageButton.disabled = true;
        sendMessageButton.textContent = "Sending...";
        formStatus.textContent = "";
        formStatus.className = "form-status";

        emailjs.sendForm(
            "service_brla6n1",
            "template_9wts56x",
            contactForm
        )
        .then(() => {
formStatus.textContent = "Message sent successfully!";
formStatus.className = "form-status success show";
contactForm.reset();

setTimeout(() => {
    formStatus.className = "form-status";
    formStatus.textContent = "";
}, 4000);
        })
        .catch((error) => {
formStatus.textContent = "Message failed to send. Please try again.";
formStatus.className = "form-status error show";

setTimeout(() => {
    formStatus.className = "form-status";
    formStatus.textContent = "";
}, 4000);
        })
        .finally(() => {
            sendMessageButton.disabled = false;
            sendMessageButton.textContent = "Send Message";
        });
    });
}

function initializeThemeToggle() {
    const themeToggleButton = document.getElementById("themeToggleButton");
    const themeToggleIcon = document.getElementById("themeToggleIcon");

    if (!themeToggleButton || !themeToggleIcon) {
        return;
    }

    const moonIconUrl = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/moon-stars-fill.svg";
    const sunIconUrl = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/sun-fill.svg";

    const savedTheme = localStorage.getItem("portfolioTheme");

    if (savedTheme === "dark") {
        applyDarkMode(themeToggleIcon, sunIconUrl);
    } else {
        applyLightMode(themeToggleIcon, moonIconUrl);
    }

    themeToggleButton.addEventListener("click", () => {
        const isDarkMode = document.body.classList.contains("dark-mode");

        if (isDarkMode) {
            applyLightMode(themeToggleIcon, moonIconUrl);
            localStorage.setItem("portfolioTheme", "light");
        } else {
            applyDarkMode(themeToggleIcon, sunIconUrl);
            localStorage.setItem("portfolioTheme", "dark");
        }
    });
}

function applyDarkMode(themeToggleIcon, sunIconUrl) {
    document.body.classList.add("dark-mode");
    themeToggleIcon.src = sunIconUrl;
    themeToggleIcon.alt = "Light mode icon";
}

function applyLightMode(themeToggleIcon, moonIconUrl) {
    document.body.classList.remove("dark-mode");
    themeToggleIcon.src = moonIconUrl;
    themeToggleIcon.alt = "Dark mode icon";
}