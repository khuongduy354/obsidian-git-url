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
	hasFileExt: boolean;
}

const DEFAULT_SETTINGS: GitUrlPluginSetting = {
	baseUrl: "",
	hasFileExt: true,
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

		new Setting(containerEl)
			.setName("Base Url")
			.setDesc("The base url for your git remote repo")
			.addText((text) =>
				text
					.setPlaceholder(
						"e.g: https://gitlab.com/username/obsidian-notes/-/blob/master/"
					)
					.setValue(this.plugin.settings.baseUrl)
					.onChange(async (value: string) => {
						this.plugin.settings.baseUrl = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Has File Extension")
			.setDesc(
				"Whether the copied link include file extension (.md) or not"
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.hasFileExt)
					.onChange((value: boolean) => {
						this.plugin.settings.hasFileExt = value;
						this.plugin.saveSettings();
					});
			});
	}
}
