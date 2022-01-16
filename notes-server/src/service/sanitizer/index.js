const _ = require('lodash');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

export function xssSanitizer(string) {
    return DOMPurify.sanitize(string);
}

export function deepXssSanitizer(data) {
    try {
        if (!data || (typeof data !== 'string' && !_.isObject(data))) {
            return data;
        }

        if (typeof data === 'string') {
            return xssSanitizer(data);
        }

        if (_.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                data[i] = deepXssSanitizer(data[i]);
            }

            return data;
        }

        if (_.isPlainObject(data)) {
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    data[key] = deepXssSanitizer(data[key]);
                }
            }
        }

        return data;
    } catch (e) {
        return data;
    }
}
