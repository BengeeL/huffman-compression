import { HuffmanTree } from "./HuffmanTree";

export class HuffmanCompressor {
  static compress(text: string, fileExtension: string): Uint8Array {
    console.log("Compressing text");

    // Create a Huffman tree from the text
    const tree = new HuffmanTree(text, fileExtension);

    // Encode the text using the Huffman tree
    const compressedText = tree.getCompressedText(text);
    console.log("Compressed Text Length:", compressedText.length);

    // Serialize the tree to a string
    const treeData = tree.serialize();
    const treeDataBytes = new TextEncoder().encode(treeData);

    console.log("Tree Data Length:", treeDataBytes.length);

    // Combine the tree data and the compressed text
    const combinedData = new Uint8Array(
      4 + treeDataBytes.length + compressedText.length
    );
    
    new DataView(combinedData.buffer).setUint32(0, treeDataBytes.length, true);
    combinedData.set(treeDataBytes, 4);
    combinedData.set(compressedText, 4 + treeDataBytes.length);

    return combinedData;
  }

  static decompress(combinedData: Uint8Array): string {
    console.log("Decompressing data");

    // Extract the tree data length (stored in the first 4 bytes)
    const treeDataLength = new DataView(combinedData.buffer).getUint32(0, true);
    console.log("Extracted Tree Data Length:", treeDataLength);

    // Extract the tree data
    const treeDataBytes = combinedData.slice(4, 4 + treeDataLength);
    const treeData = new TextDecoder().decode(treeDataBytes);
    console.log("Tree Data:", treeData);

    // Deserialize the tree
    const tree = HuffmanTree.deserialize(treeData);

    // Extract the compressed text
    const compressedText = combinedData.slice(4 + treeDataLength);
    console.log("Compressed Text Length:", compressedText.length);

    // Decompress the text using the Huffman tree
    const decompressedText = tree.decompress(compressedText);

    return decompressedText;
  }
}
