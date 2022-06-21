import { Component, OnInit, ViewChild } from '@angular/core';
import { FileListService } from 'src/app/services/file-list.service';
import { FileObject } from '../shared/FileObject';
import { FileUploadService } from 'src/app/services/file-upload.service';

import { Injectable } from '@angular/core'

import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { cloneDeep } from 'lodash';

import Config from "src/assets/config.json";

const COLUMNS_SCHEMA = [
  {
    key: "id",
    type: "text",
    label: "Full Name"
  },
  {
    key: "FileName",
    type: "text",
    label: "File Name"
  },
  {
    key: "FileTags",
    type: "text",  
    label: "File Tags"
  },
  {
    key: "FileOwner",
    type: "text",  
    label: "Owner"
  },
  {
    key: "isEdit",
    type: "isEdit",
    label: "Actions"
  }
]

//Nice tutorial: https://muhimasri.com/blogs/create-an-editable-dynamic-table-using-angular-material/

@Component({
  selector: 'file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.css']
})

@Injectable({ providedIn: 'root' })
export class FileExplorerComponent implements OnInit {
  selectedFiles?: FileList;
  currentFile?: File;
  progress = 0;
  message = '';
  fileInfos?: Observable<any>;

  useAuthentication = Config.useAuthentication;

  FileList: any = [];
  tempFileList: any = [];

  displayedColumns: string[] = ['FileName', 'FileTags', 'FileOwner', 'isEdit'];
  dataSource: any;
  columnsSchema: any = COLUMNS_SCHEMA;

  username = localStorage.getItem('username');

  constructor(private fileListService: FileListService, private uploadService: FileUploadService) {
  }

  ngOnInit(): void {
    this.loadFileList();
    console.log("Init file-explorer");
  }

  @ViewChild(MatSort) sort: MatSort;


  loadFileList() {
    if (this.useAuthentication == "False")
      this.username = "UNKNOWN";
    else
      this.username = localStorage.getItem('username');
    if (this.username != null)
    {
      return this.fileListService.getFiles().subscribe((data: {}) => {
        this.FileList = data;
        this.tempFileList = cloneDeep(data);
        this.dataSource = new MatTableDataSource<FileObject>(this.FileList);
        this.dataSource.sort = this.sort;
      })
    }
    else
      return null;
  }

  public deleteFile(id: any) {
    this.fileListService.getFile(id).subscribe((fl: any) => {
      if (confirm("Are you sure to delete: " + fl[0].FileName)) {
        return this.fileListService.deleteFile(id).subscribe((data: {}) => {
          this.FileList = data;
          this.tempFileList = cloneDeep(data);
          this.dataSource = new MatTableDataSource<FileObject>(this.FileList);
          this.dataSource.sort = this.sort;
        })

      }
      return this.fileListService.getFiles();
    });
  }

  updateFile(id: string, FileName: string, FileTags: string): void {
    if (FileTags == null)
      FileTags = "";
    this.fileListService.updateFile(id, FileName, this.username, FileTags.toString()).subscribe((data: {}) => {
      this.FileList = data;
      this.tempFileList = cloneDeep(data);
    })
  }

  oldTags(id: string) {
    return this.tempFileList.find((o) => { return o.id === id; }).FileTags;
  }
  oldName(id: string) {
    return this.tempFileList.find((o) => { return o.id === id; }).FileName;
  }

  blob: any;

  public downloadFile(id: any) {
    return this.fileListService.getFile(id).subscribe((fl: any) => {
      this.fileListService.downloadFile(id).subscribe((response: any) => { //when you use stricter type checking
        let blob: any = new Blob([response], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        ///window.open(url);
        //window.location.href = response.url;
        //fileSaver.saveAs(blob, 'employees.json');

        var link = document.createElement('a');
        link.href = url;
        link.target = "_new";
        link.download = fl[0].FileName;
        link.click();

      });
    });
  }


  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
    this.uploadFile();

  }

  selected: string = "";
  filevalue: string = null;

  uploadFile(): void {
    var nazwa: string = "unknown";

    this.fileListService.addFile(this.username).subscribe((data: any) => {
      this.selected = data[0].id;

      this.progress = 0;
      if (this.selectedFiles) {
        const file: File | null = this.selectedFiles.item(0);
        nazwa = this.selectedFiles.item(0).name;
        if (file) {
          this.currentFile = file;
          this.uploadService.uploadFile(this.currentFile, this.selected).subscribe(
            (event: any) => {
              if (event.type === HttpEventType.UploadProgress) {
                this.progress = Math.round(100 * event.loaded / event.total);
              } else if (event instanceof HttpResponse) {
                this.message = event.body.message;
                this.fileInfos = this.uploadService.getFiles();
              }
            },
            (err: any) => {
              console.log(err);
              this.progress = 0;
              if (err.error && err.error.message) {
                this.message = err.error.message;
              } else {
                this.message = 'Could not upload the file!';
              }
              this.currentFile = undefined;
            });
        }

        this.selectedFiles = undefined;
        this.filevalue = null;
      }
      this.fileListService.updateFile(this.selected, nazwa, this.username, "").subscribe((data: {}) => { this.loadFileList() })
    })
  }
}



