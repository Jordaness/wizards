import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { SpellEffectsService } from '../spell-effects.service';

@Component({
  selector: 'app-spell-effect',
  template: `
    <div class="spell-effect-container">
      <canvas #shieldCanvas class="effect-canvas" [width]="width" [height]="height"></canvas>
      <canvas #attackCanvas class="effect-canvas" [width]="width" [height]="height"></canvas>
      <canvas #drainCanvas class="effect-canvas" [width]="width" [height]="height"></canvas>
      <canvas #cureCanvas class="effect-canvas" [width]="width" [height]="height"></canvas>
      <canvas #buffCanvas class="effect-canvas" [width]="width" [height]="height"></canvas>
      <canvas #debuffCanvas class="effect-canvas" [width]="width" [height]="height"></canvas>
      <canvas #castCanvas class="effect-canvas" [width]="width" [height]="height"></canvas>
      <canvas #deathCanvas class="effect-canvas" [width]="width" [height]="height"></canvas>
    </div>
  `,
  styles: [`
    .spell-effect-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
    }
    .effect-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  `]
})
export class SpellEffectComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() targetId: string;
  @Input() player: any;
  @Input() width = 150;
  @Input() height = 150;

  @ViewChild('shieldCanvas') shieldCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('attackCanvas') attackCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('drainCanvas') drainCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('cureCanvas') cureCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('buffCanvas') buffCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('debuffCanvas') debuffCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('castCanvas') castCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('deathCanvas') deathCanvas: ElementRef<HTMLCanvasElement>;

  private initialized = false;

  constructor(private spellEffects: SpellEffectsService) {}

  ngAfterViewInit(): void {
    this.initAllEffects();
    this.initialized = true;
    if (this.player) {
      this.spellEffects.updatePlayerState(this.targetId, this.player);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized && changes.player && this.player) {
      this.spellEffects.updatePlayerState(this.targetId, this.player);
    }
  }

  ngOnDestroy(): void {
    this.spellEffects.destroyTarget(this.targetId);
  }

  private initAllEffects(): void {
    if (!this.targetId) { return; }

    const canvasMap: { [artboard: string]: ElementRef<HTMLCanvasElement> } = {
      ShieldFX: this.shieldCanvas,
      AttackFX: this.attackCanvas,
      DrainFX: this.drainCanvas,
      CureFX: this.cureCanvas,
      BuffFX: this.buffCanvas,
      DebuffFX: this.debuffCanvas,
      CastFX: this.castCanvas,
      DeathFX: this.deathCanvas,
    };

    for (const [artboard, canvasRef] of Object.entries(canvasMap)) {
      if (canvasRef && canvasRef.nativeElement) {
        this.spellEffects.initEffect(this.targetId, canvasRef.nativeElement, artboard);
      }
    }
  }
}
