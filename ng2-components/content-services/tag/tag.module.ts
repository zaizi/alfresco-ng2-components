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
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgModule } from '@angular/core';
import { TRANSLATION_PROVIDER } from '@adf/core';
import { MaterialModule } from '../material.module';
import { TagService } from '../services/tag.service';
import { TagActionsComponent } from './tag-actions.component';
import { TagListComponent } from './tag-list.component';
import { TagNodeListComponent } from './tag-node-list.component';


@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        TranslateModule,
        FormsModule, ReactiveFormsModule
    ],
    exports: [
        TagActionsComponent,
        TagListComponent,
        TagNodeListComponent
    ],
    declarations: [
        TagActionsComponent,
        TagListComponent,
        TagNodeListComponent
    ],
    providers: [
        TagService,
        {
            provide: TRANSLATION_PROVIDER,
            multi: true,
            useValue: {
                name: 'ng2-alfresco-tag',
                source: 'assets/ng2-alfresco-tag'
            }
        }
    ]
})
export class TagModule {}