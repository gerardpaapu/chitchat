(function () {
    /*globals window: false, module: false */
    var global;
    if (typeof window != 'undefined') {
        global = window;
    } else if (typeof module != 'undefined' && module.exports) {
        global = module.exports;
    }

    global.CHITCHAT = {
        builtins: {} 
    };
}.call(null));
