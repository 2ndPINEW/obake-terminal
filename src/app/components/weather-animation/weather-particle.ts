/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable id-blacklist */
import { MoveDirection, OutMode, ParticlesOptions } from 'tsparticles-engine';

// TODO: as any 直します
export const rain = (strong: number): ParticlesOptions =>
  ({
    fpsLimit: 120,
    particles: {
      rotate: {
        value: 90,
        direction: 'clockwise',
      },
      move: {
        direction: MoveDirection.bottom,
        enable: true,
        outMode: OutMode.out,
        random: false,
        speed: 50,
        straight: true,
      },
      number: {
        limit: 0,
        value: strong,
      },
      shape: {
        stroke: {
          color: '#ffffff',
          width: 0.3,
          opacity: 0.8,
        },
        type: 'line',
      },
      size: {
        random: true,
        value: { min: 60, max: 80 },
      },
    },
  } as any);

export const snow = (strong: number): ParticlesOptions =>
  ({
    fpsLimit: 120,
    particles: {
      number: {
        value: strong,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: '#fff',
      },
      shape: {
        type: 'circle',
        stroke: {
          width: 0,
          color: '#000000',
        },
      },
      opacity: {
        value: 0.5,
        random: true,
        anim: {
          enable: false,
          speed: 1,
          opacity_min: 0.1,
          sync: false,
        },
      },
      size: {
        value: 8,
        random: true,
        anim: {
          enable: false,
          speed: 40,
          size_min: 0.1,
          sync: false,
        },
      },
      move: {
        enable: true,
        speed: 5,
        direction: MoveDirection.bottom,
        random: false,
        straight: false,
        out_mode: OutMode.out,
        bounce: false,
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200,
        },
      },
    },
  } as any);
