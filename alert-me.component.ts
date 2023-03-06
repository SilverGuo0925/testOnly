import { Component, HostListener, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormArray, UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { CommonService, AlertService } from '../../common/services';
import * as cnst from '../../common/constants';
import { FormUtil, ValidateEmail } from 'src/app/common/utils';
import { AlertMeService } from '../alert-me/alert-me.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AreaSqFtUnitPipe } from 'src/app/common/pipes/area-sqft-unit.pipe'

declare function startTrackingAlertMe(): any;
declare function completeTrackingAlertMe(): any;

@Component({
    selector: 'app-alert-me',
    templateUrl: './alert-me.component.html',
    styleUrls: ['./alert-me.component.scss']
})
export class AlertMeComponent implements OnInit {
    contactFormList: UntypedFormArray = this.fb.array([]);
    alertFormList: UntypedFormArray = this.fb.array([]);
    trades = [];
    usageTypes = [];
    hdbTowns = [];
    contactDetailList = [];
    contactList = [];
    hasMainContact = false;
    cnst = cnst;

    isContactEdit: boolean = false;
    isPreferenceEdit: boolean = false;
    isAddPerference: boolean = false;
    isAddContact: boolean = false;

    constructor(
        private fb: UntypedFormBuilder,
        private commonService: CommonService,
        public formUtil: FormUtil,
        private alertMeService: AlertMeService,
        private alertService: AlertService,
    ) { }

    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        return this.contactFormList.pristine && this.alertFormList.pristine;
    }

    ngOnInit(): void {
        this.loadCommonTypes();
        this.loadDetails();

        if (environment.appEnv === 'UAT' || environment.appEnv === 'PROD') {
            startTrackingAlertMe();
            completeTrackingAlertMe();
        }

    }

    loadCommonTypes() {
        this.commonService.getHdbTowns().subscribe(data => this.hdbTowns = data);
        this.commonService.getUsageTypes().subscribe(data => this.usageTypes = data);
        this.commonService.getTrades().subscribe(data => {
            this.trades = data;
        });
    }

    loadDetails() {
        this.initForm();
        this.alertMeService.getAlertMeDetails().subscribe(data => {
            this.patchValueToForm(data);
            this.contactList = data.contactList;
        });
    }

    initForm() {
        this.contactFormList = this.fb.array([]);
        this.alertFormList = this.fb.array([])
    }

    patchValueToForm(formData) {
        formData.contactFormList.forEach(item => {
            this.addToContactFormListArray(item);
        });

        formData.alertFormList.forEach(item => {
            this.addToAlertFormListArray(item);
        });
    }

    addToContactFormListArray(data) {
        if (data.isMainContact) {
            this.contactFormList.push(this.fb.group({
                userId: [data ? data.userId : ''],
                contactId: [data ? data.contactId : ''],
                name: [data ? data.name : ''],
                emailAddress: [data ? data.emailAddress : ''],
                mobileNo: [data ? data.mobileNo : ''],
                toAlertByEmail: [data ? data.toAlertByEmail : false],
                toAlertBySms: [data ? data.toAlertBySms : false],
                isDeleted: [data ? data.isDeleted : false],
                isEdit: [data ? data.isEdit : true],
                isAccountHolder: [data ? data.isAccountHolder : ''],
                notification: [data ? data.notification : ''],
                isMainContact: [data ? data.isMainContact : ''],
            }));
        }
        else {
            this.contactFormList.push(this.fb.group({
                userId: [data ? data.userId : ''],
                contactId: [data ? data.contactId : ''],

                name: [data ? data.name : '', [Validators.required]],
                emailAddress: [data ? data.emailAddress : '', [Validators.required, Validators.maxLength(255), ValidateEmail, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$')]],
                mobileNo: [data ? data.mobileNo : '', [Validators.required, Validators.minLength(8), Validators.maxLength(8), Validators.pattern("^[0-9]*$")]],
                toAlertByEmail: [data ? data.toAlertByEmail : true],
                toAlertBySms: [data ? data.toAlertBySms : false],
                isDeleted: [data ? data.isDeleted : false],
                isEdit: [data ? data.isEdit : true],
                isAccountHolder: [data ? data.isAccountHolder : ''],
                notification: [data ? data.notification : ''],
                isMainContact: [data ? data.isMainContact : ''],
                tenderCheck: [true, [Validators.required]],
                consentCheck: [true, [Validators.required]],
                reservesCheck: [true, [Validators.required]],

                //clone
                userIdClone: [data ? data.userId : ''],
                contactIdClone: [data ? data.contactId : ''],
                nameClone: [data ? data.name : ''],
                emailAddressClone: [data ? data.emailAddress : ''],
                mobileNoClone: [data ? data.mobileNo : ''],
                toAlertByEmailClone: [data ? data.toAlertByEmail : false],
                toAlertBySmsClone: [data ? data.toAlertBySms : false],
                isDeletedClone: [data ? data.isDeleted : false],
                isEditClone: [data ? data.isEdit : true],
                isAccountHolderClone: [data ? data.isAccountHolder : ''],
                notificationClone: [data ? data.notification : ''],
                isMainContactClone: [data ? data.isMainContact : '']

            }));
        }

    }

    displayMinFloorArea(data) {
        if (data) {
            if (data.minFloorArea <= 0) {
                return null;
            }
        }
        return data.minFloorArea;
    }

    displayMaxFloorArea(data) {
        if (data) {
            if (data.maxFloorArea >= cnst.maxFloorAreaMaximum) {
                return null;
            }
        }
        return data.maxFloorArea;
    }

    addToAlertFormListArray(data) {
        let locationStr = ""
        let tradeStr = ""
        let townListLabel = []
        let tradekeyList = []
        let tradeList = []
        if (data) {
            data.hdbTowns.sort((a, b) => {
                a.localeCompare(b, 'en', { numeric: true })
            })

            townListLabel = data.hdbTownListLabelSet.sort()
            locationStr = townListLabel.join(', ')

            let tradeSetList = []
            for (let key in data.tradesMap) {
                let keyPair = {
                    "key": key,
                    "label": data.tradesMap[key]
                }
                tradeSetList.push(keyPair)
            }
            tradeSetList.sort((a, b) => {
                return this.sortByAlphabetical(a.label, b.label)
            })

            tradeSetList.forEach((x) => {
                tradekeyList.push(x.key)
                tradeList.push(x.label)
            })
            tradeStr = tradeList.join(', ')
        }

        this.alertFormList.push(this.fb.group({
            userId: [data ? data.userId : ''],
            alertProfileId: [data ? data.alertProfileId : ''],
            minFloorArea: [this.displayMinFloorArea(data) ? data.minFloorArea : null, { validators: [Validators.maxLength(16)], updateOn: 'blur' }],
            maxFloorArea: [this.displayMaxFloorArea(data) ? data.maxFloorArea : null, { validators: [Validators.maxLength(16)], updateOn: 'blur' }],
            trades: [data ? tradekeyList : '', Validators.required],
            hdbTowns: [data ? data.hdbTowns : null],
            usageTypes: [data ? data.usageTypes : null],
            contacts: [data ? data.contacts : '', Validators.required],
            isDeleted: [data ? data.isDeleted : false],
            isEdit: [data ? data.isEdit : true],
            tradeListLabel: [data ? tradeStr : ''],
            hdbTownListLabel: [data ? locationStr : ''],
            usageTypeListLabel: [data ? data.usageTypeListLabel : ''],
            contactListLabel: [data ? data.contactListLabel : ''],

            //clone
            userIdClone: [data ? data.userId : ''],
            alertProfileIdClone: [data ? data.alertProfileId : ''],
            minFloorAreaClone: [data ? data.minFloorArea : 0],
            maxFloorAreaClone: [data ? data.maxFloorArea : 0],
            tradesClone: [data ? tradekeyList : ''],
            hdbTownsClone: [data ? data.hdbTowns : ''],
            usageTypesClone: [data ? data.usageTypes : ''],
            contactsClone: [data ? data.contacts : ''],
            isDeletedClone: [data ? data.isDeleted : false],
            isEditClone: [data ? data.isEdit : true],
            tradeListLabelClone: [data ? data.tradeListLabel : ''],
            hdbTownListLabelClone: [data ? data.hdbTownListLabel : ''],
            usageTypeListLabelClone: [data ? data.usageTypeListLabel : ''],
            contactListLabelClone: [data ? data.contactListLabel : ''],
        }, {
            validator: this.floorAreaRangeValidator
        }));
    }

    floorAreaRangeValidator(group: UntypedFormGroup) {
        let isMinFloorMoreThanMaxFloor = +group.get('minFloorArea').value > +group.get('maxFloorArea').value;
        if (group.get('maxFloorArea').value && group.get('minFloorArea').value && isMinFloorMoreThanMaxFloor) {
            group.get('maxFloorArea').setErrors({ 'invalidFloorAreaRange': true });
            group.get('minFloorArea').setErrors({ 'invalidFloorAreaRange': true });
        } else {
            group.get('maxFloorArea').setErrors(null);
            group.get('minFloorArea').setErrors(null);

        }
        return null;
    }

    cancelContact(index) {
        let details = this.contactFormList.at(index);
        let isEdit = details.get('isEdit').value;
        details.markAsPristine();
        for (const field in details['controls']) {
            if (!field.includes('Clone'))
                if (details.get(field + 'Clone')) {
                    details.get(field).patchValue(details.get(field + 'Clone').value);
                }
        }
        this.checkIfContactIsEdit();

        let hasRemainingEditableContact = false;
        this.contactFormList.controls.forEach(eachForm => {
            if (eachForm.get('isEdit').value === true) {
                hasRemainingEditableContact = true;
            }
        });
        if (hasRemainingEditableContact) {
            this.isContactEdit = true;
        } else {
            this.isContactEdit = false;
        }
    }

    editContact(contact, index) {
        contact.get('isEdit').setValue(!contact.get('isEdit').value);
        this.isContactEdit = true;
        this.contactFormList.at(index).get('tenderCheck').setValue(false);
        this.contactFormList.at(index).get('consentCheck').setValue(false);
        this.contactFormList.at(index).get('reservesCheck').setValue(false);
    }

    enableSaveContact() {
        let enableSave: boolean = false;
        for (let i = 0; i < this.contactFormList.length; i++) {

            let details = this.contactFormList.at(i);
            for (const field in details['controls']) {
                if (field == 'isEdit' && details.get(field).value) {
                    enableSave = true;
                    this.isContactEdit = true;
                    return enableSave;
                }
                if (field == 'isDeleted' && details.get(field).value) {
                    enableSave = true;
                    this.isContactEdit = true;
                    return enableSave;
                }
            }
        }
        this.isContactEdit = false;
    }

    enableSaveProfile() {
        let enableSave: boolean = false;
        for (let i = 0; i < this.alertFormList.length; i++) {

            let details = this.alertFormList.at(i);
            for (const field in details['controls']) {
                if (field == 'isEdit' && details.get(field).value) {
                    enableSave = true;
                    this.isPreferenceEdit = true;
                    return enableSave;
                }
                if (field == 'isDeleted' && details.get(field).value) {
                    enableSave = true;
                    this.isPreferenceEdit = true;
                    return enableSave;
                }
            }
        }
        this.isPreferenceEdit = false;
    }

    deleteContact(index) {
        if (this.contactFormList.at(index).get('userId').value == '') {
            this.contactFormList.removeAt(index);
            this.isAddContact = false;

        } else {
            let dialogData = {
                title: 'Delete Contact Details',
                hideConfirm: false,
            }

            const modalRef = this.commonService.openConfirmationModal(dialogData);
            modalRef.result.then((result) => {

                if (result) {
                    const contactId = this.contactFormList.at(index).get('contactId').value;

                    this.alertMeService.deleteAlterMeContact(contactId).subscribe(data => {
                        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                        this.alertService.show(cnst.Messages.GENERIC_SUCCCESS, 'success')
                        this.loadDetails();
                    });
                }
            }, (reason) => { 
                // This is intentional
            })
        }

    }

    checkIfContactIsEdit() {
        this.isContactEdit = false;
        for (let i = 0; i < this.contactFormList.length; i++) {
            let details = this.contactFormList.at(i);

            for (const field in details['controls']) {
                if (field == 'isEdit' || field == 'isDeleted')
                    if (details.get(field).value ) {
                        this.isContactEdit = true;
                    }
            }
        }
    }

    updateSpecificContact(index) {

        let dialogData = {
            title: 'Update Contact',
            hideConfirm: false,
        }

        const valueToUpdate = this.alertFormList.at(index).value;
        const modalRef = this.commonService.openConfirmationModal(dialogData);
        modalRef.result.then((result) => {
            if (result) {
                this.alertMeService.updateAlertMeContact(valueToUpdate).subscribe(data => {
                    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                    this.alertService.show(cnst.Messages.GENERIC_SUCCCESS, 'success');
                    this.isContactEdit = false;
                    this.loadDetails();

                    if (Object.keys(data).length > 0) {
                        let pos = 1;
                        let message = "Contact names : ";
                        for (let items in data) {
                            message = message + pos + " ) " + data[items] + " ";
                            pos++;
                        }
                        this.openErrorModal(message, cnst.FormErrorMessages.THE_FOLLOWING_CONTACTS_NOT_DELETED);
                    }
                });
            }
        }, (reason) => { })
    }

    updateContacts() {
        let listToSend = [];
        completeTrackingAlertMe();
        if (this.checkIfFormIsValid(this.contactFormList)) {

            let dialogData = {
                title: 'Update Contact',
                hideConfirm: false,
            }
            this.contactFormList.controls.forEach(eachForm => {
                if (eachForm.dirty) {
                    listToSend.push(eachForm.value);
                }
            }
            );
            const modalRef = this.commonService.openConfirmationModal(dialogData);
            modalRef.result.then((result) => {
                if (result) {
                    if (this.hasMainContact)
                        listToSend.shift();

                    this.alertMeService.updateAlertMeContact(listToSend).subscribe(data => {
                        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                        this.alertService.show(cnst.Messages.GENERIC_SUCCCESS, 'success');
                        this.isAddContact = false;
                        this.loadDetails();

                        if (Object.keys(data).length > 0) {
                            let index = 1;
                            let message = "Contact names : ";
                            for (let items in data) {
                                message = message + index + " ) " + data[items] + " ";
                                index++;
                            }
                            this.openErrorModal(message, cnst.FormErrorMessages.THE_FOLLOWING_CONTACTS_NOT_DELETED);
                        }
                    });
                }
            }, (reason) => {
                // This is intentional
             })
        } else {
            for (let i = 0; i < this.contactFormList.length; i++) {
                let details = this.contactFormList.at(i);
                for (const field in details['controls']) {
                    if (details.get(field).hasError)
                        details.get(field).markAsTouched();
                }
            }
            this.openErrorModal(cnst.FormErrorMessages.MSG_INCOMPLETE_FORM, 'Update Contact Details Error');
        }
    }


    cancelProfile(alertForm) {
        let currentPositionOfPage = window.scrollY;
        window.scrollTo({ top: currentPositionOfPage + 2, left: 0, behavior: 'smooth' });
        (alertForm as UntypedFormControl).markAsPristine();
        alertForm.get('isEdit').setValue(false);

        for (const field in alertForm['controls']) {
            if (!field.includes('Clone'))
                alertForm.get(field).patchValue(alertForm.get(field + 'Clone').value);

        }
        this.checkIfProfileIsEdit();
    }

    deleteNewProfile(index) {
        this.alertFormList.removeAt(index);
        this.isAddPerference = false;
    }

    deleteProfile(index) {

        let dialogData = {
            title: 'Delete Alert Profile',
            hideConfirm: false,
        }

        const modalRef = this.commonService.openConfirmationModal(dialogData);
        modalRef.result.then((result) => {

            if (result) {
                const alertProfileId = this.alertFormList.at(index).get('alertProfileId').value;
                this.alertMeService.deleteAlterMeProfile(alertProfileId).subscribe(data => {
                    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                    this.alertService.show(cnst.Messages.GENERIC_SUCCCESS, 'success')
                    this.loadDetails();
                });
            }
        }, (reason) => {
            // This is intentional
         })

    }

    checkIfProfileIsEdit() {
        this.isPreferenceEdit = false;
        for (let i = 0; i < this.alertFormList.length; i++) {
            let details = this.alertFormList.at(i);

            for (const field in details['controls']) {
                if (field == 'isEdit' || field == 'isDeleted')
                    if (details.get(field).value) {
                        this.isPreferenceEdit = true;
                    }
            }
        }
    }

    resortListByNonDeletedFirst(formArray) {
        let deletedList = [];
        for (let i = formArray.length - 1; i >= 0; i--) {
            let details = formArray.at(i);
            for (const field in details['controls']) {
                if (field == 'isDeleted')
                    if (details.get(field).value) {
                        deletedList.push(details);
                        formArray.removeAt(i);
                    }
            }
        }
        for (let i = 0; i < deletedList.length; i++) {
            formArray.push(deletedList[i]);
        }

    }

    updateSpecificProfile(index) {

        let dialogData = {
            title: 'Update Alert Preference',
            hideConfirm: false,
        }
        if (this.alertFormList.valid) {
            const valueToUpdate = this.alertFormList.at(index).value;
            if (valueToUpdate.minFloorArea == null) {
                valueToUpdate.minFloorArea = 0;
            }
            if (valueToUpdate.maxFloorArea == null) {
                valueToUpdate.maxFloorArea = cnst.maxFloorAreaMaximum;
            }
            const modalRef = this.commonService.openConfirmationModal(dialogData);
            modalRef.result.then((result) => {
                completeTrackingAlertMe();
                if (result && this.alertFormList.valid) {
                    this.alertMeService.updateAlertMeProfile(valueToUpdate).subscribe(data => {
                        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                        this.alertService.show(cnst.Messages.GENERIC_SUCCCESS, 'success');
                        this.isAddPerference = false;
                        this.loadDetails();

                    });
                } else {
                    for (let i = 0; i < this.alertFormList.length; i++) {
                        let details = this.alertFormList.at(i);
                        for (const field in details['controls']) {
                            if (details.get(field).hasError)
                                details.get(field).markAsTouched();
                        }
                    }
                }
            }, (reason) => {
                // This is intentional
             })
        } else {
            this.openErrorModal(cnst.FormErrorMessages.MSG_INCOMPLETE_FORM, 'Update Alert Preference Error');
        }
    }

    checkIfFormIsValid(formArray) {
        let validForm = true;
        for (let i = 0; i < formArray.length; i++) {
            let details = formArray.at(i);
            if (!details.get('isDeleted').value) {
                if (!details['controls'].toAlertByEmail.value && !details['controls'].toAlertBySms.value) {
                    validForm = false;
                    return validForm;
                }
                for (const field in details['controls']) {
                    if (!details.get(field).valid) {
                        validForm = false;
                        return validForm;
                    }
                }
            }
        }
        return validForm;
    }

    setFloorArea(form, searchFilterKey, floorArea) {
        if (searchFilterKey == 'maxFloorArea' && floorArea == null) {
            form.get(searchFilterKey).setValue(null);
            return;
        }
        if (searchFilterKey == 'minFloorArea' && floorArea == null) {
            form.get(searchFilterKey).setValue(null);
            return;
        }
        if (floorArea) {
            form.get(searchFilterKey).setValue('' + floorArea.key);
        } else {
            form.get(searchFilterKey).setValue(null);
        }

        this.minFloorAreaFocusOut(form);
    }

    minFloorAreaFocusOut(form) {
        let minFloorArea: number = form.value.minFloorArea

        if (minFloorArea && (minFloorArea < 0)) {
            form.get('minFloorArea').setValue('' + 0);
        }
    }

    maxFloorAreaFocusOut(form) {
        let maxFloorArea: number = form.value.maxFloorArea
        if (maxFloorArea && (maxFloorArea < 1)) {
            form.get('maxFloorArea').setValue('' + 1);
        }
    }

    openErrorModal(message: string, title: string) {
        let dialogData = {
            title: title,
            hideConfirm: true,
            textOrTpl: message
        }
        const modalRef = this.commonService.openConfirmationModal(dialogData);
        modalRef.result.then((result) => {
            if (result) {
                // This is intentional
            }
        }, (reason) => { 
            // This is intentional
        });
    }

    showSqft(value) {
        const output = new AreaSqFtUnitPipe();
        return output.transform(value);
    }

    displayTS(value){
        return this.numberWithCommas(value);
    }

    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    sortByKey(aLen, a, bLen, b) {
        if (aLen < bLen) {
            return -1
        }
        if (aLen > bLen) {
            return 1
        }
        if (a < b) {
            return -1
        }
        if (a > b) {
            return 1
        }
        return 0
    }

    sortByAlphabetical(a, b) {
        if (a < b) {
            return -1
        }
        if (a > b) {
            return 1
        }
        return 0
    }

    sort(form, formId, hdbTownListLabel, tradeListLabel, event: any) {
        if (event.length == undefined) {
           return;
        }

        const tradeListLabelArray = [];
        const hdbTownListLabelArray = [];
        const tradeListKeyArray = [];
        const hdbTownListKeyArray = [];
        let tradeListMap = new Map();
        let hdbTownListLabelMap = new Map();
        if (formId == 'trades') {
            for (let i = 0; i < event.length; i++) {
                if (!tradeListLabelArray.includes(event)) {
                    tradeListLabelArray.push(event[i].label);
                    tradeListMap.set(event[i].label, event[i].key)
                }
            }
            tradeListLabelArray.sort();
            for (let i = 0; i < tradeListLabelArray.length; i++) {
                tradeListKeyArray.push(tradeListMap.get(tradeListLabelArray[i]));
            }
            form.get(formId).setValue(tradeListKeyArray);
            form.get(tradeListLabel).setValue(" " + (tradeListLabelArray.join(', ')));
        }
        if (formId == 'hdbTowns') {
            for (let i = 0; i < event.length; i++) {
                if (!hdbTownListLabelArray.includes(event)) {
                    hdbTownListLabelArray.push(event[i].label);
                    hdbTownListLabelMap.set(event[i].label, event[i].key)
                }
            }
            hdbTownListLabelArray.sort();
            for (let i = 0; i < hdbTownListLabelArray.length; i++) {
                hdbTownListKeyArray.push(hdbTownListLabelMap.get(hdbTownListLabelArray[i]))
            }
            form.get(formId).setValue(hdbTownListKeyArray);
            form.get(hdbTownListLabel).setValue(" " + hdbTownListLabelArray.join(', '));
        }
    }

    sortOnEdit(form) {
        form.value.hdbTowns.sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
    }
}