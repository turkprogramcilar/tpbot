import { User } from "discord.js";

export class CardUser
{
/*******************************************************************72*/
readonly id: string;
constructor(id: string | User)
{ 
    if (id instanceof User) {
        this.id = id.id;
    }
    else {
        this.id = id;
    }
}

/*******************************************************************72*/
}