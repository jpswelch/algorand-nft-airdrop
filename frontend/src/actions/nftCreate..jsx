const { create } = require("ipfs-http-client");
const ipfs = create("https://ipfs.infura.io:5001");

export const airdropNFT = async (
  name,
  description,
  image,
  account
) => {
  try {
    const gateway = await ipfsUpload(
      name,
      ingredients,
      description,
      image
    );
    const tokenURI = gateway;

    // TODO call algorand for nft creation here with tokenUri
    // await market.createMarketItem(tokenURI, { nonce: nonce + 1 });
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const ipfsUpload = async (name, recipe, description, image) => {
  let imagePath = await ipfsImageUpload(image);
  console.log(recipe);
  const files = {
    path: "/",
    content: JSON.stringify({
      name: name,
      image: imagePath,
      description: description,
    }),
  };
  console.log(files);
  const result = await ipfs.add(files);
  return result.path;
};

export const ipfsImageUpload = async (image) => {
  const result = await ipfs.add(image);
  let imagePath = `https://gateway.ipfs.io/ipfs/${result.path}`;
  return imagePath;
};