import { Component } from '@angular/core';
import { Container, Engine, ParticlesOptions } from 'tsparticles-engine';
import { loadFull } from 'tsparticles';
import { WeatherService } from '../../services/omotenashi/weather.service';
import { rain, snow } from './weather-particle';

@Component({
  selector: 'app-weather-animation',
  templateUrl: './weather-animation.component.html',
  styleUrls: ['./weather-animation.component.scss'],
})
export class WeatherAnimationComponent {
  particlesOptions: ParticlesOptions | undefined;

  constructor(private weatherService: WeatherService) {
    weatherService.animation$.subscribe((animation) => {
      console.log(animation);

      if (animation.type === 'rain') {
        this.particlesOptions = rain(animation.strong);
      }
      if (animation.type === 'snow') {
        this.particlesOptions = snow(animation.strong);
      }
    });
  }

  particlesLoaded(container: Container): void {
    console.log(container);
  }

  async particlesInit(engine: Engine): Promise<void> {
    console.log(engine);

    // Starting from 1.19.0 you can add custom presets or shape here, using the current tsParticles instance (main)
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    await loadFull(engine);
  }
}
