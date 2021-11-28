import { coin_action, partial_card } from "./data"
export abstract class flips
{
    /**
     * Event of this happening (with tail break) is [min:0 avg: ~1 max: N]
     * @param action coin action to repeat
     * @param times how many times
     */
    static sequential(times: number, action: coin_action): partial_card
    {
        return {...this.parallel(times, action), tail_break: true};
    }

    /**
     * Event of this happening is [min:0 avg: N/2 max: N]
     * @param action coin action to repeat
     * @param times how many times
     */
    static parallel(times: number, action: coin_action): partial_card
    {
        return {
            flips: Array(times).fill(action),
        }
    }
}