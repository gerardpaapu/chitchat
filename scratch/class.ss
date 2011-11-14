(class Foo (Base)
    (define (init)
        (this method-foo n))

    (define (method-foo bar)
      baz))

(var Foo)
(set! Foo ((function ()
    (var Constructor proto)
    (set! Constructor (function ()
                        (if this.init.isFunction
                          (this.init apply this arguments))))
    (set! (Constructor prototype (Object create (get! Base prototype))))
    (set! proto (get! Constructor prototype))
    (set! (proto init) (function (n) (this method-foo n)))
    (set! (proto method-foo) (function (bar) baz))
    Constructor)
 call this))

(let (a b)
  body ...)

((function ()
    (var a b)
    body ...) call this)
