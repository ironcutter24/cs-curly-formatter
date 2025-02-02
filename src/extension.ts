import * as vscode from 'vscode';

enum CursorDirection {
    up = "cursorUp",
    down = "cursorDown",
    left = "cursorLeft",
    right = "cursorRight"
}

// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Retrieve VSCode configuration
    getConfig();

    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('cscurlyformatter.curlyformat', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return false;            
        }

        if (!isCursorAtZeroPosition(editor) && isCursorBetweenCurly(editor)) {
            manualFormat();   
        }
        else {
            autoCompleteOrNewLine(editor);
        }
    });
    context.subscriptions.push(disposable);
}

async function autoCompleteOrNewLine(editor: vscode.TextEditor) {
    var cursorPos = editor.document.offsetAt(editor.selection.active);
    if (hasSuggestionOnEnter()) {
        await execute("acceptSelectedSuggestion");

        if (cursorPos !== editor.document.offsetAt(editor.selection.active)) {
            return;   
        }
    }
    await type('\n');
    await convertIndentation();
}

export function deactivate() { }


// *************** //
// Text formatting //
// *************** //

async function manualFormat() {
    await move(CursorDirection.left);
    await type('\n');
    await move(CursorDirection.right);
    await type('\n\n');
    await move(CursorDirection.up);
    await indent();
}

async function indent() {
    await type(hasAutoTab() ? '\t' : ' '.repeat(getTabSize()));
}

async function convertIndentation() {
    var action = hasAutoTab() ? "indentationToTabs" : "indentationToSpaces";
    await execute("editor.action." + action);
}


// ******************* //
// Commands shorthands //
// ******************* //

async function move(dir: CursorDirection) {
    await execute(dir);
}

async function type(text: string) {
    await vscode.commands.executeCommand('type', { "text": text });
}

async function execute(cmd: string) {
    await vscode.commands.executeCommand(cmd);
}


// ************* //
// Configuration //
// ************* //

function getTabSize() {
    return getConfig().get<number>("editor.tabSize") ?? 4;
}

function hasAutoTab() {
    return getConfig().get<boolean>("cscurlyformatter.autoTabIndentation") ?? false;
}

function hasSuggestionOnEnter() {
    return getConfig().get<boolean>("editor.acceptSuggestionOnEnter") ?? true;
}

function getConfig() {
    return vscode.workspace.getConfiguration();
}


// ************** //
// Helper methods //
// ************** //

function isCursorAtZeroPosition(editor: vscode.TextEditor) {
    const cursorPosition = editor.selection.active;
    return cursorPosition.character === 0;
}

function isCursorBetweenCurly(editor: vscode.TextEditor) {
    const [leftChar, rightChar] = getAdjacentText(editor);
    return leftChar === "{" && rightChar === "}";
}

function getAdjacentText(editor: vscode.TextEditor) {
    const cursorPosition = editor.selection.active;
    return editor.document.getText(
        vsRange(cursorPosition.line, cursorPosition.character - 1, cursorPosition.character + 1)
    );
}

function vsRange(line: number, from: number, to: number) {
    return new vscode.Range(line, from, line, to);
}
