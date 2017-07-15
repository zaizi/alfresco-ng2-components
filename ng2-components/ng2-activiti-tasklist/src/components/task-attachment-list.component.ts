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

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ActivitiContentService } from 'ng2-activiti-form';
import { AlfrescoTranslationService, ContentService, ThumbnailService } from 'ng2-alfresco-core';

@Component({
    selector: 'adf-task-attachment-list',
    styleUrls: ['./task-attachment-list.component.css'],
    templateUrl: './task-attachment-list.component.html'
})
export class TaskAttachmentListComponent implements OnChanges {

    @Input()
    taskId: string;

    @Output()
    attachmentClick = new EventEmitter();

    @Output()
    success = new EventEmitter();

    @Output()
    error: EventEmitter<any> = new EventEmitter<any>();

    attachments: any[] = [];
    isLoading: boolean = true;

    constructor(private translateService: AlfrescoTranslationService,
                private activitiContentService: ActivitiContentService,
                private contentService: ContentService,
                private thumbnailService: ThumbnailService) {

        if (translateService) {
            translateService.addTranslationFolder('ng2-activiti-tasklist', 'assets/ng2-activiti-tasklist');
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['taskId'] && changes['taskId'].currentValue) {
            this.loadAttachmentsByTaskId(changes['taskId'].currentValue);
        }
    }

    reset(): void {
        this.attachments = [];
    }

    reload(): void {
        this.loadAttachmentsByTaskId(this.taskId);
    }

    add(content: any): void {
        this.attachments.push({
            id: content.id,
            name: content.name,
            created: content.created,
            createdBy: content.createdBy.firstName + ' ' + content.createdBy.lastName,
            icon: this.thumbnailService.getMimeTypeIcon(content.mimeType)
        });
    }

    private loadAttachmentsByTaskId(taskId: string) {
        if (taskId) {
            this.isLoading = true;
            this.reset();
            this.activitiContentService.getTaskRelatedContent(taskId).subscribe(
                (res: any) => {
                    let attachList = [];
                    res.data.forEach(content => {
                        attachList.push({
                            id: content.id,
                            name: content.name,
                            created: content.created,
                            createdBy: content.createdBy.firstName + ' ' + content.createdBy.lastName,
                            icon: this.thumbnailService.getMimeTypeIcon(content.mimeType)
                        });
                    });
                    this.attachments = attachList;
                    this.success.emit(this.attachments);
                    this.isLoading = false;
                },
                (err) => {
                    this.error.emit(err);
                    this.isLoading = false;
                });
        }
    }

    private deleteAttachmentById(contentId: string) {
        if (contentId) {
            this.activitiContentService.deleteRelatedContent(contentId).subscribe(
                (res: any) => {
                    this.attachments = this.attachments.filter(content => {
                        return content.id !== contentId;
                    });
                },
                (err) => {
                    this.error.emit(err);
                });
        }
    }

    isEmpty(): boolean {
        return this.attachments && this.attachments.length === 0;
    }

    onShowRowActionsMenu(event: any) {
        let viewAction = {
            title: 'View',
            name: 'view'
        };

        let removeAction = {
            title: 'Remove',
            name: 'remove'
        };

        let downloadAction = {
            title: 'Download',
            name: 'download'
        };

        event.value.actions = [
            viewAction,
            removeAction,
            downloadAction
        ];
    }

    onExecuteRowAction(event: any) {
        let args = event.value;
        let action = args.action;
        if (action.name === 'view') {
            this.emitDocumentContent(args.row.obj);
        } else if (action.name === 'remove') {
            this.deleteAttachmentById(args.row.obj.id);
        } else if (action.name === 'download') {
            this.downloadContent(args.row.obj);
        }
    }

    openContent(event: any): void {
        let content = event.value.obj;
        this.emitDocumentContent(content);
    }

    emitDocumentContent(content: any) {
        this.activitiContentService.getFileRawContent(content.id).subscribe(
            (blob: Blob) => {
                content.contentBlob = blob;
                this.attachmentClick.emit(content);
            },
            (err) => {
                this.error.emit(err);
            }
        );
    }

    downloadContent(content: any): void {
        this.activitiContentService.getFileRawContent(content.id).subscribe(
            (blob: Blob) => this.contentService.downloadBlob(blob, content.name),
            (err) => {
                this.error.emit(err);
            }
        );
    }
}