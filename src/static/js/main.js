Main = {
  loading: false,
  contracts: {},

  toEth: (n) => {
    return web3.utils.fromWei(n, 'ether')
  },
  toWei: (n) => {
    return web3.utils.toWei(n, 'ether')
  },
  load: async () => {
    Main.toggleLoadingScreen(true)
    await Main.loadWeb3(true)

    $walletBtn = $('#wallet')
    $walletBtn.on('click', async () => {
      await Main.loadWeb3(false)
    })
    await Main.setupMetamaskEvents()
    await Main.setupClicks()

    await Main.toggleLoadingScreen(false)
    console.log('loading done!')
  },
  toggleLoadingScreen: async (load) => {
    if(load) {
      $('.loading').show()
      $('.content').hide()
    }
    else {
      $('.loading').hide()
      $('.content').show()
    }
  },
  setupMetamaskEvents: async () => {
    if(typeof(ethereum) === 'undefined') { return }

    ethereum.on('accountsChanged', async () => {
      Main.toggleLoadingScreen(true)
      window.location.reload()
    });

    ethereum.on('chainChanged', async () => {
      Main.toggleLoadingScreen(true)
      window.location.reload()
    });
  },
  loadContract: async () => {
    const toast = await $.getJSON('contracts/Toasty.json')
    Main.contracts.Toast = TruffleContract(toast)
    Main.contracts.Toast.setProvider(Main.web3Provider)

    const toastyFinance = await $.getJSON('contracts/ToastyFinance.json')
    Main.contracts.ToastyFinance = TruffleContract(toastyFinance)
    Main.contracts.ToastyFinance.setProvider(Main.web3Provider)

    try {
      let networkId = await web3.eth.net.getId()
      if(networkId === 56){
        Main.toast = await Main.contracts.Toast.at('0xe53080ec2faa685c51175dd631918c03655f7d36')
        Main.toastyFinance = await Main.contracts.ToastyFinance.at('0xa363b56b1194478440a13379cc6ef1c781191f31')
      }
      else {
        Main.toast = await Main.contracts.Toast.deployed()
        Main.toastyFinance = await Main.contracts.ToastyFinance.deployed()
      }
    }
    catch {
      alert('Wrong network. Please change to BSC mainnet.')
    }
  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async (firstLoad) => {
    if (typeof web3 !== 'undefined') {
      Main.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      if(!firstLoad) { window.alert("Please connect to Metamask.") }
    }
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        if(!firstLoad) { await ethereum.enable() }
      } catch {}
    }
    else if (window.web3) {
      Main.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
    }

    if(typeof web3 !== 'undefined'){ Main.accountConnected() }
  },
  accounts: async () => {
    const acc = await web3.eth.getAccounts()
    return acc
  },
  accountConnected: async () => {
    let accounts = await Main.accounts()
    if(accounts.length > 0) {
      Main.account = accounts[0]
      let acc = accounts[0]
      $walletBtn.html(acc.slice(0, 5) + '...' + acc.slice(acc.length - 4, acc.length))

      await Main.loadContract()
      await Main.fetchAccountData()
    }
  },
  fetchAccountData: async () => {
    let toastBalance = await Main.toast.balanceOf(Main.account)
    toastBalance = Main.toEth(toastBalance.toString())
    $('#toast-balance').html(Math.round(parseFloat(toastBalance) * 100) / 100)

    let allowanceToast = await Main.toast.allowance(Main.account, Main.toastyFinance.address)
    if(allowanceToast > 0) {
      $('#deposit').show()
      $('#withdraw').show()
    }
    else {
      $('#approve').show()
    }

    Main.toastyAccount = await Main.toastyFinance.accounts(Main.account)
    let lastUpdatedAt = Main.toastyAccount.updatedAt.toString()
    lastUpdatedAt = parseInt(lastUpdatedAt)
    lastUpdatedAt = new Date(lastUpdatedAt * 1000)

    var options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric',  minute: 'numeric' }

    $('#last-updatedAt').html(lastUpdatedAt.toLocaleDateString("en-US", options))

    let mainToastInAccount = Main.toEth(Main.toastyAccount.amount)
    // get rewards
    let timestamp = Math.round(new Date().getTime() / 1000)
    let pendingRewards = await Main.toastyFinance.pendingRewards(timestamp, { from: Main.account })

    pendingRewards = parseFloat(Main.toEth(pendingRewards.toString()))
    let total = parseFloat(mainToastInAccount) + pendingRewards

    $('#toast-in-account').html(Math.round(total * 100) / 100) // round to 2 decimal
    Main.setupDynamicRewardsUpdate()
  },
  setupDynamicRewardsUpdate: async () => {
    let mainToastInAccount = Main.toEth(Main.toastyAccount.amount)
    setInterval(async () => {
      let timestamp = Math.round(new Date().getTime() / 1000)
      let pendingRewards = await Main.toastyFinance.pendingRewards(timestamp, { from: Main.account })
      pendingRewards = parseFloat(Main.toEth(pendingRewards.toString()))
      let total = parseFloat(mainToastInAccount) + pendingRewards
      $('#toast-in-account').html(Math.round(total * 100) / 100) // round to 2 decimal
    }, 1000)
  },
  setupClicks: async () => {
    $('#deposit-max').on('click', async () => {
      let toastBalance = await Main.toast.balanceOf(Main.account)
      $('#deposit-input').val(Main.toEth(toastBalance.toString()))
    })

    $('#withdraw-max').on('click', async () => {
      let toastStaked = await Main.getAccountTotalStaked()
      $('#withdraw-input').val(toastStaked)
    })

    $('#approve').on('click', async (e) => {
      let amount = Main.toWei('1000000000')
      Main.buttonLoadingHelper(e, 'approving...', async () => {
        await Main.toast.approve(Main.toastyFinance.address, amount, { from: Main.account }).once("transactionHash", async (txHash) => {
          Main.handleTransaction(txHash, 'Approving TOAST token...')
        })
      })
    })

    $('#deposit').on('click', async (e) => {
      let amount = $('#deposit-input').val()
      Main.buttonLoadingHelper(e, 'staking...', async () => {
        await Main.toastyFinance.deposit(Main.toWei(amount), { from: Main.account }).once("transactionHash", async (txHash) => {
          Main.handleTransaction(txHash, 'Staking TOAST...')
        })
      })
    })

    $('#withdraw').on('click', async (e) => {
      let amount = $('#withdraw-input').val()
      Main.buttonLoadingHelper(e, 'unstaking...', async () => {
        await Main.toastyFinance.withdraw(Main.toWei(amount), { from: Main.account }).once("transactionHash", async (txHash) => {
          Main.handleTransaction(txHash, 'Unstaking TOAST...')
        })
      })
    })
  },


  getAccountTotalStaked: async () => {
    let mainToastInAccount = Main.toEth(Main.toastyAccount.amount)
    // get rewards
    let timestamp = Math.round(new Date().getTime() / 1000)
    let pendingRewards = await Main.toastyFinance.pendingRewards(timestamp, { from: Main.account })

    pendingRewards = parseFloat(Main.toEth(pendingRewards.toString()))
    return parseFloat(mainToastInAccount) + pendingRewards
  },


  // helper functions
  buttonLoadingHelper: async (event, loadingText, callback) => {
    $btn = $(event.target)
    $btn.attr('disabled', 'disabled')
    $btn.html(loadingText)
    try {
      await callback()
    } catch {
      window.location.reload()
    }
    window.location.reload()
  },
  handleTransaction: async (txHash, message) => {
    $('#create-node').modal('hide')
    $modal = $('#tx-alert')
    $modal.find('#tx-link').attr('href', 'https://polygonscan.com/tx/' + txHash)
    $modal.find('#tx-message').html(message)
    $modal.modal('show')
  }
}

$(() => {
  $(window).load(() => {
    Main.load()
  })
})
