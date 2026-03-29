import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PlayerComponent } from './player.component';
import { GameboardComponent } from '../gameboard/gameboard.component';
import { EnemiesComponent } from '../enemies/enemies.component';
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
  setCounter(n) { this.counter = n; }
  reduceCounter() { this.counter--; }
  doReady() {}
  doTurn() {}
  endTurn() {}
  actionDivine() {}
  actionLearn() {}
  actionWeave() {}
  actionScry() {}
  actionObscure() {}
  actionCast() {}
  spellSelectFail() {}
  spellElemSelect() {}
  spellSuccess() {}
  spellFailure() {}
  doDivineStepEnd() {}
  setAwait() {}
}

describe('PlayerComponent', () => {
  let component: PlayerComponent;
  let fixture: ComponentFixture<PlayerComponent>;
  let mockWss: MockWebsocketService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, BrowserAnimationsModule],
      declarations: [PlayerComponent, GameboardComponent, EnemiesComponent],
      providers: [
        { provide: WebsocketService, useClass: MockWebsocketService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerComponent);
    component = fixture.componentInstance;
    mockWss = TestBed.get(WebsocketService);

    // Provide required @Input references
    component.gameboardComp = {} as GameboardComponent;
    component.enemiesComp = {} as EnemiesComponent;

    // Set minimal state so template doesn't error
    component.state = { gameOn: false, gameOver: false, players: [] };
    component.player = null;
    component.gameState = { mode: 'ready', value: 1 };
    component.turn = false;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to state on init', () => {
    const mockState = {
      gameOn: true,
      gameOver: false,
      currentTurn: 0,
      players: [
        { socketid: 'abc', name: 'Merlin', id: 1, shields: 0, health: 5, isGhost: false, aptokens: 0, hptokens: 0, spells: [] }
      ]
    };
    mockWss.actor = mockState.players[0];
    mockWss._state.next(mockState);
    component.ngOnInit();
    expect(component.state).toBeTruthy();
  });

  it('should subscribe to gameState on init', () => {
    component.ngOnInit();
    mockWss._gameState.next({ mode: 'turnStart', value: 3 });
    expect(component.gameState.mode).toBe('turnStart');
  });

  it('should call doReady on ready()', () => {
    spyOn(mockWss, 'doReady');
    component.ready();
    expect(mockWss.doReady).toHaveBeenCalled();
  });

  it('should call endTurn on turnEnd()', () => {
    component.enemiesComp = { enemies: [] } as any;
    spyOn(mockWss, 'endTurn');
    component.turnEnd();
    expect(mockWss.endTurn).toHaveBeenCalled();
  });
});
