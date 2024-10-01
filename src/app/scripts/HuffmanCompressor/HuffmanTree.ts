import { HuffmanNode } from "./HuffmanNode";

export class HuffmanTree {
  root: HuffmanNode | null;
  prefixCodeTable: Map<string, string>;
  extension: string;

  constructor(text: string, extension: string) {
    this.root = null;
    this.prefixCodeTable = new Map();
    this.extension = extension;
    if (text) {
      this.buildTree(text);
    }
  }

  buildTree(text: string) {
    // 1 - Get character frequencies
    const frequencies = this.getFrequencies(text);

    // 2 - Create nodes for each character
    const nodes = this.createNodes(frequencies);

    // 3 - Build Huffman tree
    this.root = this.buildHuffmanTree(nodes);

    // 4 - Generate prefix codes for each character
    this.generatePrefixCodes(this.root, "");
    console.log("Prefix Code Table:", this.prefixCodeTable);
  }

  getFrequencies(text: string) {
    const frequencies = new Map<string, number>();

    for (const char of text) {
      frequencies.set(char, (frequencies.get(char) || 0) + 1);
    }

    console.log("Character Frequencies:", frequencies);
    return frequencies;
  }

  createNodes(frequencies: Map<string, number>) {
    const nodes: HuffmanNode[] = [];

    frequencies.forEach((frequency, char) => {
      nodes.push(new HuffmanNode(char, frequency));
    });

    console.log("Nodes Created:", nodes);
    return nodes;
  }

  buildHuffmanTree(nodes: HuffmanNode[]) {
    while (nodes.length > 1) {
      // Sort nodes by frequency in ascending order
      nodes.sort((a, b) => a.frequency - b.frequency);

      // Remove the two nodes with the smallest frequencies
      const left = nodes.shift();
      const right = nodes.shift();

      if (left && right) {
        // Create a new parent node with these two nodes as children
        const parent = new HuffmanNode(null, left.frequency + right.frequency);
        parent.left = left;
        parent.right = right;

        // Add the parent node back into the list of nodes
        nodes.push(parent);
      }
    }

    console.log("Final Nodes:", nodes);

    // The remaining node is the root of the Huffman tree
    return nodes[0];
  }

  generatePrefixCodes(node: HuffmanNode | null, prefix: string) {
    if (node) {
      if (node.char) {
        this.prefixCodeTable.set(node.char, prefix);
      } else {
        this.generatePrefixCodes(node.left, prefix + "0");
        this.generatePrefixCodes(node.right, prefix + "1");
      }
    }
  }

  // Compress the encoded text
  getCompressedText(text: string): Uint8Array {
    const encodedText = this.encode(text);
    const compressedText = this.getByteValues(encodedText); // No padding added
    return compressedText;
  }

  // Encode the text using the Huffman tree
  encode(text: string) {
    const encodedText = text
      .split("")
      .map((char) => this.encodeChar(char))
      .join("");
    return encodedText;
  }

  // Encode a single character using the prefix code table
  encodeChar(char: string): string {
    const code = this.prefixCodeTable.get(char);
    if (!code) {
      throw new Error(`Character ${char} not found in prefix code table`);
    }
    return code;
  }

  // Convert the encoded text to bytes
  getByteValues(encodedText: string): Uint8Array {
    const bytes = [];

    for (let i = 0; i < encodedText.length; i += 8) {
      const byte = encodedText.slice(i, i + 8);
      bytes.push(parseInt(byte, 2));
    }
    return new Uint8Array(bytes);
  }

  decompress(compressedText: Uint8Array): string {
    const bits = this.getBitValues(compressedText); // No padding involved
    return this.decodeBits(bits);
  }

  private getBitValues(compressedText: Uint8Array): string {
    const bits = [];

    for (const byte of compressedText) {
      bits.push(byte.toString(2).padStart(8, "0"));
    }

    return bits.join("");
  }

  private decodeBits(bits: string): string {
    let decodedText = "";
    let current = this.root;

    for (const bit of bits) {
      if (bit === "0") {
        if (current?.left) {
          current = current.left;
        } else {
          throw new Error("Invalid encoded text");
        }
      } else {
        if (current?.right) {
          current = current.right;
        } else {
          throw new Error("Invalid encoded text");
        }
      }

      if (current?.char) {
        decodedText += current.char;
        current = this.root;
      }
    }
    return decodedText;
  }

  // Serialize the Huffman tree to a string
  serialize(): string {
    const serializeNode = (node: HuffmanNode | null): string => {
      if (!node) {
        return "null"; // Use a dedicated null marker
      }
      const char = node.char ? node.char.charCodeAt(0) : "#";
      return `${char},${node.frequency},${serializeNode(
        node.left
      )},${serializeNode(node.right)}`;
    };
    return serializeNode(this.root);
  }

  // Deserialize a string to reconstruct the Huffman tree
  static deserialize(data: string): HuffmanTree {
    const deserializeNode = (nodes: string[]): HuffmanNode | null => {
      if (!nodes.length) {
        return null;
      }

      const char = nodes.shift(); // Get the character
      if (char === "null") {
        return null; // Handle null node
      }

      // Parse the frequency
      const frequency = parseInt(nodes.shift()!, 10);
      if (isNaN(frequency)) {
        throw new Error(`Invalid frequency value: ${frequency}`);
      }

      console.log(
        `Deserializing node with char: ${char}, frequency: ${frequency}`
      );

      // Create the new node
      const node = new HuffmanNode(
        char === "#" ? null : String.fromCharCode(parseInt(char!, 10)), // Handle the character
        frequency
      );

      // Recursively construct the left and right children
      node.left = deserializeNode(nodes);
      node.right = deserializeNode(nodes);

      return node;
    };

    const nodes = data.split(",");
    console.log("Deserializing Nodes:", nodes);

    const tree = new HuffmanTree("", "");
    tree.root = deserializeNode(nodes);

    tree.generatePrefixCodes(tree.root, "");

    return tree;
  }
}
