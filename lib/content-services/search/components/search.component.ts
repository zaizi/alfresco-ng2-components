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

import { SearchService } from '@alfresco/adf-core';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { NodePaging, QueryBody } from 'alfresco-js-api';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'adf-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    encapsulation: ViewEncapsulation.None,
    preserveWhitespaces: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'searchAutocomplete',
    host: {
        'class': 'adf-search'
    }
})
export class SearchComponent implements AfterContentInit, OnChanges {

    @ViewChild('panel')
    panel: ElementRef;

    @ContentChild(TemplateRef)
    template: TemplateRef<any>;

    @Input()
    displayWith: ((value: any) => string) | null = null;

    @Input()
    maxResults: number = 20;

    @Input()
    skipResults: number = 0;

    @Input()
    searchTerm: string = '';

    @Input()
    queryBody: QueryBody;

    @Input('class')
    set classList(classList: string) {
        if (classList && classList.length) {
            classList.split(' ').forEach(className => this._classList[className.trim()] = true);
            this._elementRef.nativeElement.className = '';
        }
    }

    @Output()
    resultLoaded: EventEmitter<NodePaging> = new EventEmitter();

    @Output()
    error: EventEmitter<any> = new EventEmitter();

    showPanel: boolean = false;
    results: NodePaging;

    get isOpen(): boolean {
        return this._isOpen && this.showPanel;
    }

    set isOpen(value: boolean) {
        this._isOpen = value;
    }

    _isOpen: boolean = false;

    keyPressedStream: Subject<string> = new Subject();

    _classList: { [key: string]: boolean } = {};

    constructor(private searchService: SearchService,
                private changeDetectorRef: ChangeDetectorRef,
                private _elementRef: ElementRef) {
        this.keyPressedStream.asObservable()
            .debounceTime(200)
            .subscribe((searchedWord: string) => {
                this.loadSearchResults(searchedWord);
            });
    }

    ngAfterContentInit() {
        this.setVisibility();
    }

    ngOnChanges(changes) {
        this.resetResults();

        if (changes.searchTerm && changes.searchTerm.currentValue) {
            this.loadSearchResults(changes.searchTerm.currentValue);
        } else if (changes.queryBody && changes.queryBody.currentValue) {
            this.loadSearchResults();
        } else {
            this.loadSearchResults(this.searchTerm);
        }
    }

    resetResults() {
        this.cleanResults();
        this.setVisibility();
    }

    reload() {
        this.loadSearchResults(this.searchTerm);
    }

    private cleanResults() {
        if (this.results) {
            this.results = {};
        }
    }

    private hasValidSearchQuery(searchOpts: QueryBody) {
        return searchOpts && searchOpts.query && searchOpts.query.query;
    }

    private loadSearchResults(searchTerm?: string) {
        let searchOpts: QueryBody = this.getQueryBody(searchTerm);

        if (this.hasValidSearchQuery(searchOpts)) {
            this.searchService
                .search(searchOpts)
                .subscribe(
                    results => {
                        this.results = <NodePaging> results;
                        this.resultLoaded.emit(this.results);
                        this.isOpen = true;
                        this.setVisibility();
                    },
                    error => {
                        if (error.status !== 400) {
                            this.results = null;
                            this.error.emit(error);
                        }
                    });
        } else {
            this.cleanResults();
        }
    }

    private getQueryBody(searchTerm: string): QueryBody {
        if (this.queryBody) {
            if (!this.queryBody.query.query && searchTerm) {
                this.queryBody.query.query = searchTerm;
            }
            return this.queryBody;
        } else {
            return this.generateDefaultSearchNode(searchTerm);
        }
    }

    private generateDefaultSearchNode(searchTerm: string): QueryBody {
        let defaultQueryBody: QueryBody = {
            query: {
                query: searchTerm ? `${searchTerm}* OR name:${searchTerm}*` : searchTerm
            },
            include: ['path', 'allowableOperations'],
            paging: {
                maxItems: this.maxResults.toString(),
                skipCount: this.skipResults.toString()
            },
            filterQueries: [
                { query: "TYPE:'cm:folder' OR TYPE:'cm:content'" },
                { query: 'NOT cm:creator:System' }]
        };

        return defaultQueryBody;
    }

    hidePanel() {
        if (this.isOpen) {
            this._classList['adf-search-show'] = false;
            this._classList['adf-search-hide'] = true;
            this.isOpen = false;
            this.changeDetectorRef.markForCheck();
        }
    }

    setVisibility() {
        this.showPanel = !!this.results && !!this.results.list;
        this._classList['adf-search-show'] = this.showPanel;
        this._classList['adf-search-hide'] = !this.showPanel;
        this.changeDetectorRef.markForCheck();
    }
}
