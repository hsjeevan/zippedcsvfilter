import { Component } from '@angular/core';
import { ZipService } from '../zip-service.service';

@Component({
  selector: 'app-zip-reader',
  templateUrl: './zip-reader.component.html',
  styleUrls: ['./zip-reader.component.scss']
})
export class ZipReaderComponent {
  jsonResults: any;
  selectedFile: File | null = null;
  filterFile: File | null = null;
  filenames: any = [];

  constructor(public zipService: ZipService) { }

  handleFileInput(event: any): void {
    this.reset();
    this.selectedFile = event.target.files[0];
  }

  filterFileInput(event: any): void {
    this.reset();
    this.filterFile = event.target.files[0];
  }
  reset() {
    this.filenames = [];
    this.jsonResults = [];
    this.zipService.blob = undefined;
  }

  async processZip() {

    if (this.selectedFile && this.filterFile) {
      const filterObj = await this.zipService.extractFilterFields(this.filterFile);

      const jsonDataArray = await this.zipService.extractAndConvertToJson(this.selectedFile, filterObj);
      this.jsonResults = jsonDataArray;
      this.filenames = Object.keys(jsonDataArray)

    } else {
      console.error('No file selected.');
    }
  }
  getHeaders(innerJson: any) {
    return Object.keys(innerJson[0]);
  }

  downloadData() {
    this.zipService.download();
    this.reset();
  }

}
