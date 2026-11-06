const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

const base32ToBytes = (base32: string): Uint8Array => {
  const clean = base32.toUpperCase().replace(/=+$/, "");
  let bits = "";
  for (let i = 0; i < clean.length; i++) {
    const val = base32chars.indexOf(clean.charAt(i));
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.substring(i * 8, (i + 1) * 8), 2);
  }
  return bytes;
};

export const generateTotpAtWindow = async (secretBase32: string, counter: number): Promise<string> => {
  const keyBytes = base32ToBytes(secretBase32);
  const counterBytes = new Uint8Array(8);
  let temp = counter;
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = temp & 0xff;
    temp = Math.floor(temp / 256);
  }

  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyBytes.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );

  const signature = await window.crypto.subtle.sign("HMAC", cryptoKey, counterBytes.buffer as ArrayBuffer);
  const hmac = new Uint8Array(signature);
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, "0");
};

export const verifyTotpToken = async (secretBase32: string, token: string): Promise<boolean> => {
  const cleanToken = token.trim();
  if (cleanToken.length !== 6) return false;

  const currentCounter = Math.floor(Date.now() / 1000 / 30);
  const windows = [0, -1, 1];

  for (const w of windows) {
    const expected = await generateTotpAtWindow(secretBase32, currentCounter + w);
    if (expected === cleanToken) {
      return true;
    }
  }

  return false;
};
