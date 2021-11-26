import { moveCursor } from 'readline';
import * as vscode from 'vscode';

const Cursor = {
	Up: "cursorUp",
	Down: "cursorDown",
	Left: "cursorLeft",
	Right: "cursorRight"
};
Object.freeze(Cursor);

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	//console.log('Congratulations, your extension is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('cscurlyformatter.curlyformat', () => {
		//vscode.window.showInformationMessage('Extension started!');
	
		if(isCursorBetweenCurly())
			manualFormat();
		else
			vscode.commands.executeCommand('type', { "text": "\n" });
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function isCursorBetweenCurly(){
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return false;
	}
	const cursorPosition = editor.selection.active;
	const nearCursor = editor.document.getText(
		new vscode.Range(
			cursorPosition.line, cursorPosition.character - 1,
			cursorPosition.line, cursorPosition.character + 1
		));

	if(nearCursor[0] == "{" && nearCursor[1] == "}")
		return true;
	else
		return false;
}

function manualFormat() {
	vscode.commands.executeCommand(Cursor.Left);
	type('\n');

	vscode.commands.executeCommand(Cursor.Right);
	type('\n\n');

	vscode.commands.executeCommand(Cursor.Up);
	type('\t');
}

function autoFormat() {
	type('\n');
	vscode.commands.executeCommand("editor.action.formatDocument");

	// Find async way to type "\t" after format completion
}

function type(text : string) {
	vscode.commands.executeCommand('type', { "text": text });
}
