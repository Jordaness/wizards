import { Injectable } from '@angular/core';
import { Rive, Layout, Fit, Alignment } from '@rive-app/canvas';

export interface RiveAnimationConfig {
  canvas: HTMLCanvasElement;
  src: string;
  stateMachines?: string;
  animations?: string[];
  autoplay?: boolean;
  fit?: Fit;
  alignment?: Alignment;
}

@Injectable({
  providedIn: 'root'
})
export class RiveAnimationService {
  private activeAnimations: Map<string, Rive> = new Map();

  create(id: string, config: RiveAnimationConfig): Rive {
    this.destroy(id);

    const rive = new Rive({
      canvas: config.canvas,
      src: config.src,
      stateMachines: config.stateMachines,
      animations: config.animations,
      autoplay: config.autoplay !== undefined ? config.autoplay : true,
      layout: new Layout({
        fit: config.fit || Fit.Contain,
        alignment: config.alignment || Alignment.Center,
      }),
    });

    this.activeAnimations.set(id, rive);
    return rive;
  }

  play(id: string, animationName?: string): void {
    const rive = this.activeAnimations.get(id);
    if (rive) {
      if (animationName) {
        rive.play(animationName);
      } else {
        rive.play();
      }
    }
  }

  pause(id: string): void {
    const rive = this.activeAnimations.get(id);
    if (rive) {
      rive.pause();
    }
  }

  stop(id: string): void {
    const rive = this.activeAnimations.get(id);
    if (rive) {
      rive.stop();
    }
  }

  destroy(id: string): void {
    const rive = this.activeAnimations.get(id);
    if (rive) {
      rive.stop();
      rive.cleanup();
      this.activeAnimations.delete(id);
    }
  }

  destroyAll(): void {
    this.activeAnimations.forEach((rive, id) => {
      rive.stop();
      rive.cleanup();
    });
    this.activeAnimations.clear();
  }

  get(id: string): Rive | undefined {
    return this.activeAnimations.get(id);
  }
}
