import { TFile } from "obsidian";

export class LiveExport {
	resourceBaseUrl: string = "";
	file: TFile;

	constructor(file: TFile, resourceBaseUrl: string = "") {
		this.file = file;
		this.resourceBaseUrl = resourceBaseUrl;
	}

	isFileValid() {
		const isMD = this.file.extension === "md";
		const isSizeValid = this.file.stat.size < 1000000;

		return isMD && isSizeValid;
	}
	replaceResourcesLink(content: string, resourceBaseUrl: string) {
		const resourceRegex = /!\[\[(.*)\]\]/g;

		content = content.replace(resourceRegex, function (match, g1) {
			if (!resourceBaseUrl.endsWith("/") && !g1.startsWith("/"))
				resourceBaseUrl += "/";

			let replaceStr = "![](" + resourceBaseUrl + g1 + ")";
			replaceStr = replaceStr.replace(/ /g, "%20");

			return replaceStr;
		});
		return content;
	}
	async getExportString() {
		const content = await this.file.vault.cachedRead(this.file);

		if (!this.isFileValid()) return null;

		const newContent = this.replaceResourcesLink(
			content,
			this.resourceBaseUrl
		);

		return newContent;
	}
}
