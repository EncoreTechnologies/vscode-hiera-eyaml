import * as childProcess from 'child_process';
import * as vscode from 'vscode';
const fs = require('fs');
const path = require('path');

interface DecryptObj {
    key: string;
    value: string;
}

export function getFirstExistingFile(filePaths: Array<string>) {
    const existingFile = filePaths.find(filePath => {
        // Resolve the file path in case it is relative
        const absolutePath = path.resolve(filePath);
        return fs.existsSync(absolutePath);
    });

    return existingFile;
}

export function encryptText(eyamlPath: string, privateKeyPath: string, publicKeyPath: string, outputFormat: string, eyamlString: string, lineSpaces: string, eyamlMethod: string): Promise<string> {
    return new Promise((resolve, reject) => {
        if (eyamlMethod === 'decrypt') {
            eyamlString = eyamlString.replace(/\s/g, '');
        }
        const command = `${eyamlPath} ${eyamlMethod} --pkcs7-private-key=${privateKeyPath} --pkcs7-public-key=${publicKeyPath}` + (outputFormat ? ` --output="${outputFormat}"` : '') + ` -s "${eyamlString}"`;
        try {
            let stdout = childProcess.execSync(command).toString();
            stdout = stdout.replace(/\n$/, '');
            if (outputFormat === 'block') {
                stdout = stdout.replace(/[^\S\r\n]/g, '');
                stdout = stdout.replace(/(\r\n|\n|\r)/gm, '$1' + lineSpaces);
            }
            resolve(stdout);
        } catch (error) {
            console.error(`exec error: ${error}`);
            reject(`Error encrypting text: ${error}`);
        }
    });
}

export function getConfig(): vscode.WorkspaceConfiguration {
    let config = vscode.workspace.getConfiguration('EncoreTechnologies.heira-eyaml');
    if (vscode.workspace.workspaceFolders && vscode.window.activeTextEditor) {
        const currentFileUri = vscode.window.activeTextEditor.document.uri;
        vscode.workspace.workspaceFolders.forEach(folder => {
            if (currentFileUri.path.includes(folder.uri.path)) {
                config = vscode.workspace.getConfiguration('EncoreTechnologies.heira-eyaml', folder.uri);
            }
        });
    }
    return config;
}

export async function searchNestedKeys(
    obj: any,
    eyamlPath: string,
    privateKeyPath: string,
    publicKeyPath: string,
    sharedFunctions: any,
    regex: RegExp,
    keyPath: string[] = [],
    matches: DecryptObj[] = []
): Promise<DecryptObj[]> {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            const newKeyPath = [...keyPath, key];
            if (typeof value === 'object' && value !== null) {
                await searchNestedKeys(value, eyamlPath, privateKeyPath, publicKeyPath, sharedFunctions, regex, newKeyPath, matches);
            } else if (typeof value === 'string' && regex.test(value)) {
                try {
                    const decryptedText = await sharedFunctions.encryptText(eyamlPath, privateKeyPath, publicKeyPath, '', value, '', 'decrypt');
                    if (decryptedText) {
                        matches.push({ key: newKeyPath.join('::'), value: decryptedText });
                    }
                } catch (error) {
                    vscode.window.showInformationMessage('There was an error encrypting the selected text! Please check the output window for more details.');
                }
            }
        }
    }
    return matches;
}