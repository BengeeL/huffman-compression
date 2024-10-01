"use client";

import { useState, useEffect } from "react";
import { HuffmanCompressor } from "../HuffmanCompressor";
import { saveAs } from "file-saver";
import "./Home.css";

const HomePage = () => {
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    console.log("File NAME: " + fileName);
  }, [fileName]);

  // Compression
  const handleCompress = (
    text: string,
    originalFileName: string,
    originalFileExtension: string
  ) => {
    const compressed = HuffmanCompressor.compress(text, originalFileExtension);
    saveCompressedFile(compressed, originalFileName);
  };

  const saveCompressedFile = (
    compressed: Uint8Array,
    originalFileName: string
  ) => {
    const blob = new Blob([compressed], { type: "text/plain;charset=utf-8" });
    const fileExtension = "hmc";
    const fullFileName = `${originalFileName}.${fileExtension}`;
    saveAs(blob, fullFileName);
  };

  // Decompression
  const handleDecompress = (
    compressed: Uint8Array,
    originalFileName: string,
    originalFileExtension: string
  ) => {
    // Validate file extension
    if (originalFileExtension !== "hmc") {
      alert("Invalid file extension. Please select a valid compressed file.");
      return;
    }

    const decompressed = HuffmanCompressor.decompress(compressed);
    saveDecompressedFile(decompressed, originalFileName);
  };

  const saveDecompressedFile = (
    decompressed: string,
    originalFileName: string
  ) => {
    const blob = new Blob([decompressed], { type: "text/plain;charset=utf-8" });
    const fileExtension = "txt";
    const fullFileName = `${originalFileName}.${fileExtension}`;
    saveAs(blob, fullFileName);
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    isCompress: boolean
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      const originalFileName = file.name.split(".").slice(0, -1).join(".");
      const originalFileExtension = file.name.split(".").pop() ?? "";

      setFileName(originalFileName);

      const reader = new FileReader();

      reader.onload = (e) => {
        if (isCompress) {
          const text = e.target?.result as string;
          handleCompress(text, originalFileName, originalFileExtension);
        } else {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const compressed = new Uint8Array(arrayBuffer);
          handleDecompress(compressed, originalFileName, originalFileExtension);
        }
      };
      if (isCompress) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    }
  };

  return (
    <div className='container'>
      <h1>Huffman Compression and Decompression</h1>
      <div className='section'>
        <h2>Compress</h2>
        <input type='file' onChange={(e) => handleFileChange(e, true)} />
        {fileName && <p>File: {fileName}</p>}
      </div>
      <div className='section'>
        <h2>Decompress</h2>
        <input type='file' onChange={(e) => handleFileChange(e, false)} />
        {fileName && <p>File: {fileName}</p>}
      </div>
    </div>
  );
};

export default HomePage;
