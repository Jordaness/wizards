import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { GameboardComponent } from './gameboard.component';
import { PlayerComponent } from '../player/player.component';
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
  doDivineStep(v, yx) {}
  doDivineStepEnd() {}
  doDivineEnd() {}
  doDivine(v, yx) {}
  doWeave(yx1, yx2) {}
  doScry(v, yx) {}
  doObscure(v, yx) {}
  spellSuccess(d, s) {}
  spellFailure(d, s) {}
  spellElemSelect() {}
  endActionStepCheck() {}
  reset() {}
}

describe('GameboardComponent', () => {
  let component: GameboardComponent;
  let fixture: ComponentFixture<GameboardComponent>;
  let mockWss: MockWebsocketService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, BrowserAnimationsModule],
      declarations: [GameboardComponent, PlayerComponent, EnemiesComponent],
      providers: [
        { provide: WebsocketService, useClass: MockWebsocketService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameboardComponent);
    component = fixture.componentInstance;
    mockWss = TestBed.get(WebsocketService);

    // Provide required @Input references
    component.playerComp = {} as PlayerComponent;
    component.enemiesComp = {} as EnemiesComponent;

    // Set minimal state
    component.state = {
      gameOn: false,
      gameOver: false,
      gameboard: {
        grid: [
          [{ elem: 'fire', faceUp: false }, { elem: 'water', faceUp: false }, { elem: 'earth', faceUp: false }, { elem: 'air', faceUp: false }],
          [{ elem: 'air', faceUp: false }, { elem: 'fire', faceUp: true }, { elem: 'water', faceUp: true }, { elem: 'earth', faceUp: false }],
          [{ elem: 'water', faceUp: false }, { elem: 'earth', faceUp: true }, { elem: 'air', faceUp: true }, { elem: 'fire', faceUp: false }],
          [{ elem: 'earth', faceUp: false }, { elem: 'air', faceUp: false }, { elem: 'fire', faceUp: false }, { elem: 'water', faceUp: false }]
        ]
      },
      winner: null,
      players: []
    };
    component.gameState = { mode: 'ready', value: 1 };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to state on init', () => {
    const mockState = {
      gameOn: true,
      gameOver: false,
      gameboard: {
        grid: [
          [{ elem: 'fire', faceUp: false }, { elem: 'water', faceUp: false }, { elem: 'earth', faceUp: false }, { elem: 'air', faceUp: false }],
          [{ elem: 'air', faceUp: false }, { elem: 'fire', faceUp: true }, { elem: 'water', faceUp: true }, { elem: 'earth', faceUp: false }],
          [{ elem: 'water', faceUp: false }, { elem: 'earth', faceUp: true }, { elem: 'air', faceUp: true }, { elem: 'fire', faceUp: false }],
          [{ elem: 'earth', faceUp: false }, { elem: 'air', faceUp: false }, { elem: 'fire', faceUp: false }, { elem: 'water', faceUp: false }]
        ]
      },
      winner: null,
      players: []
    };
    mockWss._state.next(mockState);
    component.ngOnInit();
    expect(component.state).toBeTruthy();
    expect(component.state.gameOn).toBe(true);
  });

  it('should subscribe to gameState on init', () => {
    component.ngOnInit();
    mockWss._gameState.next({ mode: 'divineStep', value: 4 });
    expect(component.gameState.mode).toBe('divineStep');
  });

  it('should call reset on the service', () => {
    spyOn(mockWss, 'reset');
    component.reset();
    expect(mockWss.reset).toHaveBeenCalled();
  });
});
