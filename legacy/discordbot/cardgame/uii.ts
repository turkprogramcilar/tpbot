import { card_no } from "./data";

// uii: user interface interaction
export abstract class uii
{

    static get(no: card_no)
    {
        switch (no)
        {
        case card_no.usta_rakun:
            return [

            ];
        case card_no.tatar_ramazan:
        case card_no.tivorlu_ismail:
            return [];
        default:
            throw Error("Card is not implemented");
        }
    }
}