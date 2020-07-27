import { Element } from "./elements";

export class SpellCard {

    public name: string;
    public text: string;
    public elements: Element[];
    public effects: any[];
    public targeted: boolean; 
    
    constructor(name : string, text: string , elements: Element[], effects: any[], targeted: boolean) {
        this.name = name;
        this.text = text;  // text of spell effect
        this.elements = elements;  // is an array of elements, in one way or another
        this.effects = effects;  // event keyword to be dispatched when card is played
        this.targeted = targeted;  // boolean if we need to enter a targeting mode
    }
}