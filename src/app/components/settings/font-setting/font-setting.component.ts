import { Component, OnInit } from '@angular/core';
import {
  FontFamily,
  LocalFontService,
} from '../../../services/local-font.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-font-setting',
  templateUrl: './font-setting.component.html',
  styleUrls: ['./font-setting.component.scss'],
})
export class FontSettingComponent implements OnInit {
  fontFamilies: FontFamily[] = [];

  queryValue = '';

  constructor(private localFontService: LocalFontService) {}

  ngOnInit(): void {
    this.updateList();
  }

  updateList(): void {
    this.localFontService
      .fontFamilies$()
      .pipe(
        map((families) =>
          families.filter((family) =>
            family.query
              .toLocaleLowerCase()
              .includes(this.queryValue.toLocaleLowerCase())
          )
        )
      )
      .subscribe((families) => {
        this.fontFamilies = families;
      });
  }

  handleClick(family: string): void {
    this.localFontService.switchFontFamily$(family).subscribe();
  }

  onValueChange(): void {
    this.updateList();
  }
}
