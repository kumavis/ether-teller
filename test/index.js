var test = require('tape')
var EthTeller = require('../index.js')
var AncientLocal = require('ancient-tome/local')
var TomeIndexer = require('ancient-tome/indexer')
var Transaction = require('ethereumjs-lib').Transaction

test('generate identity', function(t){
  clearLocalStorage()
  setupWalletManager(function(err, walletManager){
    t.notOk(err)
    walletManager.generateIdentity('first', function(err, wallet){
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
    walletManager.generateIdentity('first', function(err, wallet){
      t.notOk(err)
      t.ok(wallet)
      setupWalletManager(function(err, walletManager){
        t.notOk(err)
        walletManager.generateIdentity('first', function(err, wallet){
          t.notOk(err)
          t.ok(wallet)
          t.end()
        })
      })
    })
  })
})

test('key list', function(t){
  clearLocalStorage()
  setupWalletManager(function(err, walletManager){
    t.notOk(err)
    t.equal(walletManager.keyList().length, 0, 'key list should be empty')
    walletManager.generateIdentity('first', function(err, wallet){
      t.notOk(err)
      t.ok(wallet)
      t.equal(walletManager.keyList().length, 1, 'key list should have one entry')
      t.equal(walletManager.keyList().indexOf(wallet.id), 0, 'key list should show new key in correct place')
      walletManager.generateIdentity('second', function(err, wallet){
        t.notOk(err)
        t.ok(wallet)
        t.equal(walletManager.keyList().length, 2, 'key list should have two entries')
        t.equal(walletManager.keyList().indexOf(wallet.id), 1, 'key list should show new key in correct place')
        t.end()
      })
    })
  })
})

test('lookup', function(t){
  clearLocalStorage()
  setupWalletManager(function(err, walletManager){
    t.notOk(err)
    t.equal(walletManager.keyList().length, 0, 'key list should be empty')
    walletManager.generateIdentity('first', function(err, wallet){
      t.notOk(err)
      t.ok(wallet)
      t.equal(walletManager.keyList().length, 1, 'key list should have one entry')
      walletManager.lookup(wallet.id, function(err, wallet){
        t.notOk(err)
        t.ok(wallet)
        t.end()
      })
    })
  })
})

test('sign', function(t){
  clearLocalStorage()
  setupWalletManager(function(err, walletManager){
    t.notOk(err)
    t.equal(walletManager.keyList().length, 0, 'key list should be empty')
    walletManager.generateIdentity('first', function(err, wallet){
      t.notOk(err)
      t.ok(wallet)
      t.equal(walletManager.keyList().length, 1, 'key list should have one entry')

      var tx = new Transaction({
        to: wallet.address,
        value: 'deadbeef',
        nonce: 'ffff',
        gasLimit: 5000,
        gasPrice: 1,
      })

      walletManager.sign(wallet.id, tx, function(err, signedTx){
        if (err) throw err
        t.notOk(err, 'No error signing the Transaction')
        t.ok(signedTx, 'Got signed Transaction')
        console.log(signedTx)
        t.end()
      })
    })
  })
})

// util

function setupWalletManager(cb) {
  var secureStorage = AncientLocal()

  // instrument set for debugging
  // var _set = secureStorage.set
  // secureStorage.set = function(key, value, cb){
  //   console.log('key:',key,'value:',value)
  //   _set.call(secureStorage, key, value, cb)
  // }

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