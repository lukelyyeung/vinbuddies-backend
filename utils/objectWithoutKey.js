objectWithoutKey = (object, key) => {
  const { [key]: deletedKey, ...otherKeys } = object;
  return [otherKeys, deletedKey];
}

module.exports = objectWithoutKey;