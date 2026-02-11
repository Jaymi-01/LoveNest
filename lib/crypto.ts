import CryptoJS from 'crypto-js';

// In a real app, this secret would be derived from a shared secret 
// established during pairing and stored in SecureStore.
const DEFAULT_SECRET = 'lovenest-shared-secret-placeholder';

export const encryptMessage = (text: string, secret: string = DEFAULT_SECRET) => {
  return CryptoJS.AES.encrypt(text, secret).toString();
};

export const decryptMessage = (ciphertext: string, secret: string = DEFAULT_SECRET) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secret);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    return 'Decryption failed';
  }
};
