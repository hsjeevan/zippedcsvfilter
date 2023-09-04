import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import * as Papa from 'papaparse';

@Injectable({
  providedIn: 'root'
})
export class ZipService {
  blob: Blob | undefined;
  filename: any;

  constructor() { }

  async extractAndConvertToJson(zipFile: File, filterObj: any): Promise<any[]> {
    this.blob = undefined;
    const zipContent = await this.readFileAsArrayBuffer(zipFile);
    const zip = await JSZip.loadAsync(zipContent);
    const fileObj: any = {};
    let delimiter: string = '';

    for (const fileName in zip.files) {
      if (zip.files[fileName]) {
        const file = zip.files[fileName];
        if (file.name.endsWith('.csv')) {
          const csvContent = await file.async('string');
          const result = await this.convertCsvToJson(csvContent);
          delimiter = result.delimiter;
          const filter = this.getFilterObject(result.data, filterObj);
          const jsonDataArray = this.applyFilters(result.data, filter);
          fileObj[fileName] = jsonDataArray;
        }
      }
    }
    this.filename = zipFile.name;

    this.convertAndZipJSONToCSV(fileObj, delimiter);
    return fileObj;
  }

  applyFilters(array: any, filters: any) {
    return array.filter((obj: any) => filters.some((filterObj: any) =>
      Object.keys(filterObj).every(key => this.parseInteger(obj[key]) === this.parseInteger(filterObj[key]))));
  }

  parseInteger(value: any) {
    if (isNaN(value)) {
      return value?.toLowerCase().trim();
    } else {
      return parseInt(value);
    }
  }

  getFilterObject(jsonData: any, filterObj: any) {
    const commonFields = Object.keys(jsonData[0]).filter(field => Object.keys(filterObj[0]).includes(field));
    const resultArray = filterObj.reduce((accumulator: any, obj: any) => {
      const filteredObject: any = {};
      for (const field of commonFields) {
        filteredObject[field] = obj[field];
      }
      accumulator.push(filteredObject);
      return accumulator;
    }, []);

    return resultArray;
  }

  async extractFilterFields(csvFile: File): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      Papa.parse(csvFile, {
        header: true,
        dynamicTyping: true,
        complete: function (results: Papa.ParseResult<any>) {          
          resolve(results.data);
        },
        error: function (error) {
          console.error('Error parsing CSV:', error.message);
          reject(error);
        }
      });
    });
  }

  private convertCsvToJson(csvContent: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      Papa.parse(csvContent, {
        header: true,
        complete: function (results: Papa.ParseResult<any>) {
          const delimiter = results.meta.delimiter;
          resolve({ data: results.data, delimiter });
        },
        error: (error: Error) => {
          console.error('Error parsing CSV:', error.message);
          reject(error);
        }
      });
    });
  }

  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        resolve(event.target.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  async convertAndZipJSONToCSV(jsonData: any, delimiter: string) {

    const zip = new JSZip();
    for (const key in jsonData) {
      if (jsonData[key]) {
        const data = jsonData[key];
        const headers = Object.keys(data[0]);
        const csv = [headers.map(header => `"${header}"`).join(delimiter)];

        for (const item of data) {
          const line = headers.map(header => `"${item[header] || ''}"`).join(delimiter);
          csv.push(line);
        }

        const csvContent = csv.join('\n');
        zip.file(`${key}.csv`, csvContent);
      }
    }

    this.blob = await zip.generateAsync({ type: 'blob' });
  }

  download() {
    if (this.blob) {
      const url = window.URL.createObjectURL(this.blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date();
      const formattedDate = `${date.getMonth() + 1}${date.getDate()}${date.getFullYear()}`;

      const nameSplit = this.filename.split('.');

      a.download = nameSplit[0] + '-' + formattedDate + '.' + nameSplit[1];
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }
}
