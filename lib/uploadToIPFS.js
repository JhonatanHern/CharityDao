const pinataSDK = require("@pinata/sdk");

const uploadToIPFS = async (body, apiKey, apiSecret) => {
  const pinata = new pinataSDK(apiKey, apiSecret);
  const testResponse = await pinata.testAuthentication();
  if (!testResponse.authenticated) {
    throw new Error("Pinata Authentication failed");
  }
  const res = await pinata.pinJSONToIPFS(body, {});
  return res.IpfsHash;
};

module.exports = { uploadToIPFS };
