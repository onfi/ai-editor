export async function compressString(text: string): Promise<string> {
  const textEncoder = new TextEncoder();
  const encoded = textEncoder.encode(text);
  
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  writer.write(encoded);
  writer.close();
  
  const compressedChunks: Uint8Array[] = [];
  const reader = cs.readable.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    compressedChunks.push(value);
  }
  
  const compressedArray = new Uint8Array(
    compressedChunks.reduce((acc, chunk) => acc + chunk.length, 0)
  );
  
  let offset = 0;
  for (const chunk of compressedChunks) {
    compressedArray.set(chunk, offset);
    offset += chunk.length;
  }
  
  return btoa(String.fromCharCode(...compressedArray));
}

export async function decompressString(compressedText: string): Promise<string> {
  const binaryString = atob(compressedText);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  writer.write(bytes);
  writer.close();
  
  const decompressedChunks: Uint8Array[] = [];
  const reader = ds.readable.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    decompressedChunks.push(value);
  }
  
  const decompressedArray = new Uint8Array(
    decompressedChunks.reduce((acc, chunk) => acc + chunk.length, 0)
  );
  
  let offset = 0;
  for (const chunk of decompressedChunks) {
    decompressedArray.set(chunk, offset);
    offset += chunk.length;
  }
  
  const textDecoder = new TextDecoder();
  return textDecoder.decode(decompressedArray);
}