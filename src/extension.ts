// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as child_process from 'child_process';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const outputChannel = vscode.window.createOutputChannel('My Extension');

	let decryptSelection = vscode.commands.registerCommand('hiera-eyaml.decryptSelection', () => {
		let config = vscode.workspace.getConfiguration('EncoreTechnologies.heira-eyaml');
		if (vscode.workspace.workspaceFolders && vscode.window.activeTextEditor) {
			const currentFileUri = vscode.window.activeTextEditor.document.uri;
			vscode.workspace.workspaceFolders.forEach(folder => {
				if (currentFileUri.path.includes(folder.uri.path)) {
					config = vscode.workspace.getConfiguration('EncoreTechnologies.heira-eyaml', folder.uri);
					return true;
				}
			});
		}
		const eyamlPath = config.get('eyamlPath');
		const publicKeyPath = config.get('publicKeyPath');
		const privateKeyPath = config.get('privateKeyPath');

		if (vscode.window.activeTextEditor) {
			const editor = vscode.window.activeTextEditor;
			const selectedText = editor.document.getText(editor.selection);
			if (selectedText) {
				const selectedTextWithoutNewLinesOrSpaces = selectedText.replace(/\s/g, '');
				const command = `${eyamlPath} decrypt --pkcs7-private-key=${privateKeyPath} --pkcs7-public-key=${publicKeyPath} -s "${selectedTextWithoutNewLinesOrSpaces}"`;
				child_process.exec(command, (error, stdout, stderr) => {
					if (error) {
						outputChannel.appendLine(`Error decrypting text: ${error}`);
						console.error(`exec error: ${error}`);
						console.error(`stderr: ${stderr}`);
						vscode.window.showInformationMessage('There was an error decrypting the selected text! Please check the output window for more details.');
					} else {
						const decryptedText = stdout.replace(/\n/g, '');
						if (decryptedText) {
							editor.edit(editBuilder => {
								editBuilder.replace(editor.selection, decryptedText);
							});
						}
					}
				});
			} else {
				vscode.window.showInformationMessage('There is no selected text');
			}
		} else {
			vscode.window.showInformationMessage('There is no active file');
		}
	});

	let encryptSelection = vscode.commands.registerCommand('hiera-eyaml.encryptSelection', () => {
		let config = vscode.workspace.getConfiguration('EncoreTechnologies.heira-eyaml');
		if (vscode.workspace.workspaceFolders && vscode.window.activeTextEditor) {
			const currentFileUri = vscode.window.activeTextEditor.document.uri;
			vscode.workspace.workspaceFolders.forEach(folder => {
				if (currentFileUri.path.includes(folder.uri.path)) {
					config = vscode.workspace.getConfiguration('EncoreTechnologies.heira-eyaml', folder.uri);
					return true;
				}
			});
		}
		const eyamlPath = config.get('eyamlPath');
		const publicKeyPath = config.get('publicKeyPath');
		const privateKeyPath = config.get('privateKeyPath');
		const outputFormat = config.get('outputFormat');

		if (vscode.window.activeTextEditor) {
			const editor = vscode.window.activeTextEditor;
			const selectionStart = editor.selection.start;
			const lineNumber = selectionStart.line;
			const charNumber = selectionStart.character;
			let lineSpaces = '';
			for (let i = 0; i < charNumber; i++) {
				lineSpaces += ' ';
			}
			const selectedText = editor.document.getText(editor.selection);
			if (selectedText) {
				const command = `${eyamlPath} encrypt --pkcs7-private-key=${privateKeyPath} --pkcs7-public-key=${publicKeyPath} --output="${outputFormat}" -s "${selectedText}"`;
				child_process.exec(command, (error, stdout, stderr) => {
					if (error) {
						outputChannel.appendLine(`Error encrypting text: ${error}`);
						console.error(`exec error: ${error}`);
						console.error(`stderr: ${stderr}`);
						vscode.window.showInformationMessage('There was an error encrypting the selected text! Please check the output window for more details.');
					} else {
						let ecryptedText = stdout;
						ecryptedText = ecryptedText.replace(/\n$/, '');
						if (outputFormat === 'block') {
							ecryptedText = ecryptedText.replace(/[^\S\r\n]/g, '');
							ecryptedText = ecryptedText.replace(/(\r\n|\n|\r)/gm, '$1' + lineSpaces);
						}
						if (ecryptedText) {
							editor.edit(editBuilder => {
								editBuilder.replace(editor.selection, ecryptedText);
							});
						}
					}
				});
			} else {
				vscode.window.showInformationMessage('There is no selected text');
			}
		} else {
			vscode.window.showInformationMessage('There is no active file');
		}
	});

	context.subscriptions.push(decryptSelection);
	context.subscriptions.push(encryptSelection);
}

// This method is called when your extension is deactivated
export function deactivate() {}
