(function () {
    var tokenize, parse;
    
    // expression   := message-pass | reference | assignment | literal
    // message-pass := '(' expression message args ')'    
    // args         := [ expression ',' ]* expression | epsilon
    // value        := location | literal
    // location     := reference | property
    // literal      := hash | array | number | string
    // message      := symbol | '@' expression
}.call(this));
