export function isHidden(id: number, hiddenIds: number[]): boolean {
    return hiddenIds.includes(id);
}
