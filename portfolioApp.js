class PortfolioApp {
    constructor(data, renderers, navigationController) {
        this.data = data;
        this.renderers = renderers;
        this.navigationController = navigationController;
    }

    initializeApp() {
        this.renderers.profile.renderProfile(this.data);
        this.renderers.about.renderAbout(this.data);

        this.renderers.skills.renderSkills(
            "technicalSkills",
            this.data.technicalSkills
        );

        this.renderers.skills.renderSkills(
            "softSkills",
            this.data.softSkills
        );

        this.renderers.projects.renderProjects(this.data.projects);

        this.renderers.reflection.renderReflection(
            this.data.reflection,
            this.data.reflectionHighlights
        );

        this.renderers.contact.renderContact(this.data);

        this.navigationController.startNavigation();
    }
}