var DATE = function () {
    Date.apply(this, arguments); 
};
exports.Date = DATE;
DATE.prototype = Object.create(Date.prototype);
DATE.extend = function (key, value) {
    DATE.prototype[key] = value;
    return this;
};
