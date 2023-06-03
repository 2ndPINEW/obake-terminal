import { Injectable } from '@angular/core';
import { BehaviorSubject, from, map, of } from 'rxjs';

interface FontData {
  family: string;
  fullName: string;
  postscriptName: string;
  style: string;
}

declare global {
  interface Window {
    queryLocalFonts: () => Promise<FontData[]>;
  }
  interface Navigator {
    fonts: {
      query: () => Promise<FontData[]>;
    };
  }
}

/**
 * ローカルにインストールされているフォントを取得、切り替えるためのサービス
 */
@Injectable({
  providedIn: 'root',
})
export class LocalFontService {
  readonly isLocalFontApiEnabled =
    window.queryLocalFonts !== undefined ||
    navigator.fonts?.query !== undefined;

  readonly currentFontFamily$ = new BehaviorSubject<string>('sans-serif');

  constructor() {
    this.currentFontFamily$.subscribe((family) => {
      document.body.style.fontFamily = family;
    });
  }

  queryLocalFonts$() {
    if (window.queryLocalFonts) {
      return from(window.queryLocalFonts());
    }
    if (navigator.fonts?.query) {
      return from(navigator.fonts.query());
    }
    return of([] as FontData[]);
  }

  // めちゃなうい記事発見
  // https://developer.chrome.com/blog/how-boxysvg-uses-the-local-font-access-api/
  fontFamilies$() {
    return this.queryLocalFonts$().pipe(
      map((localFonts) => {
        const fontsIndex: {
          family: string;
          faces: string[];
        }[] = [];

        for (const localFont of localFonts) {
          let face = '400';

          let subfamily = localFont.style.toLowerCase();
          subfamily = subfamily.replaceAll(' ', '');
          subfamily = subfamily.replaceAll('-', '');
          subfamily = subfamily.replaceAll('_', '');

          if (subfamily.includes('thin')) {
            face = '100';
          } else if (subfamily.includes('extralight')) {
            face = '200';
          } else if (subfamily.includes('light')) {
            face = '300';
          } else if (subfamily.includes('medium')) {
            face = '500';
          } else if (subfamily.includes('semibold')) {
            face = '600';
          } else if (subfamily.includes('extrabold')) {
            face = '800';
          } else if (subfamily.includes('ultrabold')) {
            face = '900';
          } else if (subfamily.includes('bold')) {
            face = '700';
          }

          if (subfamily.includes('italic')) {
            face += 'i';
          }

          const descriptor = fontsIndex.find(
            (desc) => desc.family === localFont.family
          );

          if (descriptor) {
            if (descriptor.faces.includes(face) === false) {
              descriptor.faces.push(face);
            }
          } else {
            const desc = {
              family: localFont.family,
              faces: [face],
            };

            fontsIndex.push(desc);
          }
        }
        return fontsIndex;
      })
    );
  }

  switchFontFamily$(family: string) {
    return this.fontFamilies$().pipe(
      map((fontsIndex) => {
        const descriptor = fontsIndex.find((desc) => desc.family === family);
        this.currentFontFamily$.next(family);
        return !!descriptor;
      })
    );
  }
}
