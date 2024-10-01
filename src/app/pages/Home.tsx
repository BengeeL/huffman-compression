"use client";

import { HuffmanCompressor } from "../scripts/HuffmanCompressor/HuffmanCompressor";
import { saveAs } from "file-saver";
import React from "react";

const HomePage = () => {
  //   ********** COMPRESSION **********
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

  //   ********** UI **********
  const renderFileUploadButton = (
    id: string,
    isCompress: boolean,
    label: string,
    desc: string
  ) => (
    <div className='section'>
      <h2>{label}</h2>
      <h3>{desc}</h3>
      <div
        className='file-upload-button'
        onClick={() => document.getElementById(id)?.click()}
      >
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
        To compress a file, click the "Compress" button and select a text file.
        The compressed file will be downloaded automatically.
      </p>
      <p>
        To decompress a file, click the "Decompress" button and select a
        compressed file. The decompressed file will be downloaded automatically.
      </p>
    </div>
  );
};

export default HomePage;
