/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { TPromise } from 'vs/base/common/winjs.base';

export interface IWatcherRequest {
	basePath: string;
	ignored: string[];
}

export interface IWatcherService {
	initialize(verboseLogging: boolean): TPromise<void>;
	setRoots(roots: IWatcherRequest[]): TPromise<void>;
}