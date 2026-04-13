/////// Esta parte es toda la freaking encriptacion de contacto, ehhh es hash btw////////////////
/**
 * Convierte un ArrayBuffer a una cadena Base64 (para guardar en JSON, input, localStorage)
 */
const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

/**
 * Convierte Base64 a ArrayBuffer (para desencriptar)
 */
const base64ToArrayBuffer = (base64) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};

/**
 * 1. HASH (Unidireccional)
 * Ideal para contraseñas antes de enviarlas o compararlas.
 */
export const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return arrayBufferToBase64(hashBuffer);
};

/**
 * Genera una clave segura a partir de una contraseña maestra usando PBKDF2
 */
const getKeyFromPassword = async (password, salt) => {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    const baseKey = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
};

/**
 * Encripta un texto plano
 * @param {string} plainText - El texto a encriptar
 * @param {string} masterPassword - La contraseña maestra
 * @returns {Promise<string>} - Objeto en Base64 que contiene: iv.ciphertext
 */
export const encryptData = async (plainText, masterPassword) => {
    try {
        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const salt = crypto.getRandomValues(new Uint8Array(16));
        
        const key = await getKeyFromPassword(masterPassword, salt);
        
        const encodedText = encoder.encode(plainText);
        
        const encryptedContent = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            encodedText
        );
        
        const saltBase64 = arrayBufferToBase64(salt);
        const ivBase64 = arrayBufferToBase64(iv);
        const ciphertextBase64 = arrayBufferToBase64(encryptedContent);
        
        return `${saltBase64}.${ivBase64}.${ciphertextBase64}`;
    } catch (error) {
        console.error('Error en encriptación:', error);
        throw new Error('No se pudo encriptar el dato');
    }
};

/**
 * Desencripta un texto previamente encriptado con encryptData
 * @param {string} encryptedPackage - El string combinado (salt.iv.ciphertext)
 * @param {string} masterPassword - La misma contraseña maestra usada para encriptar
 * @returns {Promise<string>} - El texto original
 */
export const decryptData = async (encryptedPackage, masterPassword) => {
    try {
        const [saltBase64, ivBase64, ciphertextBase64] = encryptedPackage.split('.');
        
        const salt = base64ToArrayBuffer(saltBase64);
        const iv = base64ToArrayBuffer(ivBase64);
        const ciphertext = base64ToArrayBuffer(ciphertextBase64);
        
        const key = await getKeyFromPassword(masterPassword, new Uint8Array(salt));
        
        const decryptedContent = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            ciphertext
        );
        
        const decoder = new TextDecoder();
        return decoder.decode(decryptedContent);
    } catch (error) {
        console.error('Error en desencriptación:', error);
        throw new Error('Contraseña incorrecta o datos corruptos');
    }
};