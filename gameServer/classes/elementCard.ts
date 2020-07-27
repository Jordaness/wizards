import { Element } from './elements';

export class ElementCard {

    public element: Element;
    public faceUp: boolean;

    constructor(element: Element) {
        this.element = element;
        this.faceUp = false;
    }
}