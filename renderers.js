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

        if (!container) {
            return;
        }

        this.dom.clearElement(container);

        const hasCategories = skills.some((skill) => {
            return typeof skill === "object" && skill.category;
        });

        if (hasCategories && containerId === "technicalSkills") {
            this.renderGroupedSkills(container, skills);
            return;
        }

        this.renderInlineSkills(container, skills);
    }

    renderGroupedSkills(container, skills) {
        const groupedSkills = this.groupSkillsByCategory(skills);

        Object.keys(groupedSkills).forEach((category) => {
            const categoryBlock = this.elementFactory.createElement("div", {
                className: "skill-category-block"
            });

            const categoryTitle = this.elementFactory.createElement("h4", {
                className: "skill-category-title",
                text: category
            });

            const skillRow = this.elementFactory.createElement("div", {
                className: "skill-category-row"
            });

            groupedSkills[category].forEach((skill) => {
                const skillElement = this.createSkillElement(skill);
                skillRow.appendChild(skillElement);
            });

            categoryBlock.append(categoryTitle, skillRow);
            container.appendChild(categoryBlock);
        });
    }

    renderInlineSkills(container, skills) {
        skills.forEach((skill) => {
            const skillElement = this.createSkillElement(skill);
            container.appendChild(skillElement);
        });
    }

    groupSkillsByCategory(skills) {
        return skills.reduce((groups, skill) => {
            const skillData = this.normalizeSkill(skill);
            const category = skillData.category || "Others";

            if (!groups[category]) {
                groups[category] = [];
            }

            groups[category].push(skillData);

            return groups;
        }, {});
    }

    createSkillElement(skill) {
        const skillData = this.normalizeSkill(skill);

        const skillElement = this.elementFactory.createElement("div", {
            className: "skill-inline-item"
        });

        if (skillData.logo) {
            const skillLogo = this.elementFactory.createElement("img", {
                className: "skill-inline-logo"
            });

            skillLogo.src = skillData.logo;
            skillLogo.alt = `${skillData.name} logo`;

            skillElement.appendChild(skillLogo);
        }

        const skillName = this.elementFactory.createElement("span", {
            className: "skill-inline-text",
            text: skillData.name
        });

        skillElement.appendChild(skillName);

        return skillElement;
    }

    normalizeSkill(skill) {
        if (typeof skill === "string") {
            return {
                name: skill,
                category: "",
                logo: ""
            };
        }

        return {
            name: skill.name || "",
            category: skill.category || "",
            logo: skill.logo || skill.icon || ""
        };
    }
}

class ContactRenderer {
    constructor(domService, socialLinkRenderer) {
        this.dom = domService;
        this.socialLinkRenderer = socialLinkRenderer;
    }

    renderContact(data) {
        this.dom.setElementLink("email", data.email, `mailto:${data.email}`);

        const phoneElement = this.dom.getElementById("phone");

        if (phoneElement) {
            this.dom.setElementText("phone", data.phone);
        }

        this.dom.setElementText("footerName", data.name);
        this.dom.setElementText("footerYear", new Date().getFullYear());

        this.socialLinkRenderer.renderSocialLinks(data.socialLinks || []);
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
            const socialRow = this.createSocialRow(socialLink);
            socialLinksContainer.appendChild(socialRow);
        });
    }

    createSocialRow(socialLink) {
        const socialRow = document.createElement("div");
        socialRow.className = "simple-social-row";

        const iconBox = document.createElement("div");
        iconBox.className = "simple-social-icon";

        if (socialLink.icon) {
            const icon = document.createElement("img");
            icon.className = "social-icon";
            icon.src = socialLink.icon;
            icon.alt = `${socialLink.name} icon`;

            iconBox.appendChild(icon);
        }

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

        return socialRow;
    }
}

class ProjectRenderer {
    constructor(domService, elementFactory) {
        this.dom = domService;
        this.elementFactory = elementFactory;
    }

    renderProjects(projects) {
        const projectList = this.dom.getElementById("projectList");

        if (!projectList) {
            return;
        }

        this.dom.clearElement(projectList);

        const groupedProjects = this.groupProjectsByCategory(projects);

        Object.keys(groupedProjects).forEach((category) => {
            const categorySection = this.createProjectCategorySection(
                category,
                groupedProjects[category]
            );

            projectList.appendChild(categorySection);
        });
    }

    groupProjectsByCategory(projects) {
        return projects.reduce((groups, project) => {
            const category = project.category || "Projects";

            if (!groups[category]) {
                groups[category] = [];
            }

            groups[category].push(project);

            return groups;
        }, {});
    }

    createProjectCategorySection(category, projects) {
        const wrapper = this.elementFactory.createElement("div", {
            className: "project-category-section"
        });

        const header = this.elementFactory.createElement("div", {
            className: "project-category-header"
        });

        const title = this.elementFactory.createElement("h3", {
            text: category
        });

        const count = this.elementFactory.createElement("span", {
            text: `${projects.length} Output${projects.length > 1 ? "s" : ""}`
        });

        header.append(title);

        const row = this.elementFactory.createElement("div", {
            className: "row g-4"
        });

        projects.forEach((project) => {
            const projectColumn = this.createProjectColumn(project);
            row.appendChild(projectColumn);
        });

        wrapper.append(header, row);

        return wrapper;
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
        className: "project-visual-image"
    });

    const image = this.elementFactory.createElement("img", {
        className: "project-image"
    });

    image.src = project.image;
    image.alt = `${project.title} preview`;

    visual.appendChild(image);

    return visual;
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

        const toolList = this.createToolList(project.tools || []);

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
        const toolData = this.normalizeTool(tool);

        const toolElement = this.elementFactory.createElement("span", {
            className: "tool tool-item"
        });

        if (toolData.logo) {
            const toolLogo = this.elementFactory.createElement("img", {
                className: "tool-logo"
            });

            toolLogo.src = toolData.logo;
            toolLogo.alt = `${toolData.name} logo`;

            toolElement.appendChild(toolLogo);
        }

        const toolName = this.elementFactory.createElement("span", {
            text: toolData.name
        });

        toolElement.appendChild(toolName);

        return toolElement;
    }

    normalizeTool(tool) {
        if (typeof tool === "string") {
            return {
                name: tool,
                logo: ""
            };
        }

        return {
            name: tool.name || "",
            logo: tool.logo || tool.icon || ""
        };
    }
}

class ReflectionRenderer {
    constructor(domService, elementFactory) {
        this.dom = domService;
        this.elementFactory = elementFactory;
    }

    renderReflection(reflection, highlights) {
        this.renderParagraphs(reflection || "");
        this.renderHighlights(highlights || []);
    }

    renderParagraphs(reflection) {
        const container = this.dom.getElementById("reflectionText");

        if (!container) {
            return;
        }

        this.dom.clearElement(container);

        reflection.split("\n\n").forEach((paragraphText) => {
            const trimmedText = paragraphText.trim();

            if (!trimmedText) {
                return;
            }

            const paragraph = this.elementFactory.createElement("p", {
                text: trimmedText
            });

            container.appendChild(paragraph);
        });
    }

    renderHighlights(highlights) {
        const container = this.dom.getElementById("reflectionHighlights");

        if (!container) {
            return;
        }

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