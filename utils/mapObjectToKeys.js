const mapObjectToKeys = (keys, ...otherSet) => {
    let endArray = [];
    otherSet.forEach((set, index) => {
        let key = Object.keys(set)[0];
        let valueArray = set[key];
        valueArray.forEach((value, index) => {
            endArray[index] = endArray[index] || { ...keys };
            endArray[index] = Object.assign(endArray[index], { [key]: value })
        });
    });
    return endArray;
}
module.exports = mapObjectToKeys;