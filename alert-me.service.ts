import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as cnst from '../../common/constants';

@Injectable({
    providedIn: 'root'
})
export class AlertMeService {

    constructor(private http: HttpClient) { }

    getAlertMeDetails(): Observable<any> {
        return this.http.get<any>(cnst.apiBaseUrl + cnst.ApiUrl.ALERT_ME + '/view');
    }

    deleteAlterMeContact(contactId: number): Observable<any> {
        return this.http.get<any>(cnst.apiBaseUrl + cnst.ApiUrl.ALERT_ME + '/contact/delete/' + contactId);
    }

    deleteAlterMeProfile(alertProfileId: number): Observable<any> {
        return this.http.get<any>(cnst.apiBaseUrl + cnst.ApiUrl.ALERT_ME + '/profile/delete/' + alertProfileId);
    }

    updateAlertMeContact(form: any): Observable<any> {
        let formData: FormData = new FormData();
        formData.append('dto', new Blob(
            [JSON.stringify(form)],
            { type: 'application/json' }
        ));
        return this.http.post(cnst.apiBaseUrl + cnst.ApiUrl.ALERT_ME + '/contact/update', formData);
    }

    updateAlertMeProfile(form: any): Observable<any> {
        let formData: FormData = new FormData();
        formData.append('dto', new Blob(
            [JSON.stringify(form)],
            { type: 'application/json' }
        ));
        return this.http.post(cnst.apiBaseUrl + cnst.ApiUrl.ALERT_ME + '/profile/update', formData);
    }

}
