const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export const base32ToBytes = (base32: string): Uint8Array => {
  const cleaned = base32.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = "";
  for (let i = 0; i < cleaned.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (val >= 0) {
      bits += val.toString(2).padStart(5, "0");
    }
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
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
    keyBytes,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );

  const signature = await window.crypto.subtle.sign("HMAC", cryptoKey, counterBytes);
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

export const verifyTotpToken = async (secretBase32: string, userCode: string): Promise<boolean> => {
  const currentCounter = Math.floor(Date.now() / 1000 / 30);
  for (const offset of [-1, 0, 1]) {
    const expected = await generateTotpAtWindow(secretBase32, currentCounter + offset);
    if (expected === userCode.trim()) {
      return true;
    }
  }
  return false;
};