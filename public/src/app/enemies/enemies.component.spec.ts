import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { EnemiesComponent } from './enemies.component';
import { GameboardComponent } from '../gameboard/gameboard.component';
import { PlayerComponent } from '../player/player.component';
import { WebsocketService } from '../websocket.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

class MockWebsocketService {
  counter = 0;
  effects = [];
  actor = null;
  spell = null;
  cardsFaceUp = 0;
  cardsFaceDown = 0;
  _state = new BehaviorSubject(null);
  _gameState = new BehaviorSubject({ mode: 'ready', value: 1 });
  getObservable() { return this._state.asObservable(); }
  getGameState() { return this._gameState.asObservable(); }
  getPlayer() { return this.actor; }
  getCounter() { return this.counter; }
  sendTarget(t) {}
  enemyTargetFail() {}
}

describe('EnemiesComponent', () => {
  let component: EnemiesComponent;
  let fixture: ComponentFixture<EnemiesComponent>;
  let mockWss: MockWebsocketService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, BrowserAnimationsModule],
      declarations: [EnemiesComponent, GameboardComponent, PlayerComponent],
      providers: [
        { provide: WebsocketService, useClass: MockWebsocketService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnemiesComponent);
    component = fixture.componentInstance;
    mockWss = TestBed.get(WebsocketService);

    // Provide required @Input references
    component.gameboardComp = {} as GameboardComponent;
    component.playerComp = {} as PlayerComponent;

    // Set minimal state
    component.state = { gameOn: false, gameOver: false, players: [] };
    component.enemies = null;
    component.gameState = { mode: 'ready', value: 1 };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to state on init', () => {
    const mockState = {
      gameOn: true,
      gameOver: false,
      players: [
        { socketid: 'abc', name: 'Me', id: 1 },
        { socketid: 'def', name: 'Enemy1', id: 2, shields: 0, health: 5, isGhost: false, aptokens: 0, hptokens: 0 }
      ]
    };
    mockWss.actor = mockState.players[0];
    mockWss._state.next(mockState);
    component.ngOnInit();
    expect(component.state).toBeTruthy();
  });

  it('should subscribe to gameState on init', () => {
    component.ngOnInit();
    mockWss._gameState.next({ mode: 'targetingPlayer', value: 13 });
    expect(component.gameState.mode).toBe('targetingPlayer');
  });

  it('should filter out self from enemies list', () => {
    mockWss.actor = { socketid: 'abc', name: 'Me', id: 1 };
    const mockState = {
      gameOn: true,
      gameOver: false,
      players: [
        { socketid: 'abc', name: 'Me', id: 1 },
        { socketid: 'def', name: 'Enemy1', id: 2, shields: 0, health: 5, isGhost: false, aptokens: 0, hptokens: 0 }
      ]
    };
    mockWss._state.next(mockState);
    component.ngOnInit();
    // enemies should not include self
    if (component.enemies) {
      const selfInEnemies = component.enemies.find(e => e.socketid === 'abc');
      expect(selfInEnemies).toBeFalsy();
    }
  });
});
