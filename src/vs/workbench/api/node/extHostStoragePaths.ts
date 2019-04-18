/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'vs/base/common/path';
import { URI } from 'vs/base/common/uri';
import * as pfs from 'vs/base/node/pfs';
import { IEnvironment, IStaticWorkspaceData } from 'vs/workbench/api/common/extHost.protocol';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';

export class ExtensionStoragePaths {

	private readonly _workspace?: IStaticWorkspaceData;
	private readonly _environment: IEnvironment;

	private readonly _ready: Promise<string | undefined>;
	private _value?: string;

	constructor(workspace: IStaticWorkspaceData | undefined, environment: IEnvironment) {
		this._workspace = workspace;
		this._environment = environment;
		this._ready = this._getOrCreateWorkspaceStoragePath().then(value => this._value = value);
	}

	get whenReady(): Promise<any> {
		return this._ready;
	}

	workspaceValue(extension: IExtensionDescription): string | undefined {
		if (this._value) {
			return path.join(this._value, extension.identifier.value);
		}
		return undefined;
	}

	globalValue(extension: IExtensionDescription): string {
		return path.join(this._environment.globalStorageHome.fsPath, extension.identifier.value.toLowerCase());
	}

	private async _getOrCreateWorkspaceStoragePath(): Promise<string | undefined> {
		if (!this._workspace) {
			return Promise.resolve(undefined);
		}

		if (!this._environment.appSettingsHome) {
			return undefined;
		}
		const storageName = this._workspace.id;
		const storagePath = path.join(this._environment.appSettingsHome.fsPath, 'workspaceStorage', storageName);

		const exists = await pfs.dirExists(storagePath);

		if (exists) {
			return storagePath;
		}

		try {
			await pfs.mkdirp(storagePath);
			await pfs.writeFile(
				path.join(storagePath, 'meta.json'),
				JSON.stringify({
					id: this._workspace.id,
					configuration: this._workspace.configuration && URI.revive(this._workspace.configuration).toString(),
					name: this._workspace.name
				}, undefined, 2)
			);
			return storagePath;

		} catch (e) {
			console.error(e);
			return undefined;
		}
	}
}
