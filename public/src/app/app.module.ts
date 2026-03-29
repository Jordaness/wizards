import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { GameService } from './game.service';
import { ActionService } from './action.service';
import { WebsocketService } from './websocket.service';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameboardComponent } from './gameboard/gameboard.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EnemiesComponent } from './enemies/enemies.component';
import { PlayerComponent } from './player/player.component';
import { LearnComponent } from './learn/learn.component';
import { RiveAnimationComponent } from './rive-animation/rive-animation.component';
import { RiveAnimationService } from './rive-animation.service';
import { SpellEffectsService } from './spell-effects.service';
import { SpellEffectComponent } from './spell-effect/spell-effect.component';
import { CardEffectComponent } from './card-effect/card-effect.component';

@NgModule({
  declarations: [
    AppComponent,
    GameboardComponent,
    EnemiesComponent,
    PlayerComponent,
    LearnComponent,
    RiveAnimationComponent,
    SpellEffectComponent,
    CardEffectComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule
  ],

  providers: [
    GameService,
    ActionService,
    WebsocketService,
    RiveAnimationService,
    SpellEffectsService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
