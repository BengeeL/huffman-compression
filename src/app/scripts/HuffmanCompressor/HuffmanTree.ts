import { HuffmanNode } from "./HuffmanNode";

export class HuffmanTree {
  root: HuffmanNode | null = null;
  prefixCodeTable: Map<string, string> = new Map();
  extension: string;

  constructor(text: string, extension: string) {
    this.extension = extension;
    if (text) {
      this.buildTree(text);
    }
  }

  private buildTree(text: string) {
    const frequencies = this.getFrequencies(text);
    const nodes = this.createNodes(frequencies);
    this.root = this.buildHuffmanTree(nodes);
    this.generatePrefixCodes(this.root, "");
  }

  private getFrequencies(text: string): Map<string, number> {
    const frequencies = new Map<string, number>();
    for (const char of text) {
      frequencies.set(char, (frequencies.get(char) || 0) + 1);
    }
    return frequencies;
  }

  private createNodes(frequencies: Map<string, number>): HuffmanNode[] {
    const nodes = Array.from(
      frequencies,
      ([char, frequency]) => new HuffmanNode(char, frequency)
    );
    return nodes;
  }

  private buildHuffmanTree(nodes: HuffmanNode[]): HuffmanNode | null {
    while (nodes.length > 1) {
      nodes.sort((a, b) => a.frequency - b.frequency);
      const left = nodes.shift()!;
      const right = nodes.shift()!;
      const parent = new HuffmanNode(
        null,
        left.frequency + right.frequency,
        left,
        right
      );
      nodes.push(parent);
    }
    return nodes[0] || null;
  }

  private generatePrefixCodes(node: HuffmanNode | null, prefix: string) {
    if (node) {
      if (node.char) {
        this.prefixCodeTable.set(node.char, prefix);
      } else {
        this.generatePrefixCodes(node.left, prefix + "0");
        this.generatePrefixCodes(node.right, prefix + "1");
      }
    }
  }

  getCompressedText(text: string): Uint8Array {
    const encodedText = this.encode(text);
    return this.getByteValues(encodedText);
  }

  private encode(text: string): string {
    return text
      .split("")
      .map((char) => this.encodeChar(char))
      .join("");
  }

  private encodeChar(char: string): string {
    const code = this.prefixCodeTable.get(char);
    if (!code) {
      throw new Error(`Character ${char} not found in prefix code table`);
    }
    return code;
  }

  private getByteValues(encodedText: string): Uint8Array {
    const bytes = [];
    for (let i = 0; i < encodedText.length; i += 8) {
      const byte = encodedText.slice(i, i + 8);
      bytes.push(parseInt(byte, 2));
    }
    return new Uint8Array(bytes);
  }

  decompress(compressedText: Uint8Array): string {
    const bits = this.getBitValues(compressedText);
    return this.decodeBits(bits);
  }

  private getBitValues(compressedText: Uint8Array): string {
    return Array.from(compressedText, (byte) =>
      byte.toString(2).padStart(8, "0")
    ).join("");
  }

  private decodeBits(bits: string): string {
    let decodedText = "";
    let current = this.root;
    for (const bit of bits) {
      current = bit === "0" ? current!.left : current!.right;
      if (!current) throw new Error("Invalid encoded text");
      if (current.char) {
        decodedText += current.char;
        current = this.root;
      }
    }
    return decodedText;
  }

  serialize(): string {
    const serializeNode = (node: HuffmanNode | null): string => {
      if (!node) return "null";
      const char = node.char ? node.char.charCodeAt(0) : "#";
      return `${char},${node.frequency},${serializeNode(
        node.left
      )},${serializeNode(node.right)}`;
    };
    return serializeNode(this.root);
  }

  static deserialize(data: string): HuffmanTree {
    const deserializeNode = (nodes: string[]): HuffmanNode | null => {
      if (!nodes.length) return null;
      const char = nodes.shift();
      if (char === "null") return null;
      const frequency = parseInt(nodes.shift()!, 10);
      if (isNaN(frequency))
        throw new Error(`Invalid frequency value: ${frequency}`);
      if (char === undefined) {
        throw new Error("Invalid character value: undefined");
      }
      const node = new HuffmanNode(
        char === "#" ? null : String.fromCharCode(parseInt(char, 10)),
        frequency
      );
      node.left = deserializeNode(nodes);
      node.right = deserializeNode(nodes);
      return node;
    };

    const nodes = data.split(",");
    const tree = new HuffmanTree("", "");
    tree.root = deserializeNode(nodes);
    tree.generatePrefixCodes(tree.root, "");
    return tree;
  }
}
