import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

interface GitUrlPluginSetting {
	baseUrl: string;
	selected: string;

	repoName: string;
	username: string;
	customURL: string;
}

const DEFAULT_SETTINGS: GitUrlPluginSetting = {
	baseUrl: "",
	selected: "github",
	repoName: "",
	username: "",
	customURL: "",
};

export default class GitUrlPlugin extends Plugin {
	settings: GitUrlPluginSetting;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new GitUrlSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				menu.addItem((item) => {
					item.setTitle("Copy git path")
						.setIcon("link")
						.onClick(async () => {
							const baseUrl = this.settings.baseUrl;
							navigator.clipboard.writeText(baseUrl + file.path);
							new Notice("Copied to clipboard");
						});
				});
			})
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class GitUrlSettingTab extends PluginSettingTab {
	plugin: GitUrlPlugin;

	constructor(app: App, plugin: GitUrlPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// URL crafting section
		new Setting(containerEl)
			.setName("Base repo url Config")
			.setHeading()
			.setDesc("Create a base URL for copying git path");

		new Setting(containerEl).setName("Username").addText((text) => {
			text.setValue(this.plugin.settings.username).onChange(
				async (value: string) => {
					this.plugin.settings.username = value;
					await this.plugin.saveSettings();
				}
			);
		});

		new Setting(containerEl).setName("Repo name").addText((text) => {
			text.setValue(this.plugin.settings.repoName).onChange(
				async (value: string) => {
					this.plugin.settings.repoName = value;
					await this.plugin.saveSettings();
				}
			);
		});

		new Setting(containerEl)
			.setName("Custom")
			.setDesc("Only use when custom is selected")
			.addText((text) => {
				text.setValue(this.plugin.settings.customURL)
					.setPlaceholder(
						"https://github.com/<username>/<repo-name>/tree/main/"
					)
					.onChange(async (value: string) => {
						this.plugin.settings.customURL = value;
						await this.plugin.saveSettings();
					});
			});

		// Drop down
		new Setting(containerEl)
			.setHeading()
			.setName("Repo provider option")
			.addDropdown((dropdown) => {
				// Update base url based on selected option
				const updateBaseURL = () => {
					const option = this.plugin.settings.selected;
					let username = this.plugin.settings.username;
					let repoName = this.plugin.settings.repoName;

					username = username === "" ? "<username>" : username;
					repoName = repoName === "" ? "<repo-name>" : repoName;

					// update base repo url
					if (option === "github") {
						this.plugin.settings.baseUrl = `https://github.com/${username}/${repoName}/tree/main/`;
					} else if (option === "gitlab") {
						this.plugin.settings.baseUrl = `https://gitlab.com/${username}/${repoName}/-/blob/master/`;
					} else if (option === "custom") {
						this.plugin.settings.baseUrl =
							this.plugin.settings.customURL;
					}
				};

				dropdown.addOption("github", "Github");
				dropdown.addOption("gitlab", "Gitlab");
				dropdown.addOption("custom", "Custom");
				dropdown.onChange(async (val) => {
					this.plugin.settings.selected = val;

					updateBaseURL();

					await this.plugin.saveSettings();
				});
			});

		// Show url in use
		new Setting(containerEl).addButton((button) => {
			button.setButtonText("Show final url");
			button.onClick((e) => {
				new Notice(this.plugin.settings.baseUrl);
			});
		});
	}
}
