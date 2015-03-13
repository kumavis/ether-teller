#### Eth-Teller

Automated Ethereum Wallet Management.

Use with (`ancient-tome`)[https://github.com/kumavis/ancient-tome] and `ancient-tome/indexer`.

```js
var AncientLocal = require('ancient-tome/local')
var TomeIndexer = require('ancient-tome/indexer')

var secureStorage = TomeIndexer(AncientLocal())

secureStorage.open(password, function(err){
  if (err) return cb(err)

  var walletManager = EthTeller(secureStorage)
  walletManager.generateIdentity(name, function(err, wallet){ ... })

})
```