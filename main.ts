import { LiveExport } from "LiveExport";
import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
} from "obsidian";

interface GitUrlPluginSetting {
	baseUrl: string;
	resourceBaseUrl: string;
	selected: string;

	// for git path
	repoName: string;
	username: string;
	customURL: string;

	// for live export
	customResourceURL: string;
	attachmentsFolder: string;
}

const DEFAULT_SETTINGS: GitUrlPluginSetting = {
	baseUrl: "",
	selected: "github",
	repoName: "",
	username: "",
	customURL: "",
	resourceBaseUrl: "",
	customResourceURL: "",
	attachmentsFolder: "",
};

export default class GitUrlPlugin extends Plugin {
	settings: GitUrlPluginSetting;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new GitUrlSettingTab(this.app, this));

		// Right click file event
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				menu.addItem((item) => {
					// File's git path to clipboard
					item.setTitle("Copy git path")
						.setIcon("link")
						.onClick(async () => {
							const baseUrl = this.settings.baseUrl;
							navigator.clipboard.writeText(baseUrl + file.path);
							new Notice("Copied to clipboard");
						});
				}).addItem((item) => {
					// File's content with git path resources to clipboard
					item.setTitle("Copy live content")
						.setIcon("link")
						.onClick(async () => {
							if (file instanceof TFile) {
								const LiveExporter = new LiveExport(
									file,
									this.settings.resourceBaseUrl
								);
								const newContent =
									await LiveExporter.getExportString();

								if (!newContent)
									return new Notice(
										"File is too large or not a markdown file"
									);

								navigator.clipboard.writeText(newContent);
								new Notice("Copied to clipboard");
							}
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
			.setName("Custom base url")
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
			.setName("Repo provider option")
			.addDropdown((dropdown) => {
				dropdown.addOption("github", "Github");
				dropdown.addOption("gitlab", "Gitlab");
				dropdown.addOption("custom", "Custom");
				dropdown.setValue(this.plugin.settings.selected);
				dropdown.onChange(async (val) => {
					this.plugin.settings.selected = val;

					this.updateBaseURL();
					this.updateResourceBaseURL();

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

		// Resource URL

		new Setting(containerEl)
			.setName("Base resource url config")
			.setHeading()
			.setDesc("Use to add remote path to resources when live export");

		new Setting(containerEl)
			.setName("Custom resource url")
			.setDesc("Only use when custom in provider above is selected")
			.addText((text) => {
				text.setValue(this.plugin.settings.customURL).onChange(
					async (value: string) => {
						this.plugin.settings.customResourceURL = value;
						await this.plugin.saveSettings();
					}
				);
			});

		new Setting(containerEl)
			.setName("Attachments folder")
			.setDesc(
				"When attachments aren't stored in root, see Settings > Files & Links > Attachments Folder"
			)
			.addText((text) => {
				text.setValue(this.plugin.settings.attachmentsFolder)
					.setPlaceholder("attachments/images/")
					.onChange(async (value: string) => {
						this.plugin.settings.attachmentsFolder = value;
						await this.plugin.saveSettings();
						this.updateResourceBaseURL();
					});
			});

		// Show url in use
		new Setting(containerEl).addButton((button) => {
			button.setButtonText("Show final url");
			button.onClick((e) => {
				new Notice(this.plugin.settings.resourceBaseUrl);
			});
		});
	}

	// HELPERS
	updateBaseURL(): void {
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
			this.plugin.settings.baseUrl = this.plugin.settings.customURL;
		}
	}
	updateResourceBaseURL() {
		const option = this.plugin.settings.selected;
		let username = this.plugin.settings.username;
		let repoName = this.plugin.settings.repoName;

		username = username === "" ? "<username>" : username;
		repoName = repoName === "" ? "<repo-name>" : repoName;

		let tempURL = "";
		if (option === "gitlab") {
			tempURL = `https://gitlab.com/${username}/${repoName}/-/raw/master/`;
		} else if (option === "github") {
		} else if (option === "custom") {
			tempURL = this.plugin.settings.customResourceURL;
		}
		tempURL += this.plugin.settings.attachmentsFolder;
		this.plugin.settings.resourceBaseUrl = tempURL;
		this.plugin.saveSettings();
	}
}
