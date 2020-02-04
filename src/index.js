const CustomCrypto = require('./custom-crypto');


class CheckSum {
  /*
    Utility function to convert object like instances into processable
    strings. refundMode indicates if params object contains a refund
    order.
  */
  static paramsToString(params, refundMode=false) {
    let data = '';

    const keys = Object.keys(params);
    keys.sort();

    keys.forEach((key) => {
      let value = `${params[key]}`;
      const resetKeyValue = () =>  params[key] = value = '';

      if (!refundMode) {
        if (value.includes('REFUND')) {
          resetKeyValue();
        }
      }

      if (value.includes('|')) {
        resetKeyValue();
      }

      if (key !== 'CHECKSUMHASH') {
        if (value === 'null') {
          resetKeyValue();
        }

        data += `${value}|`;
      }
    });

    return data;
  };


  static async generateCheckSumFromString(string, key) {
    const salt = await CustomCrypto.generateSalt();

    const hash = CustomCrypto.hash(string, salt);
    const payload = `${hash}${salt}`;

    const encrypted = CustomCrypto.encrypt(payload, key);
    return encodeURIComponent(encrypted);
  };


  static async generateCheckSum(params, key, refundMode=false) {
    const payload = CheckSum.paramsToString(params, refundMode);
    return await CheckSum.generateCheckSumFromString(payload, key);
  };


  static async verifyCheckSumFromString(string, key, encryptedCheckSum) {
    const decryptedCheckSum = CustomCrypto.decrypt(encryptedCheckSum, key);

    const length = decryptedCheckSum.length;
    const salt = decryptedCheckSum.substr(length - 4);
    const hashTarget = decryptedCheckSum.substr(0, length - 4);
    const hashOfPayload = CustomCrypto.hash(string, salt);

    return hashOfPayload == hashTarget;
  };


  static async verifyCheckSum(params,
                              key,
                              encryptedCheckSum,
                              refundMode=false) {
    const data = paramsToString(params, refundMode);

    encryptedCheckSum = encryptedCheckSum.replace('\n', '');
    encryptedCheckSum = encryptedCheckSum.replace('\r', '');
    encryptedCheckSum = decodeURIComponent(encryptedCheckSum);

    return await verifyCheckSumFromString(data, key, encryptedCheckSum);
  };
};


module.exports = CheckSum;
