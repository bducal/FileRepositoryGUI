import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { FileObject } from '../shared/FileObject';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import Config from "src/assets/config.json";

@Injectable({
  providedIn: 'root',
})
export class FileListService {

  private baseurl = Config.API_URL;

  constructor(private http: HttpClient) { }
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  getFiles(): Observable<FileObject> {
    return this.http
      .get<FileObject>(this.baseurl + '/FileList')
      .pipe(retry(1), catchError(this.errorHandl));
  }

  downloadFile(id:any): any {
    return this.http.get(this.baseurl+'/FileList/Download/'+id, {responseType: 'blob'});
   }

  getFile(id: any): Observable<FileObject> {
    return this.http
      .get<FileObject>(this.baseurl + '/FileList/' + id)
      .pipe(retry(1), catchError(this.errorHandl));
  }

  addFile(owner: string): Observable<FileObject> {
    var file: FileObject

    file = new FileObject("", "file", owner, [""])

    return this.http.put<FileObject>(this.baseurl + '/FileList/NEW', JSON.stringify(file), this.httpOptions)
      .pipe(retry(0), catchError(this.errorHandl));
  }

  deleteFile(id: any) {
    return this.http
      .delete<FileList>(this.baseurl + '/FileList/' + id, this.httpOptions)
      .pipe(retry(1), catchError(this.errorHandl));
  }

  updateFile(id: string, FileName: string, FileOwner: string, FileTags: string) {
    var file: FileObject

    var splitted = FileTags.split(",");

    file = new FileObject(id, FileName, FileOwner, splitted)

    return this.http
      .put<FileList>(this.baseurl + '/FileList/UPDATE', JSON.stringify(file), this.httpOptions)
      .pipe(retry(1), catchError(this.errorHandl));
  }

  // Error handling
  errorHandl(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}\n${error.issue_message}`;
    }
    console.log(errorMessage);
    return throwError(() => {
      return errorMessage;
    });
  }
}