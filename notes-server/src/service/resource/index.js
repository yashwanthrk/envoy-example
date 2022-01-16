const R = require('ramda');

function Resource(options) {
    this.options = options || {};
    this.keys = this.options.keys || [];

    if (R.type(this.keys) !== 'Array') {
        this.keys = [];
    }
}

Resource.prototype.format = function (data) {
    if (R.type(data) !== 'Array' && R.type(data) !== 'Object') {
        return null;
    }

    const pick = (val) => R.pick(this.keys, val);

    if (R.type(data) === 'Array') {
        return data.reduce((acc, val) => {
            if (R.type(val) === 'Object') {
                acc.push(pick(val));
            }

            return acc;
        }, []);
    }

    return pick(data);
};

exports = module.exports = Resource;
