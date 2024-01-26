import * as childProcess from 'child_process';
import * as vscode from 'vscode';

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