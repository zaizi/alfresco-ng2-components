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

import { Component, OnInit } from '@angular/core';
import { CellEditorComponent } from './../cell.editor';
import { DynamicTableRow, DynamicTableColumn, DynamicTableColumnOption } from './../../../core/index';
import { FormService } from './../../../../../services/form.service';

@Component({
    moduleId: module.id,
    selector: 'alf-dropdown-editor',
    templateUrl: './dropdown.editor.html',
    styleUrls: ['./dropdown.editor.css']
})
export class DropdownEditorComponent extends CellEditorComponent implements OnInit {

    value: any = null;
    options: DynamicTableColumnOption[] = [];

    constructor(private formService: FormService) {
        super();
    }

    ngOnInit() {
        let field = this.table.field;
        if (field) {
            if (this.column.optionType === 'rest') {
                this.formService
                    .getRestFieldValuesColumn(
                        field.form.taskId,
                        field.id,
                        this.column.id
                    )
                    .subscribe(
                        (result: DynamicTableColumnOption[]) => {
                            this.column.options = result || [];
                            this.options = this.column.options;
                            this.value = this.table.getCellValue(this.row, this.column);
                        },
                        err => this.handleError(err)
                    );
            } else {
                this.options = this.column.options || [];
                this.value = this.table.getCellValue(this.row, this.column);
            }
        }
    }

    onValueChanged(row: DynamicTableRow, column: DynamicTableColumn, event: any) {
        let value: any = (<HTMLInputElement>event.target).value;
        value = column.options.find(opt => opt.name === value);
        row.value[column.id] = value;
    }
}