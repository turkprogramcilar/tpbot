import { Client } from "discord.js";
import { Print } from "./Print";



export class Module
{
    public constructor(protected client: Client, protected print: Print) { }
}