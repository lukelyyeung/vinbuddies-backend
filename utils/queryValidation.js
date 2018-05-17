const Integer = /^\d+$/;

const queryValidation = (query, properties) => {
    return properties.map(property => {
        let string = query.hasOwnProperty(property) ? query[property] : null;
        if (!string) {
            return string;
        };
        
        switch (string) {
            case "true": {
                return true;
            }
            case "false": {
                return false;
            }
        }

        const Integer = /^\d+$/;
        if (Integer.test(string)) {
            return Number(string);
        }

        return string;
    })
}

module.exports = queryValidation;