export class HuffmanNode {
  char: string | null;
  frequency: number;
  left: HuffmanNode | null = null;
  right: HuffmanNode | null = null;

  constructor(
    char: string | null,
    frequency: number,
    left: HuffmanNode | null = null,
    right: HuffmanNode | null = null
  ) {
    this.char = char;
    this.frequency = frequency;
    this.left = left;
    this.right = right;
  }
}
