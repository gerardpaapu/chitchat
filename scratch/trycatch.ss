(try foo.bar)

(try foo.bar
     err err.toString)

(try (block do.a.thing
            and.then)
     err (block
            (recover from err))
     everything.is.fine)
