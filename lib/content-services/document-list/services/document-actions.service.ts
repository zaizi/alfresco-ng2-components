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

import { ContentService } from '@alfresco/adf-core';
import { Injectable } from '@angular/core';
import { MinimalNodeEntity } from 'alfresco-js-api';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ContentActionHandler } from '../models/content-action.model';
import { PermissionModel } from '../models/permissions.model';
import { DocumentListService } from './document-list.service';
import { NodeActionsService } from './node-actions.service';
import 'rxjs/add/observable/throw';

@Injectable()
export class DocumentActionsService {

    permissionEvent: Subject<PermissionModel> = new Subject<PermissionModel>();
    error: Subject<Error> = new Subject<Error>();
    success: Subject<string> = new Subject<string>();

    private handlers: { [id: string]: ContentActionHandler; } = {};

    constructor(private nodeActionsService: NodeActionsService,
                private documentListService?: DocumentListService,
                private contentService?: ContentService) {
        this.setupActionHandlers();
    }

    getHandler(key: string): ContentActionHandler {
        if (key) {
            let lkey = key.toLowerCase();
            return this.handlers[lkey] || null;
        }
        return null;
    }

    setHandler(key: string, handler: ContentActionHandler): boolean {
        if (key) {
            let lkey = key.toLowerCase();
            this.handlers[lkey] = handler;
            return true;
        }
        return false;
    }

    canExecuteAction(obj: any): boolean {
        return this.documentListService && obj && obj.entry.isFile === true;
    }

    private setupActionHandlers() {
        this.handlers['download'] = this.download.bind(this);
        this.handlers['copy'] = this.copyNode.bind(this);
        this.handlers['move'] = this.moveNode.bind(this);
        this.handlers['delete'] = this.deleteNode.bind(this);
    }

    private download(node: MinimalNodeEntity): Observable<boolean> {
        if (this.canExecuteAction(node) && this.contentService) {
            let link = document.createElement('a');
            document.body.appendChild(link);
            link.setAttribute('download', node.entry.name);
            link.href = this.contentService.getContentUrl(node);
            link.click();
            document.body.removeChild(link);
            return Observable.of(true);
        }
        return Observable.of(false);
    }

    private copyNode(node: MinimalNodeEntity, target?: any, permission?: string) {
        const actionObservable = this.nodeActionsService.copyContent(node.entry, permission);
        this.prepareHandlers(actionObservable, 'content', 'copy', target, permission);
        return actionObservable;
    }

    private moveNode(node: MinimalNodeEntity, target?: any, permission?: string) {
        const actionObservable = this.nodeActionsService.moveContent(node.entry, permission);
        this.prepareHandlers(actionObservable, 'content', 'move', target, permission);
        return actionObservable;
    }

    private prepareHandlers(actionObservable, type: string, action: string, target?: any, permission?: string): void {
        actionObservable.subscribe(
            (fileOperationMessage) => {
                if (target && typeof target.reload === 'function') {
                    target.reload();
                }
                this.success.next(fileOperationMessage);
            },
            this.error.next.bind(this.error)
        );
    }

    private deleteNode(node: any, target?: any, permission?: string): Observable<any> {
        let handlerObservable;

        if (this.canExecuteAction(node)) {
            if (this.contentService.hasPermission(node.entry, permission)) {
                handlerObservable = this.documentListService.deleteNode(node.entry.id);
                handlerObservable.subscribe(() => {
                    if (target && typeof target.reload === 'function') {
                        target.reload();
                    }
                    this.success.next(node.entry.id);
                });
                return handlerObservable;
            } else {
                this.permissionEvent.next(new PermissionModel({type: 'content', action: 'delete', permission: permission}));
                return Observable.throw(new Error('No permission to delete'));
            }
        }
    }
}
