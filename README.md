# Curly Formatter
[![Visual Studio](https://img.shields.io/badge/Visual%20Studio%20Marketplace-5C2D91.svg?style=flat&logo=visual-studio&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=Ironcutter24.cscurlyformatter)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/Ironcutter24.cscurlyformatter?label=Downloads&style=flat)](https://marketplace.visualstudio.com/items?itemName=Ironcutter24.cscurlyformatter)
[![Rating](https://img.shields.io/visual-studio-marketplace/stars/Ironcutter24.cscurlyformatter?label=Rating&style=flat)](https://marketplace.visualstudio.com/items?itemName=Ironcutter24.cscurlyformatter)

Maps `Enter` key to formatting actions:
1. Force curly bracket on new line
2. Keep tab indentation on previous lines

Custom languages can be added in extension settings.  
Defaults to `C`, `C++` and `C#`.  

## Build instructions
Download [Node.js](https://nodejs.org/), then run:
```bash
npm install                  # Install project dependencies
npm install -g @vscode/vsce  # Install the vsce tool, which is used to package the extension
vsce package                 # Package the extension
```
For more information on creating extensions, check out the [VSCode Extension API](https://code.visualstudio.com/api).

## Support
[![Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/ironcutter24)
