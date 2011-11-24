/*globals ChitChat: false */
var Compiler = ChitChat.Compiler = {},
    Module = require('./env').Module;

Compiler.primitives = new Module(function () {
    var slice, type, format, wrap;

    this.providePrimitives({
        'if': function (body/* [test, true_branch, false_branch] */, env, compile) {
            var i, max, tail, result = '', args = slice(arguments);

            if (args.length < 2) throw new SyntaxError();

            if (args.length % 2 > 0) {
                max = args.length - 2;
                tail = compile(args[args.length - 1]);
            } else {
                max = args.length - 1;    
                tail = 'null';
            }

            for (i = 0; i < max; i += 2) {
                result += format('$0?$1:',
                                 compile(args[i]),
                                 compile(args[i + 1]));
            }

            result += tail;

            return result;
        },

        'function': function (_body/* [args , body..., tail] */, env, compile) {
            var arg_s, body_s, args, body, tail;
            args = _body[0];
            body = _body.slice(1, -1);
            tail = _body[_body.length - 1];

            arg_s = args.map(function (arg) {
                assert.ok(arg instanceof Symbol);
                return compile(arg);
            }).join(', ');

            body_s = compileFunctionBody(slice(arguments, 1));

            return format('function ($0) {\n$1\n}', arg_s, body_s); 
        },

        '#ARRAY': function (body, env, compile) {
            return '[' + slice(body).map(function (e) { return compile(e, env); }).join(', ') + ']';
        },

        '#DICT': function (body, env, compile) {
            var args = slice(arguments), max = args.length, i, pairs = [];

            if (max % 2 !== 0) throw new SyntaxError(); 

            for (i = 0; i < max; i += 2) {
                pairs.push(format('"$0": $1', args[i].value, compile(args[i + 1], env)));
            }

            return format('{$0}', pairs.join(', '));
        },

        '#MSG': function () {
            throw new SyntaxError();
        },

        'var': function () {
            throw new SyntaxError();
        },

        'block': function () {
            return wrap(compileFunctionBody( slice(arguments) ));
        },

        'try': function (try_b, err, catch_b, finally_b) {
            var templates = [
                'try { return $0; } catch (err) { return null; }',
                'try { return $0; } catch ($1) { return $2; }',
                'try { $0 } catch ($1) { $2 } finally { return $3; }'
            ]; 

            switch (arguments.length) {
                case 0: case 2:
                    throw new SyntaxError();

                case 1:
                    return wrap(format(templates[0], compile(try_b)));

                case 3:
                    assert.ok(err instanceof Symbol);
                    return wrap(format(templates[1],
                                  compile(try_b),
                                  compileSymbol(err),
                                  compile(catch_b)));

                case 4:
                    assert.ok(err instanceof Symbol);
                    return wrap(format(templates[2],
                                  compile(try_b),
                                  compileSymbol(err),
                                  compile(catch_b),
                                  compile(finally_b)));
            }
        },

        'set': function (place, value) {
            // (set foo bar)              -> foo = bar
            // (set (foo bar) baz)        -> passMessage(foo, 'set', 'baz', baz)
            // (set (foo (#MSG bar)) baz) -> passMessage(foo, 'set', bar, baz)
            var obj, msg, key;

            if (place instanceof Symbol) {
                return format('$0 = $1', compile(place), compile(value));
            }

            assert.equal(type(place), 'Array');
            assert.equal(place.length, 2);

            obj = place[0];
            msg = place[1];
            key = type(msg) === 'Array' ? msg[1] : msg.value;

            assert.ok(isMessage(msg));

            return compile([obj, new Symbol('set'), key, value]);
        },

        // set! and get! provide primitive access and assignment
        'set!': function (place, value) {
            // (set foo bar)               -> foo = bar
            // (set! (foo bar) baz)        -> foo['bar'] = baz
            // (set! (foo (#MSG bar)) baz) -> foo[bar] = baz
            var obj, msg;

            if (place instanceof Symbol) {
                return format('$0 = $1', compile(place), compile(value));
            }

            assert.equal(type(place), 'Array');
            assert.equal(place.length, 2);

            obj = place[0];
            msg = place[1];

            assert.ok(isMessage(msg));

            return format('$0[$1] = $2', compile(obj), compileMessage(msg), compile(value));
        },

        'get!': function (place) {
            // (get! (foo bar))        -> foo['bar']
            // (get! (foo (#MSG exp))) -> foo[exp]
            var obj, msg;

            assert.equal(type(place), 'Array');
            assert.equal(place.length, 2);
            assert.ok(isMessage(place[1]));

            obj = place[0];
            msg = place[1];

            return format('$0[$1]', compile(obj), compileMessage(msg));
        }
    });

    slice = function (arr, a, b) {
        return Array.prototype.slice.call(arr, a, b);
    };

    type = function (obj) {
        return obj == null ? String(obj)
        :  Object.prototype.toString.call(obj).slice(8, -1);
    };

    format = function (template) {
        var values = slice(arguments, 1);
        return template.replace(/\$(\d+)/g, function (_, n) {
            return values[n];
        }); 
    };

    wrap = function (body) {
        var template = "(function () {\n$0\n}.apply(this, (typeof arguments != 'undefined') ? arguments : []))";
        return format(template, body);
    };
});
