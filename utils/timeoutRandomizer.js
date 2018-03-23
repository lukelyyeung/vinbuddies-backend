module.exports = (range) => {
    let timeout = Math.random() * (range[1] - range[0]) + range[0];
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(console.log('Waited for ', timeout/1000, ' seconds'));
        }, timeout);
    })
}