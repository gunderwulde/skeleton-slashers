export interface IPlayer {
    readonly x: number;
    readonly y: number;
    readonly active: boolean;
    hasActiveTag(tag: string): boolean;
}
