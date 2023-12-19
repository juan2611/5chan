function hexStringToByteArray(hexString) {
    var bytes = new Uint8Array(Math.ceil(hexString.length / 2));
    for (var i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
    }
    return bytes;
  }
  
export async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
  
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return (hashHex);
  }

export async function encryptStringAES(jsonObject, secretKey) {
    const inputString = JSON.stringify(jsonObject);
    const keyBuffer = hexStringToByteArray(secretKey);
    //const hashedKeyBuffer = await crypto.subtle.digest('SHA-256', keyBuffer);

    const key = await crypto.subtle.importKey('raw', keyBuffer, { name: 'AES-CBC' }, true, ['encrypt']);
    const dataBuffer = new TextEncoder().encode(inputString);
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const encryptedData = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, key, dataBuffer);
    // const resultBuffer = new Uint8Array([...iv, ...new Uint8Array(encryptedData)]);
    const resultBuffer = new Uint8Array([...new Uint8Array(encryptedData)]);
    const encryptedString = btoa(String.fromCharCode(...resultBuffer));
    const ivBase64 = btoa(String.fromCharCode.apply(null, iv));
    return [encryptedString, ivBase64]
  }

  export async function decryptStringAES(encryptedString, ivBase64, secretKey) {
    const encryptedData = Uint8Array.from(atob(encryptedString), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
    const keyBuffer = new TextEncoder().encode(secretKey);
    const hashedKeyBuffer = await crypto.subtle.digest('SHA-256', keyBuffer);
    const key = await crypto.subtle.importKey('raw', hashedKeyBuffer, { name: 'AES-CBC' }, true, ['decrypt']);
    const decryptedData = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, encryptedData);
    return new TextDecoder().decode(decryptedData);
}

export async function encryptrSA(data, publicKey) {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
  
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP"
      },
      publicKey,
      encodedData
    );
  
    return encryptedData;
  }