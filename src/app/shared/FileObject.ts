export class FileObject {
    id: string
    FileName: string
    FileTags: string[]
    FileOwner: string

    constructor(id: string, FileName: string,FileOwner:string,FileTags: string[]){
        this.id=id 
        this.FileName=FileName
        this.FileOwner=FileOwner
        this.FileTags=FileTags
        }
 }



 