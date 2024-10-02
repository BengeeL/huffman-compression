"use client";

import { HuffmanCompressor } from "../scripts/HuffmanCompressor/HuffmanCompressor";
import { saveAs } from "file-saver";
import React, { useState } from "react";

const HomePage = () => {
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);

  //   ********** COMPRESSION **********
  const handleCompress = (
    text: string,
    originalFileName: string,
    originalFileExtension: string
  ) => {
    const compressed = HuffmanCompressor.compress(text, originalFileExtension);
    setCompressedSize(compressed.length);
    saveCompressedFile(compressed, originalFileName);
  };

  const saveCompressedFile = (
    compressed: Uint8Array,
    originalFileName: string
  ) => {
    const blob = new Blob([compressed], { type: "text/plain;charset=utf-8" });
    const fullFileName = `${originalFileName}.hmc`;
    saveAs(blob, fullFileName);
  };

  //   ********** DECOMPRESSION **********
  const handleDecompress = (
    compressed: Uint8Array,
    originalFileName: string,
    originalFileExtension: string
  ) => {
    if (originalFileExtension !== "hmc") {
      alert("Invalid file extension. Please select a valid compressed file.");
      return;
    }

    const { text: decompressed, extension } =
      HuffmanCompressor.decompress(compressed);
    setCompressedSize(decompressed.length);
    saveDecompressedFile(decompressed, originalFileName, extension);
  };

  const saveDecompressedFile = (
    decompressed: string,
    originalFileName: string,
    originalFileExtension: string
  ) => {
    const blob = new Blob([decompressed], { type: "text/plain;charset=utf-8" });
    const fullFileName = `${originalFileName}.${originalFileExtension}`;
    saveAs(blob, fullFileName);
  };

  //   ********** FILE HANDLING **********
  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    isCompress: boolean
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      setOriginalSize(file.size);

      const originalFileName = file.name.split(".").slice(0, -1).join(".");
      const originalFileExtension = file.name.split(".").pop() ?? "";

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

  // Convert the file size to human-readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  //   ********** UI **********
  const renderFileUploadButton = (
    id: string,
    isCompress: boolean,
    label: string,
    desc: string
  ) => (
    <div
      className='section'
      onClick={() => document.getElementById(id)?.click()}
    >
      <div className='upload'>
        <h2>{label}</h2>
        <h3>{desc}</h3>
        <div className='file-upload-button'>
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 384 512'>
            <path d='M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 288c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128z' />
          </svg>
        </div>
        <input
          type='file'
          id={id}
          style={{ display: "none" }}
          onChange={(e) => handleFileChange(e, isCompress)}
        />
      </div>

      <div className='file-size'>
        <p>
          Original Size:{" "}
          {originalSize !== null ? formatBytes(originalSize) : "N/A"}
        </p>
        <p>
          Converted File Size:{" "}
          {compressedSize !== null ? formatBytes(compressedSize) : "N/A"}
        </p>
      </div>
    </div>
  );

  return (
    <div className='container'>
      <h1>HMCompressor</h1>
      <div className='options'>
        {renderFileUploadButton(
          "fileInputCompress",
          true,
          "Compress",
          "text file > '.hmc'"
        )}
        {renderFileUploadButton(
          "fileInputDecompress",
          false,
          "Decompress",
          "'.hcm' > text file"
        )}
      </div>

      <h2>Instructions</h2>
      <p>
        To compress a file, click the &quot;Compress&quot; button and select a
        text file. The compressed file will be downloaded automatically.
      </p>
      <p>
        To decompress a file, click the &quot;Decompress&quot; button and select
        a compressed file. The decompressed file will be downloaded
        automatically.
      </p>
    </div>
  );
};

export default HomePage;
