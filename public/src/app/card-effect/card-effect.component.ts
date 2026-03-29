import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { SpellEffectsService } from '../spell-effects.service';

@Component({
  selector: 'app-card-effect',
  template: `<canvas #cardCanvas class="card-effect-canvas" [width]="width" [height]="height"></canvas>`,
  styles: [`
    :host {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .card-effect-canvas {
      width: 100%;
      height: 100%;
    }
  `]
})
export class CardEffectComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() cardId: string;
  @Input() faceUp = false;
  @Input() width = 75;
  @Input() height = 75;

  @ViewChild('cardCanvas') cardCanvas: ElementRef<HTMLCanvasElement>;

  private initialized = false;

  constructor(private spellEffects: SpellEffectsService) {}

  ngAfterViewInit(): void {
    if (this.cardId && this.cardCanvas) {
      this.spellEffects.initEffect(this.cardId, this.cardCanvas.nativeElement, 'ObscureFX');
      this.initialized = true;
      this.updateState();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized && changes.faceUp) {
      this.updateState();
    }
  }

  ngOnDestroy(): void {
    if (this.cardId) {
      this.spellEffects.destroyTarget(this.cardId);
    }
  }

  private updateState(): void {
    if (!this.faceUp) {
      this.spellEffects.fireEffect(this.cardId, 'OBSCURE', { isObscured: true });
    } else {
      this.spellEffects.fireEffect(this.cardId, 'SCRY', {});
      this.spellEffects.fireEffect(this.cardId, 'OBSCURE', { isObscured: false });
    }
  }
}
