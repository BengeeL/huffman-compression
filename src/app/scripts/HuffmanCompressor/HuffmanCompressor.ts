import { HuffmanTree } from "./HuffmanTree";

export class HuffmanCompressor {
  static compress(text: string, fileExtension: string): Uint8Array {
    const tree = new HuffmanTree(text, fileExtension);
    const compressedText = tree.getCompressedText(text);
    const treeDataBytes = this.encodeString(tree.serialize());
    const extensionBytes = this.encodeString(fileExtension);

    const combinedData = new Uint8Array(
      4 + extensionBytes.length + 4 + treeDataBytes.length + compressedText.length
    );

    this.setUint32(combinedData, 0, extensionBytes.length);
    combinedData.set(extensionBytes, 4);
    this.setUint32(combinedData, 4 + extensionBytes.length, treeDataBytes.length);
    combinedData.set(treeDataBytes, 8 + extensionBytes.length);
    combinedData.set(compressedText, 8 + extensionBytes.length + treeDataBytes.length);

    return combinedData;
  }

  static decompress(combinedData: Uint8Array): { text: string; extension: string } {
    const extensionLength = this.getUint32(combinedData, 0);
    const extensionBytes = combinedData.slice(4, 4 + extensionLength);
    const fileExtension = this.decodeString(extensionBytes);

    const treeDataLength = this.getUint32(combinedData, 4 + extensionLength);
    const treeDataBytes = combinedData.slice(8 + extensionLength, 8 + extensionLength + treeDataLength);
    const treeData = this.decodeString(treeDataBytes);

    const tree = HuffmanTree.deserialize(treeData);
    const compressedText = combinedData.slice(8 + extensionLength + treeDataLength);
    const decompressedText = tree.decompress(compressedText);

    return { text: decompressedText, extension: fileExtension };
  }

  private static encodeString(data: string): Uint8Array {
    return new TextEncoder().encode(data);
  }

  private static decodeString(data: Uint8Array): string {
    return new TextDecoder().decode(data);
  }

  private static setUint32(data: Uint8Array, offset: number, value: number): void {
    new DataView(data.buffer).setUint32(offset, value, true);
  }

  private static getUint32(data: Uint8Array, offset: number): number {
    return new DataView(data.buffer).getUint32(offset, true);
  }
}
