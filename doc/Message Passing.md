Message Passing
==

Message passing in chitchat is provided at runtime by the function
`passMessage(Object reciever, string message, Objects args...)`

```javascript

var passMessage = require('./runtime/passMessage.js').passMessage;

passMessage(['a', 'b', 'c'], 'length'); // 3
passMessage(['a', 'b', 'c'], 'nth', 2); // 'c'
```
