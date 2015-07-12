var test = require('tape')
var EthTeller = require('../index.js')
var AncientLocal = require('ancient-tome/local')
var TomeIndexer = require('ancient-tome/indexer')
var Transaction = require('ethereumjs-lib').Transaction

test('generate identity', function(t){
  clearLocalStorage()
  setupWalletManager(function(err, walletManager){
    t.notOk(err)
    walletManager.generateIdentity({ label: 'first' }, function(err, wallet){
      t.notOk(err)
      t.ok(wallet)
      t.end()
    })
  })
})

test('double setup', function(t){
  clearLocalStorage()
  setupWalletManager(function(err, walletManager){
    t.notOk(err)
    walletManager.generateIdentity({ label: 'first' }, function(err, wallet){
      t.notOk(err)
      t.ok(wallet)
      setupWalletManager(function(err, walletManager){
        t.notOk(err)
        walletManager.generateIdentity({ label: 'first' }, function(err, wallet){
          t.notOk(err)
          t.ok(wallet)
          t.end()
        })
      })
    })
  })
})


// util

function setupWalletManager(cb) {
  var secureStorage = AncientLocal()
  TomeIndexer(secureStorage)

  secureStorage.open('1234_CatsLikePizza', function(err){
    if (err) return cb(err)

    secureStorage.getItem('test-data', function(err, plaintext) {
      if (err) return cb(err)

      var walletManager = EthTeller(secureStorage)
      cb(null, walletManager)
    })

  })
}

function clearLocalStorage() {
  for (var key in localStorage) {
    localStorage.removeItem(key)
  }
}