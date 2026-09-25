// Independent input sources allow steering while holding the pedal button.
export class PedalInput {
  private keyboard = false;
  private pointers = new Set<number>();
  get held() { return this.keyboard || this.pointers.size > 0; }
  setKeyboard(held: boolean) { this.keyboard = held; }
  pressPointer(id: number) { this.pointers.add(id); }
  releasePointer(id: number) { this.pointers.delete(id); }
  clear() { this.keyboard = false; this.pointers.clear(); }
}
