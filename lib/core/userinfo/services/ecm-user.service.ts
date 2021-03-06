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

import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ContentService } from '../../services/content.service';
import { AlfrescoApiService } from '../../services/alfresco-api.service';
import { LogService } from '../../services/log.service';
import { EcmUserModel } from '../models/ecm-user.model';
import 'rxjs/add/observable/throw';

@Injectable()
export class EcmUserService {

    constructor(private apiService: AlfrescoApiService,
                private contentService: ContentService,
                private logService: LogService) {
    }

    /**
     * get User Information via ECM
     * @param userName - the user name
     */
    getUserInfo(userName: string): Observable<EcmUserModel> {
        return Observable.fromPromise(this.apiService.getInstance().core.peopleApi.getPerson(userName))
            .map(data => <EcmUserModel> data['entry'])
            .catch(err => this.handleError(err));
    }

    getCurrentUserInfo() {
        return this.getUserInfo('-me-');
    }

    getUserProfileImage(avatarId: string) {
        if (avatarId) {
            let nodeObj = {entry: {id: avatarId}};
            return this.contentService.getContentUrl(nodeObj);
        }
    }

    /**
     * Throw the error
     * @param error
     * @returns {ErrorObservable}
     */
    private handleError(error: Response) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        this.logService.error(error);
        return Observable.throw(error || 'Server error');
    }

}
