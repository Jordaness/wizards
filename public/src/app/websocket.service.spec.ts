import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { WebsocketService } from './websocket.service';

describe('WebsocketService', () => {
  let service: WebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WebsocketService]
    });
    service = TestBed.get(WebsocketService);
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
});
