export function downloadBase64(b64: string, filename: string) {
    const a = document.createElement('a');
    a.href = b64;
    a.download = filename;
    a.click();
  }
  