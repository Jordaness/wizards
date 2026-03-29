import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { RiveAnimationService } from '../rive-animation.service';
import { Fit, Alignment } from '@rive-app/canvas';

@Component({
  selector: 'app-rive-animation',
  template: `<canvas #riveCanvas [width]="width" [height]="height"></canvas>`,
  styles: [`
    :host {
      display: inline-block;
    }
    canvas {
      display: block;
    }
  `]
})
export class RiveAnimationComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('riveCanvas') canvasRef: ElementRef<HTMLCanvasElement>;

  @Input() animationId: string;
  @Input() src: string;
  @Input() stateMachines: string;
  @Input() animations: string[];
  @Input() autoplay = true;
  @Input() width = 200;
  @Input() height = 200;
  @Input() fit: Fit = Fit.Contain;
  @Input() alignment: Alignment = Alignment.Center;

  private initialized = false;

  constructor(private riveService: RiveAnimationService) {}

  ngAfterViewInit(): void {
    this.initAnimation();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized && (changes.src || changes.animations || changes.stateMachines)) {
      this.initAnimation();
    }
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      this.riveService.destroy(this.animationId);
    }
  }

  private initAnimation(): void {
    if (!this.canvasRef || !this.src || !this.animationId) {
      return;
    }

    this.riveService.create(this.animationId, {
      canvas: this.canvasRef.nativeElement,
      src: this.src,
      stateMachines: this.stateMachines,
      animations: this.animations,
      autoplay: this.autoplay,
      fit: this.fit,
      alignment: this.alignment,
    });

    this.initialized = true;
  }

  play(animationName?: string): void {
    this.riveService.play(this.animationId, animationName);
  }

  pause(): void {
    this.riveService.pause(this.animationId);
  }

  stop(): void {
    this.riveService.stop(this.animationId);
  }
}
