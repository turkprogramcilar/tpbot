import { card_no } from "./data";
import { uii } from "./uii";

export class uii_cardselect extends uii
{
    public selected: card_no | undefined = undefined;
    constructor(public cards: card_no[]) { super(); }
}