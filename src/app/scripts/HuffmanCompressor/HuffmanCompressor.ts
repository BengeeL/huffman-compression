import { HuffmanTree } from "./HuffmanTree";

export class HuffmanCompressor {
  static compress(text: string, fileExtension: string): Uint8Array {

    // 1 - Create a Huffman tree from the text
    const tree = new HuffmanTree(text, fileExtension);

    // 2 - Encode the text using the Huffman tree
    const compressedText = tree.getCompressedText(text);

    // 3 - Serialize the tree to a string
    const treeData = tree.serialize();
    const treeDataBytes = new TextEncoder().encode(treeData);

    // 4 - Encode the file extension
    const extensionBytes = new TextEncoder().encode(fileExtension);
    const extensionLength = extensionBytes.length;

    // 5 - Combine the tree data, file extension, and the compressed text
    const combinedData = new Uint8Array(
      4 + extensionLength + 4 + treeDataBytes.length + compressedText.length
    );

    // Set the extension length and extension bytes
    new DataView(combinedData.buffer).setUint32(0, extensionLength, true);
    combinedData.set(extensionBytes, 4);

    // Set the tree data length and tree data bytes
    new DataView(combinedData.buffer).setUint32(
      4 + extensionLength,
      treeDataBytes.length,
      true
    );
    combinedData.set(treeDataBytes, 8 + extensionLength);

    // Set the compressed text bytes
    combinedData.set(
      compressedText,
      8 + extensionLength + treeDataBytes.length
    );

    return combinedData;
  }

  static decompress(combinedData: Uint8Array): {
    text: string;
    extension: string;
  } {
    // Extract the extension length (stored in the first 4 bytes)
    const extensionLength = new DataView(combinedData.buffer).getUint32(
      0,
      true
    );
    console.log("Extracted Extension Length:", extensionLength);

    // Extract the extension bytes
    const extensionBytes = combinedData.slice(4, 4 + extensionLength);
    const fileExtension = new TextDecoder().decode(extensionBytes);
    console.log("File Extension:", fileExtension);

    // Extract the tree data length (stored after the extension bytes)
    const treeDataLength = new DataView(combinedData.buffer).getUint32(
      4 + extensionLength,
      true
    );
    console.log("Extracted Tree Data Length:", treeDataLength);

    // Extract the tree data bytes
    const treeDataBytes = combinedData.slice(
      8 + extensionLength,
      8 + extensionLength + treeDataLength
    );
    const treeData = new TextDecoder().decode(treeDataBytes);
    console.log("Tree Data:", treeData);

    // Deserialize the tree
    const tree = HuffmanTree.deserialize(treeData);

    // Extract the compressed text bytes
    const compressedText = combinedData.slice(
      8 + extensionLength + treeDataLength
    );
    console.log("Compressed Text Length:", compressedText.length);

    // Decompress the text using the Huffman tree
    const decompressedText = tree.decompress(compressedText);

    return { text: decompressedText, extension: fileExtension };
  }
}
