class ProfileRenderer {
    constructor(domService) {
        this.dom = domService;
    }

    renderProfile(data) {
        this.dom.setElementText("navName", data.name);
        this.dom.setElementText("studentName", data.name);
        this.dom.setElementText("profileName", data.name);
        this.dom.setElementText("profileDescription", `${data.course} | ${data.yearLevel}`);
        this.dom.setElementText("school", data.school);
        this.dom.setElementText("course", data.course);
        this.dom.setElementText("yearLevel", data.yearLevel);
        this.dom.setElementText("intro", data.intro);
    }
}

class AboutRenderer {
    constructor(domService) {
        this.dom = domService;
    }

    renderAbout(data) {
        this.dom.setElementText("aboutText", data.about);
        this.dom.setElementText("careerObjective", data.careerObjective);
    }
}

class SkillRenderer {
    constructor(domService, elementFactory) {
        this.dom = domService;
        this.elementFactory = elementFactory;
    }

    renderSkills(containerId, skills) {
        const container = this.dom.getElementById(containerId);
        this.dom.clearElement(container);

        skills.forEach((skill) => {
            const skillElement = this.createSkillElement(skill);
            container.appendChild(skillElement);
        });
    }

    createSkillElement(skill) {
        const skillElement = this.elementFactory.createElement("span", {
            className: "tag skill-item"
        });

        const skillLogo = this.elementFactory.createElement("img", {
            className: "skill-logo"
        });

        skillLogo.src = skill.logo;
        skillLogo.alt = `${skill.name} logo`;

        const skillName = this.elementFactory.createElement("span", {
            text: skill.name
        });

        skillElement.append(skillLogo, skillName);

        return skillElement;
    }
}

class ContactRenderer {
    constructor(domService, socialLinkRenderer) {
        this.dom = domService;
        this.socialLinkRenderer = socialLinkRenderer;
    }

    renderContact(data) {
        this.dom.setElementLink("email", data.email, `mailto:${data.email}`);
        this.dom.setElementText("phone", data.phone);
        this.dom.setElementText("footerName", data.name);
        this.dom.setElementText("footerYear", new Date().getFullYear());

        this.socialLinkRenderer.renderSocialLinks(data.socialLinks);
    }
}

class SocialLinkRenderer {
    constructor(domService, elementFactory) {
        this.domService = domService;
        this.elementFactory = elementFactory;
    }

    renderSocialLinks(socialLinks) {
        const socialLinksContainer = this.domService.getElementById("socialLinks");

        if (!socialLinksContainer) {
            return;
        }

        socialLinksContainer.innerHTML = "";

        socialLinks.forEach((socialLink) => {
            const socialRow = document.createElement("div");
            socialRow.className = "simple-social-row";

            const iconBox = document.createElement("div");
            iconBox.className = "simple-social-icon";

            const icon = document.createElement("img");
            icon.className = "social-icon";
            icon.src = socialLink.icon;
            icon.alt = `${socialLink.name} icon`;

            iconBox.appendChild(icon);

            const textBox = document.createElement("div");

            const label = document.createElement("span");
            label.textContent = socialLink.name;

            const link = document.createElement("a");
            link.href = socialLink.url;
            link.textContent = socialLink.url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            textBox.appendChild(label);
            textBox.appendChild(link);

            socialRow.appendChild(iconBox);
            socialRow.appendChild(textBox);

            socialLinksContainer.appendChild(socialRow);
        });
    }
}

class ProjectRenderer {
    constructor(domService, elementFactory) {
        this.dom = domService;
        this.elementFactory = elementFactory;
    }

    renderProjects(projects) {
        const projectList = this.dom.getElementById("projectList");
        this.dom.clearElement(projectList);

        projects.forEach((project) => {
            const projectColumn = this.createProjectColumn(project);
            projectList.appendChild(projectColumn);
        });
    }

    createProjectColumn(project) {
        const column = this.elementFactory.createElement("div", {
            className: "col-lg-6"
        });

        const card = this.elementFactory.createElement("article", {
            className: "project-card"
        });

        card.appendChild(this.createProjectVisual(project));
        card.appendChild(this.createProjectBody(project));

        column.appendChild(card);

        return column;
    }

    createProjectVisual(project) {
        const visual = this.elementFactory.createElement("div", {
            className: `project-visual ${project.visualTheme}`
        });

        const logoWrapper = this.elementFactory.createElement("div", {
            className: "project-logo-wrapper"
        });

        const logo = this.elementFactory.createElement("img", {
            className: "project-logo"
        });

        logo.src = project.logo;
        logo.alt = `${project.visualTitle} logo`;

        const title = this.elementFactory.createElement("span", {
            className: "visual-title",
            text: project.visualTitle
        });

        logoWrapper.appendChild(logo);
        visual.append(logoWrapper, title);

        return visual;
    }

    createVisualBars() {
        const bars = this.elementFactory.createElement("div", {
            className: "visual-bars"
        });

        for (let index = 0; index < 3; index += 1) {
            bars.appendChild(this.elementFactory.createElement("i"));
        }

        return bars;
    }

    createProjectBody(project) {
        const body = this.elementFactory.createElement("div", {
            className: "project-body"
        });

        const title = this.elementFactory.createElement("h3", {
            text: project.title
        });

        const description = this.elementFactory.createElement("p", {
            text: project.description
        });

        const toolList = this.createToolList(project.tools);

        const repository = this.elementFactory.createExternalLink(
            "View Repository",
            project.repository,
            "btn primary-button"
        );

        body.append(title, description, toolList, repository);

        return body;
    }

    createToolList(tools) {
        const list = this.elementFactory.createElement("div", {
            className: "tool-list"
        });

        tools.forEach((tool) => {
            const toolElement = this.createToolElement(tool);
            list.appendChild(toolElement);
        });

        return list;
    }

    createToolElement(tool) {
        const toolElement = this.elementFactory.createElement("span", {
            className: "tool tool-item"
        });

        const toolLogo = this.elementFactory.createElement("img", {
            className: "tool-logo"
        });

        toolLogo.src = tool.logo;
        toolLogo.alt = `${tool.name} logo`;

        const toolName = this.elementFactory.createElement("span", {
            text: tool.name
        });

        toolElement.append(toolLogo, toolName);

        return toolElement;
    }
}

class ReflectionRenderer {
    constructor(domService, elementFactory) {
        this.dom = domService;
        this.elementFactory = elementFactory;
    }

    renderReflection(reflection, highlights) {
        this.renderParagraphs(reflection);
        this.renderHighlights(highlights);
    }

    renderParagraphs(reflection) {
        const container = this.dom.getElementById("reflectionText");
        this.dom.clearElement(container);

        reflection.split("\n\n").forEach((paragraphText) => {
            const paragraph = this.elementFactory.createElement("p", {
                text: paragraphText
            });

            container.appendChild(paragraph);
        });
    }

    renderHighlights(highlights) {
        const container = this.dom.getElementById("reflectionHighlights");
        this.dom.clearElement(container);

        highlights.forEach((highlight) => {
            const item = this.elementFactory.createElement("article", {
                className: "highlight-item"
            });

            const title = this.elementFactory.createElement("strong", {
                text: highlight.title
            });

            const text = this.elementFactory.createElement("span", {
                text: highlight.text
            });

            item.append(title, text);
            container.appendChild(item);
        });
    }
}