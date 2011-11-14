(Number extend #{
    factorial (fn () 
                  (if (this < 2) 1 (this * ((this -1) factorial))))
})


; CHITCHAT.passMessage(Number, 'extend', {
;     factorial: function () {
;         return CHITCHAT.passMessage(this, '<', 2) ? 1
;             : CHITCHAT.passMessage(this, '*', CHITCHAT.passMessage(CHITCHAT.passMessage(this, '-1'), 'factorial'));
;     }
; });



