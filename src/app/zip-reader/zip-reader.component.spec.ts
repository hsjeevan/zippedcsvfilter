import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZipReaderComponent } from './zip-reader.component';

describe('ZipReaderComponent', () => {
  let component: ZipReaderComponent;
  let fixture: ComponentFixture<ZipReaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ZipReaderComponent]
    });
    fixture = TestBed.createComponent(ZipReaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
