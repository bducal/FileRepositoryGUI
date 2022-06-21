import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import Config from "src/assets/config.json";

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  private baseUrl = Config.API_URL;

  constructor(private http: HttpClient) { }
  uploadFile(file: File, FileID: string): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('File', file);
    formData.append('FileID', FileID);
    const req = new HttpRequest('POST', `${this.baseUrl}/FileList`, formData, {
      reportProgress: true,
      responseType: 'json'
    });
    return this.http.request(req);
  }
  getFiles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/files`);
  }
}