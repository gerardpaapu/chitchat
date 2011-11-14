;; These are just some thoughts about what ChitChat might look like, 
;; nothing is really set in stone
(def-class Promise (PubSub) 
       ;; do I need these?
       (vars _resolved _value _succeeded)

       (def-method (succeed value)
                   (self resolve value t))

       (def-method (fail)
                   (self resolve null t))

       (def-method (resolve value succeeded)
           (unless @isResolved ;; this should be a synonym for (self isResolved)
             ;; this should be ivar access... but how~!~!~!
             ;; ANOTHER glyph? this would be the glyphiest lisp-syntax oop language ever
             (set! @_resolved true)
             (set! @_succeeded succeeded)

             (when succeeded  
               (self setValue value)) 

             (self publish "resolved" value succeeded)

             (if succeeded
               (self publish "succeeded" value)
               (self publish "failed")))
           self)

       (def-method (then callback failure_callback)
           (var promise)
           (set! promise (Promise new))
           (self subscribe "resolved" 
                 (fn (value succeeded)
                     (if succeeded


                       )))))

(var Promise)
(set! Promise (fn ()))
(set! Promise.prototype (Object create Events.prototype))

(set! Promise.prototype.succeed
  (fn (value) (this resolve value true)))

(set! Promise.prototype.fail
  (fn () (this resolve value false)))

(set! Promise.prototype.resolve
  (fn (value succeeded)

;; --
(Promise implement #{
     succeed (fn (value) (this resolve value true))
     fail    (fn () (this resolve null false))

     resolve (fn (value succeeded)
         (unless @isResolved
           (set! @_resolved true)
           (set! @_succeeded succeeded)

           (when succeeded  
             (self setValue value)) 

           (self publish "resolved" value succeeded)

           (if succeeded
             (self publish "succeeded" value)
             (self publish "failed")))

         self)
})
