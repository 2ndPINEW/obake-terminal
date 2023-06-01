import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

interface WeatherAnimation {
  type: 'rain' | 'snow';
  strong: number;
}

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private _animation$ = new Subject<WeatherAnimation>();

  constructor() {}

  get animation$() {
    // eslint-disable-next-line no-underscore-dangle
    return this._animation$;
  }
}
