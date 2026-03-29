import { Injectable } from '@angular/core';
import { RiveAnimationService, RiveAnimationConfig } from './rive-animation.service';
import { Rive, StateMachineInput } from '@rive-app/canvas';

/**
 * Maps game actions to Rive State Machine inputs for interactive spell effects.
 *
 * Artboard / State Machine naming convention:
 *   - ShieldFX   (inputs: isShielded:bool, onHit:trigger, currentShieldValue:number)
 *   - AttackFX   (inputs: onFire:trigger, onTargetHit:trigger, damageValue:number)
 *   - DrainFX    (inputs: onDrain:trigger, drainValue:number)
 *   - CureFX     (inputs: onHeal:trigger, healValue:number)
 *   - BuffFX     (inputs: isRegening:bool, isHasted:bool, isSlowed:bool, apValue:number, hpValue:number)
 *   - DebuffFX   (inputs: isBurning:bool, burnValue:number)
 *   - ObscureFX  (inputs: isObscured:bool, onReveal:trigger)
 *   - CastFX     (inputs: onCastSuccess:trigger, onCastFail:trigger)
 *   - DeathFX    (inputs: onDeath:trigger)
 */

export interface SpellEffectMapping {
  inputName: string;
  inputType: 'boolean' | 'trigger' | 'number';
}

export const ACTION_EFFECT_MAP: { [action: string]: { artboard: string; inputs: SpellEffectMapping[] } } = {
  // Defensive
  SHIELD: {
    artboard: 'ShieldFX',
    inputs: [
      { inputName: 'isShielded', inputType: 'boolean' },
      { inputName: 'currentShieldValue', inputType: 'number' }
    ]
  },
  SHIELD_HIT: {
    artboard: 'ShieldFX',
    inputs: [
      { inputName: 'onHit', inputType: 'trigger' }
    ]
  },

  // Offensive
  ATTACK: {
    artboard: 'AttackFX',
    inputs: [
      { inputName: 'onFire', inputType: 'trigger' },
      { inputName: 'damageValue', inputType: 'number' }
    ]
  },
  ATTACK_HIT: {
    artboard: 'AttackFX',
    inputs: [
      { inputName: 'onTargetHit', inputType: 'trigger' }
    ]
  },
  ATTACK_ALL: {
    artboard: 'AttackFX',
    inputs: [
      { inputName: 'onFire', inputType: 'trigger' },
      { inputName: 'damageValue', inputType: 'number' }
    ]
  },

  // Drain
  DRAIN: {
    artboard: 'DrainFX',
    inputs: [
      { inputName: 'onDrain', inputType: 'trigger' },
      { inputName: 'drainValue', inputType: 'number' }
    ]
  },

  // Healing
  CURE: {
    artboard: 'CureFX',
    inputs: [
      { inputName: 'onHeal', inputType: 'trigger' },
      { inputName: 'healValue', inputType: 'number' }
    ]
  },

  // Buff tokens
  HP_PLUS: {
    artboard: 'BuffFX',
    inputs: [
      { inputName: 'isRegening', inputType: 'boolean' },
      { inputName: 'hpValue', inputType: 'number' }
    ]
  },
  AP_PLUS: {
    artboard: 'BuffFX',
    inputs: [
      { inputName: 'isHasted', inputType: 'boolean' },
      { inputName: 'apValue', inputType: 'number' }
    ]
  },

  // Debuff tokens
  HP_MINUS: {
    artboard: 'DebuffFX',
    inputs: [
      { inputName: 'isBurning', inputType: 'boolean' },
      { inputName: 'burnValue', inputType: 'number' }
    ]
  },
  AP_MINUS: {
    artboard: 'BuffFX',
    inputs: [
      { inputName: 'isSlowed', inputType: 'boolean' },
      { inputName: 'apValue', inputType: 'number' }
    ]
  },

  // Board manipulation
  OBSCURE: {
    artboard: 'ObscureFX',
    inputs: [
      { inputName: 'isObscured', inputType: 'boolean' }
    ]
  },
  SCRY: {
    artboard: 'ObscureFX',
    inputs: [
      { inputName: 'onReveal', inputType: 'trigger' }
    ]
  },

  // Casting
  CAST_SUCCESS: {
    artboard: 'CastFX',
    inputs: [
      { inputName: 'onCastSuccess', inputType: 'trigger' }
    ]
  },
  CAST_FAIL: {
    artboard: 'CastFX',
    inputs: [
      { inputName: 'onCastFail', inputType: 'trigger' }
    ]
  },

  // Death
  DEATH: {
    artboard: 'DeathFX',
    inputs: [
      { inputName: 'onDeath', inputType: 'trigger' }
    ]
  }
};

@Injectable({
  providedIn: 'root'
})
export class SpellEffectsService {
  private riveInstances: Map<string, Rive> = new Map();
  private inputCache: Map<string, Map<string, StateMachineInput>> = new Map();

  constructor(private riveService: RiveAnimationService) {}

  /**
   * Initialize a Rive effect on a canvas for a specific target (player/enemy/card).
   */
  initEffect(targetId: string, canvas: HTMLCanvasElement, artboard: string): void {
    const id = `effect-${targetId}-${artboard}`;
    const src = `assets/animations/${artboard}.riv`;

    const rive = this.riveService.create(id, {
      canvas,
      src,
      stateMachines: 'MainStateMachine',
      autoplay: true,
    }, (loadedRive) => {
      this.cacheInputs(id, loadedRive);
    });

    this.riveInstances.set(id, rive);
  }

  /**
   * Fire a game action effect on a target.
   */
  fireEffect(targetId: string, action: string, values: { [key: string]: any } = {}): void {
    const mapping = ACTION_EFFECT_MAP[action];
    if (!mapping) { return; }

    const id = `effect-${targetId}-${mapping.artboard}`;
    const inputs = this.inputCache.get(id);
    if (!inputs) { return; }

    for (const inputDef of mapping.inputs) {
      const input = inputs.get(inputDef.inputName);
      if (!input) { continue; }

      switch (inputDef.inputType) {
        case 'trigger':
          input.fire();
          break;
        case 'boolean':
          input.value = values[inputDef.inputName] !== undefined ? values[inputDef.inputName] : true;
          break;
        case 'number':
          if (values[inputDef.inputName] !== undefined) {
            input.value = values[inputDef.inputName];
          }
          break;
      }
    }
  }

  /**
   * Update persistent state (shields, tokens) for a target.
   */
  updatePlayerState(targetId: string, player: any): void {
    if (!player) { return; }

    // Shield state
    this.fireEffect(targetId, 'SHIELD', {
      isShielded: player.shields > 0,
      currentShieldValue: player.shields
    });

    // Regen state
    this.fireEffect(targetId, 'HP_PLUS', {
      isRegening: player.hptokens > 0,
      hpValue: player.hptokens
    });

    // Burn state
    this.fireEffect(targetId, 'HP_MINUS', {
      isBurning: player.hptokens < 0,
      burnValue: Math.abs(player.hptokens)
    });

    // Haste state
    this.fireEffect(targetId, 'AP_PLUS', {
      isHasted: player.aptokens > 0,
      apValue: player.aptokens
    });

    // Slow state
    this.fireEffect(targetId, 'AP_MINUS', {
      isSlowed: player.aptokens < 0,
      apValue: Math.abs(player.aptokens)
    });

    // Death
    if (player.isGhost) {
      this.fireEffect(targetId, 'DEATH', {});
    }
  }

  /**
   * Clean up all effects for a target.
   */
  destroyTarget(targetId: string): void {
    const keysToRemove: string[] = [];
    this.riveInstances.forEach((_, key) => {
      if (key.startsWith(`effect-${targetId}-`)) {
        keysToRemove.push(key);
      }
    });
    for (const key of keysToRemove) {
      this.riveService.destroy(key);
      this.riveInstances.delete(key);
      this.inputCache.delete(key);
    }
  }

  /**
   * Clean up everything.
   */
  destroyAll(): void {
    this.riveInstances.forEach((_, key) => {
      this.riveService.destroy(key);
    });
    this.riveInstances.clear();
    this.inputCache.clear();
  }

  private cacheInputs(id: string, rive: Rive): void {
    const cache = new Map<string, StateMachineInput>();
    try {
      const inputs = rive.stateMachineInputs('MainStateMachine');
      if (inputs) {
        for (const input of inputs) {
          cache.set(input.name, input);
        }
      }
    } catch (e) {
      console.warn('SpellEffectsService: Could not cache inputs for ' + id, e);
    }
    this.inputCache.set(id, cache);
  }

  private resizeForHiDPI(canvas: HTMLCanvasElement): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }
}
