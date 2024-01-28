// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as sharedFunctions from './sharedFunctions';
import { hieraEyamlViewProvider } from './tree';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const outputChannel = vscode.window.createOutputChannel('hiera-eyaml');
    const treeDataProvider = new hieraEyamlViewProvider();
    vscode.window.registerTreeDataProvider('hieraEyamlView', treeDataProvider);

    vscode.window.onDidChangeActiveTextEditor(editor => {
        treeDataProvider.refresh();
    });

	let decryptSelection = vscode.commands.registerCommand('hiera-eyaml.decryptSelection', () => {
		const config = sharedFunctions.getConfig();
		const eyamlPath = config.get('eyamlPath', '');
		const publicKeyPath = sharedFunctions.getFirstExistingFile(config.get('publicKeyPath', []));
		const privateKeyPath = sharedFunctions.getFirstExistingFile(config.get('privateKeyPath', []));
		
		if (!eyamlPath || !publicKeyPath || !privateKeyPath) {
			vscode.window.showInformationMessage('Please set the eyamlPath, publicKeyPath, and privateKeyPath settings');
			return;
		}

		if (vscode.window.activeTextEditor) {
			const editor = vscode.window.activeTextEditor;
			const selectedText = editor.document.getText(editor.selection);
			if (selectedText) {
				sharedFunctions.encryptText(eyamlPath, privateKeyPath, publicKeyPath, '', selectedText, '', 'decrypt')
				.then(decryptedText => {
					if (decryptedText) {
						editor.edit(editBuilder => {
							editBuilder.replace(editor.selection, decryptedText);
						});
					}
				})
				.catch(error => {
					vscode.window.showInformationMessage('There was an error encrypting the selected text! Please check the output window for more details.');
				});
			} else {
				vscode.window.showInformationMessage('There is no selected text');
			}
		} else {
			vscode.window.showInformationMessage('There is no active file');
		}
	});

	let decryptfile = vscode.commands.registerCommand('hiera-eyaml.decryptfile', () => {
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Decrypting file...",
			cancellable: true
		}, async (progress, token) => {
			const config = sharedFunctions.getConfig();
			const eyamlPath = config.get('eyamlPath', '');
			const publicKeyPath = sharedFunctions.getFirstExistingFile(config.get('publicKeyPath', []));
			const privateKeyPath = sharedFunctions.getFirstExistingFile(config.get('privateKeyPath', []));
	
			if (!eyamlPath || !publicKeyPath || !privateKeyPath) {
				vscode.window.showInformationMessage('Please set the eyamlPath, publicKeyPath, and privateKeyPath settings');
				return;
			}
	
			if (vscode.window.activeTextEditor) {
				const editor = vscode.window.activeTextEditor;
				const allText = editor.document.getText();
				const fullRange = new vscode.Range(
					editor.document.positionAt(0),
					editor.document.positionAt(allText.length)
				);
	
				if (allText) {
					const matches = allText.match(/ENC\[PKCS7,(.*?)\]/gs);
					if (matches) {
						let fullText = allText;
						for (let i = 0; i < matches.length; i++) {
							const match = matches[i];
							const lineText = match.replace(/\s/g, '');
							const command = `${eyamlPath} decrypt --pkcs7-private-key=${privateKeyPath} --pkcs7-public-key=${publicKeyPath} -s "${lineText}"`;
							try {
								const stdout = childProcess.execSync(command).toString();
								const decryptedText = stdout.replace(/\n/g, '');
								if (decryptedText) {
									const escapedMatch = match.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
									const replaceText = fullText.replace(new RegExp(escapedMatch), decryptedText);
									fullText = replaceText;
								}
							} catch (error) {
								outputChannel.appendLine(`Error decrypting text: ${error}`);
								console.error(`exec error: ${error}`);
								vscode.window.showInformationMessage('There was an error decrypting the selected text! Please check the output window for more details.');
							}
	
							progress.report({
								message: `Decrypting match ${i + 1} of ${matches.length}`,
								increment: 100 / matches.length
							});
						}
	
						await editor.edit(editBuilder => {
							editBuilder.replace(fullRange, fullText);
						});
					}
				}
			} else {
				vscode.window.showInformationMessage('There is no active file');
			}
		});
	});

	let encryptSelection = vscode.commands.registerCommand('hiera-eyaml.encryptSelection', () => {
		const config = sharedFunctions.getConfig();
		const eyamlPath = config.get('eyamlPath', '');
		const publicKeyPath = sharedFunctions.getFirstExistingFile(config.get('publicKeyPath', []));
		const privateKeyPath = sharedFunctions.getFirstExistingFile(config.get('privateKeyPath', []));
		const outputFormat = config.get('outputFormat', '');

		if (!eyamlPath || !publicKeyPath || !privateKeyPath || !outputFormat) {
			vscode.window.showInformationMessage('Please set the eyamlPath, publicKeyPath, privateKeyPath, and outputFormat settings');
			return;
		}

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
				sharedFunctions.encryptText(eyamlPath, privateKeyPath, publicKeyPath, outputFormat, selectedText, lineSpaces, 'encrypt')
				.then(encryptedText => {
					if (encryptedText) {
						editor.edit(editBuilder => {
							editBuilder.replace(editor.selection, encryptedText);
						});
					}
				})
				.catch(error => {
					vscode.window.showInformationMessage('There was an error encrypting the selected text! Please check the output window for more details.');
				});
			} else {
				vscode.window.showInformationMessage('There is no selected text');
			}
		} else {
			vscode.window.showInformationMessage('There is no active file');
		}
	});

	context.subscriptions.push(decryptSelection);
	context.subscriptions.push(decryptfile);
	context.subscriptions.push(encryptSelection);
}

// This method is called when your extension is deactivated
export function deactivate() {}