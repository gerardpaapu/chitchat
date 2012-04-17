Arrays
--

#[foo, bar, baz] ; [foo, bar, baz]

#{ :foo bar,
   'baz' quux } ; { 'foo': bar, 'baz': quux }

Strings
--

"poop 'monster'"
'poop "monster"'
:poop-monster ; ':' followed by a legal symbol

Property Access
--

; each of these pass the message "bar" to foo
foo.bar
foo.["bar"]
(foo bar)
(foo ~"bar")

Primitive Access
--

foo:bar ; translates to the javascript 'foo.bar' 
Foo::bar ; translates to the javascript 'Foo.prototype.bar'

Blocks
--

{ foo, bar } ; evaluates to bar


Functions
--

(function [foo, bar]
    baz
    quux) ; returns quux 

^[foo, bar] { 
    baz
    quux ; returns quux
} 

; both compile to: 
;
;    function (foo, bar) {
;       baz;
;       return quux;
;    }

^[foo, bar] quux ; compiles to: function (foo, bar) { return quux; }

^quux ; compiles to: function () { return quux; }

^(#0 + #1) ; compiles to: function () { return arguments[0] + arguments[1]; }
