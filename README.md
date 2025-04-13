# Curly Formatter

A language-agnostic VS Code extension that auto-formats curly brackets on newline and keeps tab indentation.


## ✨ Features

- Moves `{` to a new line automatically
- Preserves the current line's tab indentation
- Supports any language (configurable in settings)
- Works out of the box with `C`, `C++`, and `C#`


## 👋 For C# Users

🟢 **Good news!**  
This extension is no longer needed for C#, thanks to a [Roslyn pull request](https://github.com/dotnet/roslyn/pull/76876) that finally fixed the formatting issue.  
  
> Just install the [official C# extension](https://marketplace.visualstudio.com/items/?itemName=ms-dotnettools.csdevkit) and enable **"Editor: Format On Type"**:
> 1. Navigate to `File → Preferences → Settings`
> 2. Search for "_Format On Type_"
> 3. Enable it


## 🛠 Build instructions

Download and install [Node.js](https://nodejs.org/), then run:
```bash
npm install                  # Install project dependencies
npm install -g @vscode/vsce  # Install the vsce tool
vsce package                 # Package the extension
```
For more information on creating extensions, check out the [VSCode Extension API](https://code.visualstudio.com/api).


## 💖 Support

[![Ko-fi](https://img.shields.io/badge/Support%20me%20on%20Ko--fi-F16061?style=flat&logo=ko-fi&logoColor=white)](https://ko-fi.com/ironcutter24)
