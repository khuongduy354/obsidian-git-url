# Obsidian Git Url Plugin
Copy a file with remote repo's link. Copy content with resources accessible on the internet (Gitlab only). 

## File's remote repo url  
I find it inconvinient to access obsidian files from other devices, especially the ones without Obsidian installed. 

So I leverage [Obsidian Git](https://github.com/denolehov/obsidian-git), and use gitlab as the remote storage.
So accessing https://gitlab.com/username/obsidian-repo/-/blob/master/filename.md, open the file directly on browser. 

This plugin is very simple, it just takes the remote repo url + file_path and add it to your clipboard.

### Usage   
- In settings, type repo name, username. Or, provide full custom URL (e.g above: https://gitlab.com/username/obsidian-repo/-/blob/master/)
- Open file explorer tab in obsdian -> right click on file -> Copy git path
- Paste the link to browser and access the file

## Live Content 
**Note**: Currently, Github is not working, only Gitlab, or provide your custom cloud storage. 
When copy file content (markdown) from obsidian to other platforms, we have to upload resources (images,...) manually.

With this plugin, after configured remote repository, we can copy whole content, and it will replaces images local link to internet link (for e.g https://domain/my_image.png), which is accesible in any markdown renderer. 

### Usage   
- Configure as File's remote url above, and resources location (See Settings > Files & Link > Attachment folder path)
- Open file explorer tab in obsdian -> right click on file -> Copy live content 
- Paste content in any markdown renderer (for e.g Stackedit), and images should load. 
