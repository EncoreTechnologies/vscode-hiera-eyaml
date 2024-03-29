# enc-hiera-eyaml README

This extension uses the hiera-eyaml executable to encrypt and decrypt values for puppet. 

## Features

We have built 3 commands and a section on the activity bar.

Commands:
* `Decrypt Selection`: Decrypts the selected text.
* `Encrypt Selection`: Encrypts the selected text.
* `Decrypt File`: Decrypts the entire file. A progress bar is shown during this command.

Activity Bar:

Shows the entire files keys and their encrypted values. This is refreshed the the open file is changed.

<p><img src="https://raw.githubusercontent.com/EncoreTechnologies/vscode-hiera-eyaml/main/media/hiera-eyaml.gif" alt="Hiera-Eyaml"/></p>

## Requirements

The hiera-yaml executable needs installed and keys need generated. https://github.com/voxpupuli/hiera-eyaml

Once you have everything setup you can define the below configuration values.

## Extension Settings

This extension contributes the following settings:

* `EncoreTechnologies.hiera-eyaml.eyamlPath`: (String) The full path to your eyaml executable.
* `EncoreTechnologies.hiera-eyaml.publicKeyPath`: List of paths to the public key to use with eyaml. Both relatative and full paths are supported. The first file found will be used. Environment vaiables and `~` are also supported. Any relative paths are relative to the current workingspace/repo.
* `EncoreTechnologies.hiera-eyaml.privateKeyPath`: List of paths to the private key to use with eyaml. Both relatative and full paths are supported. The first file found will be used. Environment vaiables and `~` are also supported. Any relative paths are relative to the current workingspace/repo.
* `EncoreTechnologies.hiera-eyaml.outputFormat`: (String) The format of the output of encryption commands. Default = block

These settings use the resoruce scope so can be set at all levels of settings all the way down to the folder level.

## Output

An output channel is created for error handling. There are several notifications that also mention checking the output channel for additional information. When looking at the output terminal make sure you change the channel to `enc-hiera-eyaml` to see the output messages.

## Known Issues

No know issues.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of hiera-eyaml

---

### 1.0.1

## Features

* Add additional tags and categories. (https://github.com/EncoreTechnologies/vscode-hiera-eyaml/issues/10)

## Bug Fixes

* Strict yaml decrypt error. (https://github.com/EncoreTechnologies/vscode-hiera-eyaml/issues/12)
* Fix issues with display images not being the correct size. (https://github.com/EncoreTechnologies/vscode-hiera-eyaml/issues/11)
* Relative paths are not working correctly. (https://github.com/EncoreTechnologies/vscode-hiera-eyaml/issues/9)

---
