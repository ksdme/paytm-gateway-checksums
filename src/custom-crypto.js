const crypto = require('crypto');


class CustomCrypto {
  static get IV() {
    return '@@@@&&&&####$$$$';
  };


  static hash(data, salt, algorithm='sha256') {
    const hash = crypto.createHash(algorithm);
    hash.update(`${data}|${salt}`);
    return hash.digest('hex');
  };


  static cipherAlgorithm(key) {
    let size = null;

    switch(key.length) {
      case 16: size = '128'; break;
      case 24: size = '192'; break;
      case 32: size = '256'; break;
    }

    if (size = null) {
      throw new Error('Invalid key size');
    }

    return `AES-${size}-CBC`;
  }


  static generateSalt(length=4) {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(length * 3 / 4, (error, buffer) => {
        if (error != null) {
          return reject(error);
        }

        return resolve(buffer.toString('base64'));
      });
    });
  }


  static encrypt(data, key) {
    console.log(CustomCrypto.IV);
    const algorithm = CustomCrypto.cipherAlgorithm(key);
    const cipher = crypto.createCipheriv(algorithm, key, CustomCrypto.IV);

    let encrypted = cipher.update(data, 'binary', 'base64');
    encrypted += cipher.final('base64');

    return encrypted;
  }


  static decrypt(data, key) {
    const algorithm = CustomCrypto.cipherAlgorithm(key);
    const decipher = crypto.createDecipheriv(algorithm, key, CustomCrypto.IV);

    let decrypted = decipher.update(data, 'base64', 'binary');
    decrypted += decipher.final('binary');

    return decrypted;
  }
};


module.exports = CustomCrypto;
