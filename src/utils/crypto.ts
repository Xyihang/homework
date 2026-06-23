import CryptoJS from 'crypto-js';

// 加密密钥
const getEncryptionKey = (): string => {
  return 'werewolf-game-' + navigator.userAgent.length;
};

// 加密数据
export const encryptData = (data: string): string => {
  try {
    return CryptoJS.AES.encrypt(data, getEncryptionKey()).toString();
  } catch (error) {
    console.error('加密失败:', error);
    return data;
  }
};

// 解密数据
export const decryptData = (encrypted: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, getEncryptionKey());
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('解密失败:', error);
    return encrypted;
  }
};

// 加密对象
export const encryptObject = <T>(obj: T): string => {
  return encryptData(JSON.stringify(obj));
};

// 解密对象
export const decryptObject = <T>(encrypted: string): T | null => {
  try {
    const decrypted = decryptData(encrypted);
    return JSON.parse(decrypted) as T;
  } catch (error) {
    console.error('解密对象失败:', error);
    return null;
  }
};