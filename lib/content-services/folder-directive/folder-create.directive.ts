/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Directive, HostListener, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { MinimalNodeEntryEntity } from 'alfresco-js-api';
import { FolderDialogComponent } from '../dialogs/folder.dialog';
import { ContentService } from '@alfresco/adf-core';

const DEFAULT_FOLDER_PARENT_ID = '-my-';

@Directive({
    selector: '[adf-create-folder]'
})
export class FolderCreateDirective {
    static DIALOG_WIDTH: number = 400;

    @Input('adf-create-folder')
    parentNodeId: string = DEFAULT_FOLDER_PARENT_ID;

    @HostListener('click', [ '$event' ])
    onClick(event) {
        event.preventDefault();
        this.openDialog();
    }

    constructor(
        public dialogRef: MatDialog,
        public content: ContentService
    ) {}

    private get dialogConfig(): MatDialogConfig {
        const { DIALOG_WIDTH: width } = FolderCreateDirective;
        const { parentNodeId } = this;

        return {
            data: { parentNodeId },
            width: `${width}px`
        };
    }

    private openDialog(): void {
        const { dialogRef, dialogConfig, content } = this;
        const dialogInstance = dialogRef.open(FolderDialogComponent, dialogConfig);

        dialogInstance.afterClosed().subscribe((node: MinimalNodeEntryEntity) => {
            if (node) {
                content.folderCreate.next(node);
            }
        });
    }
}
