import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { WebsocketService } from './websocket.service';
import { SpellEffectsService } from './spell-effects.service';
import { RiveAnimationService } from './rive-animation.service';

class MockSpellEffectsService {
  fireEffect(targetId: string, action: string, values: any = {}) {}
  updatePlayerState(targetId: string, player: any) {}
  initEffect(targetId: string, canvas: any, artboard: string) {}
  destroyTarget(targetId: string) {}
  destroyAll() {}
}

class MockRiveAnimationService {
  create() { return {}; }
  destroy() {}
  play() {}
  stop() {}
  pause() {}
  get() { return undefined; }
  destroyAll() {}
}

describe('WebsocketService', () => {
  let service: WebsocketService;
  let mockSpellFx: MockSpellEffectsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        WebsocketService,
        { provide: SpellEffectsService, useClass: MockSpellEffectsService },
        { provide: RiveAnimationService, useClass: MockRiveAnimationService }
      ]
    });
    service = TestBed.get(WebsocketService);
    mockSpellFx = TestBed.get(SpellEffectsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('cardCounterReset', () => {
    it('should reset both counters to 0', () => {
      service.cardsFaceUp = 5;
      service.cardsFaceDown = 7;
      service.cardCounterReset();
      expect(service.cardsFaceUp).toBe(0);
      expect(service.cardsFaceDown).toBe(0);
    });
  });

  describe('cardCounters', () => {
    it('should count face up and face down cards', () => {
      service.cardCounterReset();
      const state = {
        gameboard: {
          grid: [
            [{ faceUp: true }, { faceUp: false }, { faceUp: true }, { faceUp: false }],
            [{ faceUp: false }, { faceUp: true }, { faceUp: true }, { faceUp: false }],
            [{ faceUp: false }, { faceUp: true }, { faceUp: true }, { faceUp: false }],
            [{ faceUp: false }, { faceUp: false }, { faceUp: false }, { faceUp: false }]
          ]
        }
      };
      service.cardCounters(state);
      expect(service.cardsFaceUp).toBe(6);
      expect(service.cardsFaceDown).toBe(10);
    });

    it('should handle null gameboard gracefully', () => {
      service.cardCounterReset();
      service.cardCounters({});
      expect(service.cardsFaceUp).toBe(0);
      expect(service.cardsFaceDown).toBe(0);
    });

    it('should handle null grid gracefully', () => {
      service.cardCounterReset();
      service.cardCounters({ gameboard: {} });
      expect(service.cardsFaceUp).toBe(0);
      expect(service.cardsFaceDown).toBe(0);
    });
  });

  describe('getActor', () => {
    it('should set actor to matching player by socketid', () => {
      service.playerid = 'abc123';
      const state = {
        players: [
          { socketid: 'xyz', name: 'Other' },
          { socketid: 'abc123', name: 'Me' }
        ]
      };
      service.getActor(state);
      expect(service.actor).toBeTruthy();
      expect(service.actor.name).toBe('Me');
    });

    it('should not change actor if no match found', () => {
      service.playerid = 'notfound';
      service.actor = null;
      const state = {
        players: [
          { socketid: 'xyz', name: 'Other' }
        ]
      };
      service.getActor(state);
      expect(service.actor).toBeNull();
    });
  });

  describe('counter management', () => {
    it('should get and set counter', () => {
      service.setCounter(5);
      expect(service.getCounter()).toBe(5);
    });

    it('should reduce counter by 1', () => {
      service.setCounter(3);
      service.reduceCounter();
      expect(service.getCounter()).toBe(2);
    });
  });

  describe('getEffectsCount', () => {
    it('should return 0 when no effects', () => {
      service.effects = [];
      expect(service.getEffectsCount()).toBe(0);
    });

    it('should return correct count', () => {
      service.effects = [{ type: 'ATTACK' }, { type: 'CURE' }];
      expect(service.getEffectsCount()).toBe(2);
    });
  });

  describe('getObservable', () => {
    it('should return an observable', () => {
      const obs = service.getObservable();
      expect(obs).toBeTruthy();
      expect(obs.subscribe).toBeDefined();
    });
  });

  describe('getGameState', () => {
    it('should return an observable', () => {
      const obs = service.getGameState();
      expect(obs).toBeTruthy();
      expect(obs.subscribe).toBeDefined();
    });
  });

  describe('getPlayer', () => {
    it('should return the actor', () => {
      service.actor = { name: 'Merlin', id: 1 };
      expect(service.getPlayer()).toEqual({ name: 'Merlin', id: 1 });
    });

    it('should return null when no actor set', () => {
      service.actor = null;
      expect(service.getPlayer()).toBeNull();
    });
  });

  describe('detectAndFireEffects', () => {
    it('should fire ATTACK_HIT when player health decreases', () => {
      spyOn(mockSpellFx, 'fireEffect');
      service.actor = { id: 1 };
      const prev = { players: [{ id: 2, health: 5, shields: 0, hptokens: 0, aptokens: 0, isGhost: false }] };
      const curr = { players: [{ id: 2, health: 3, shields: 0, hptokens: 0, aptokens: 0, isGhost: false }] };
      (service as any).detectAndFireEffects(prev, curr);
      expect(mockSpellFx.fireEffect).toHaveBeenCalledWith('enemy-2', 'ATTACK_HIT', { damageValue: 2 });
    });

    it('should fire SHIELD_HIT when shields decrease with health', () => {
      spyOn(mockSpellFx, 'fireEffect');
      service.actor = { id: 1 };
      const prev = { players: [{ id: 2, health: 5, shields: 2, hptokens: 0, aptokens: 0, isGhost: false }] };
      const curr = { players: [{ id: 2, health: 4, shields: 0, hptokens: 0, aptokens: 0, isGhost: false }] };
      (service as any).detectAndFireEffects(prev, curr);
      expect(mockSpellFx.fireEffect).toHaveBeenCalledWith('enemy-2', 'SHIELD_HIT', {});
    });

    it('should fire CURE when health increases', () => {
      spyOn(mockSpellFx, 'fireEffect');
      service.actor = { id: 1 };
      const prev = { players: [{ id: 1, health: 3, shields: 0, hptokens: 0, aptokens: 0, isGhost: false }] };
      const curr = { players: [{ id: 1, health: 5, shields: 0, hptokens: 0, aptokens: 0, isGhost: false }] };
      (service as any).detectAndFireEffects(prev, curr);
      expect(mockSpellFx.fireEffect).toHaveBeenCalledWith('player-1', 'CURE', { healValue: 2 });
    });

    it('should fire DEATH when player becomes ghost', () => {
      spyOn(mockSpellFx, 'fireEffect');
      service.actor = { id: 1 };
      const prev = { players: [{ id: 2, health: 1, shields: 0, hptokens: 0, aptokens: 0, isGhost: false }] };
      const curr = { players: [{ id: 2, health: 0, shields: 0, hptokens: 0, aptokens: 0, isGhost: true }] };
      (service as any).detectAndFireEffects(prev, curr);
      expect(mockSpellFx.fireEffect).toHaveBeenCalledWith('enemy-2', 'DEATH', {});
    });

    it('should fire HP_PLUS when hptokens increase', () => {
      spyOn(mockSpellFx, 'fireEffect');
      service.actor = { id: 1 };
      const prev = { players: [{ id: 1, health: 5, shields: 0, hptokens: 0, aptokens: 0, isGhost: false }] };
      const curr = { players: [{ id: 1, health: 5, shields: 0, hptokens: 2, aptokens: 0, isGhost: false }] };
      (service as any).detectAndFireEffects(prev, curr);
      expect(mockSpellFx.fireEffect).toHaveBeenCalledWith('player-1', 'HP_PLUS', { isRegening: true, hpValue: 2 });
    });

    it('should fire AP_MINUS when aptokens go negative', () => {
      spyOn(mockSpellFx, 'fireEffect');
      service.actor = { id: 1 };
      const prev = { players: [{ id: 2, health: 5, shields: 0, hptokens: 0, aptokens: 0, isGhost: false }] };
      const curr = { players: [{ id: 2, health: 5, shields: 0, hptokens: 0, aptokens: -1, isGhost: false }] };
      (service as any).detectAndFireEffects(prev, curr);
      expect(mockSpellFx.fireEffect).toHaveBeenCalledWith('enemy-2', 'AP_MINUS', { isSlowed: true, apValue: 1 });
    });

    it('should not fire effects when prev state is null', () => {
      spyOn(mockSpellFx, 'fireEffect');
      service.actor = { id: 1 };
      (service as any).detectAndFireEffects(null, { players: [] });
      expect(mockSpellFx.fireEffect).not.toHaveBeenCalled();
    });

    it('should fire SHIELD when shields increase', () => {
      spyOn(mockSpellFx, 'fireEffect');
      service.actor = { id: 1 };
      const prev = { players: [{ id: 1, health: 5, shields: 0, hptokens: 0, aptokens: 0, isGhost: false }] };
      const curr = { players: [{ id: 1, health: 5, shields: 3, hptokens: 0, aptokens: 0, isGhost: false }] };
      (service as any).detectAndFireEffects(prev, curr);
      expect(mockSpellFx.fireEffect).toHaveBeenCalledWith('player-1', 'SHIELD', { isShielded: true, currentShieldValue: 3 });
    });
  });
});
