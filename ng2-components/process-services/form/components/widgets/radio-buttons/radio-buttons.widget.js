"use strict";
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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:component-selector  */
var core_1 = require("@angular/core");
var widget_component_1 = require("./../widget.component");
var RadioButtonsWidgetComponent = (function (_super) {
    __extends(RadioButtonsWidgetComponent, _super);
    function RadioButtonsWidgetComponent(formService, visibilityService, logService) {
        var _this = _super.call(this, formService) || this;
        _this.formService = formService;
        _this.visibilityService = visibilityService;
        _this.logService = logService;
        return _this;
    }
    RadioButtonsWidgetComponent.prototype.ngOnInit = function () {
        if (this.field && this.field.restUrl) {
            if (this.field.form.taskId) {
                this.getOptionsByTaskId();
            }
            else {
                this.getOptionsByProcessDefinitionId();
            }
        }
    };
    RadioButtonsWidgetComponent.prototype.getOptionsByTaskId = function () {
        var _this = this;
        this.formService
            .getRestFieldValues(this.field.form.taskId, this.field.id)
            .subscribe(function (result) {
            _this.field.options = result || [];
            _this.field.updateForm();
        }, function (err) { return _this.handleError(err); });
    };
    RadioButtonsWidgetComponent.prototype.getOptionsByProcessDefinitionId = function () {
        var _this = this;
        this.formService
            .getRestFieldValuesByProcessId(this.field.form.processDefinitionId, this.field.id)
            .subscribe(function (result) {
            _this.field.options = result || [];
            _this.field.updateForm();
        }, function (err) { return _this.handleError(err); });
    };
    RadioButtonsWidgetComponent.prototype.onOptionClick = function (optionSelected) {
        this.field.value = optionSelected;
        this.checkVisibility();
    };
    RadioButtonsWidgetComponent.prototype.checkVisibility = function () {
        this.visibilityService.refreshVisibility(this.field.form);
    };
    RadioButtonsWidgetComponent.prototype.handleError = function (error) {
        this.logService.error(error);
    };
    RadioButtonsWidgetComponent = __decorate([
        core_1.Component({
            selector: 'radio-buttons-widget',
            templateUrl: './radio-buttons.widget.html',
            styleUrls: ['./radio-buttons.widget.scss'],
            host: widget_component_1.baseHost,
            encapsulation: core_1.ViewEncapsulation.None
        })
    ], RadioButtonsWidgetComponent);
    return RadioButtonsWidgetComponent;
}(widget_component_1.WidgetComponent));
exports.RadioButtonsWidgetComponent = RadioButtonsWidgetComponent;