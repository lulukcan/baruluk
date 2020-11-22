const { create, Client } = require('@open-wa/wa-automate')
const figlet = require('figlet')
const options = require('./utils/options')
const { color, messageLog } = require('./utils')
const HandleMsg = require('./HandleMsg')

const start = (pakforlay = new Client()) => {
    console.log(color(figlet.textSync('----------------', { horizontalLayout: 'default' })))
    console.log(color(figlet.textSync('Luluk BOT', { font: 'Ghost', horizontalLayout: 'default' })))
    console.log(color(figlet.textSync('----------------', { horizontalLayout: 'default' })))
    console.log(color('[DEV]'), color('LAC', 'yellow'))
    console.log(color('[~>>]'), color('BOT Started!', 'green'))

    // Mempertahankan sesi agar tetap nyala
    pakforlay.onStateChanged((state) => {
        console.log(color('[~>>]', 'red'), state)
        if (state === 'CONFLICT' || state === 'UNLAUNCHED') pakforlay.forceRefocus()
    })

    // ketika bot diinvite ke dalam group
    pakforlay.onAddedToGroup(async (chat) => {
	const groups = await pakforlay.getAllGroups()
	// kondisi ketika batas group bot telah tercapai,ubah di file settings/setting.json
	if (groups.length > groupLimit) {
	await pakforlay.sendText(chat.id, `Sorry, the group on this bot is full, jika pengen bot ini masuk group silahkan WA: 089660728860\nMax Group is: ${groupLimit}`).then(() => {
	      pakforlay.leaveGroup(chat.id)
	      pakforlay.deleteChat(chat.id)
	  }) 
	} else {
	// kondisi ketika batas member group belum tercapai, ubah di file settings/setting.json
	    if (chat.groupMetadata.participants.length < memberLimit) {
	    await pakforlay.sendText(chat.id, `Sorry, BOT comes out if the group members do not exceed ${memberLimit} people`).then(() => {
	      pakforlay.leaveGroup(chat.id)
	      pakforlay.deleteChat(chat.id)
	    })
	    } else {
        await pakforlay.simulateTyping(chat.id, true).then(async () => {
          await pakforlay.sendText(chat.id, `Hai minna~, Im LAC BOT. To find out the commands on this bot type ${prefix}menu`)
        })
	    }
	}
    })

    // ketika seseorang masuk/keluar dari group
    pakforlay.onGlobalParicipantsChanged(async (event) => {
        const host = await pakforlay.getHostNumber() + '@c.us'
        // kondisi ketika seseorang diinvite/join group lewat link
        if (event.action === 'add' && event.who !== host) {
            await pakforlay.sendTextWithMentions(event.chat, `Hello 👏, Welcome to di group ini kaka😇👉 @${event.who.replace('@c.us', '')} 👈\nJangan lupa follow ig saya ya https://instagram.com/bknsr/ ✨`)
        }
        // kondisi ketika seseorang dikick/keluar dari group
        if (event.action === 'remove' && event.who !== host) {
            await pakforlay.sendTextWithMentions(event.chat, `Good bye, semoga anda tenang disana & diterima di neraka yaa👍😁 @${event.who.replace('@c.us', '')}, We'll miss you✨`)
        }
    })

    pakforlay.onIncomingCall(async (callData) => {
        // ketika seseorang menelpon nomor bot akan mengirim pesan
        await pakforlay.sendText(callData.peerJid, 'Terimakasih anda telah melanggar rulles BoT saya dengan menelfon BoT ini, Anda gw block! 👍.\n\n-BOT LAC 🤖')
        .then(async () => {
            // bot akan memblock nomor itu
            await pakforlay.contactBlock(callData.peerJid)
        })
    })

    // ketika seseorang mengirim pesan
    pakforlay.onMessage(async (message) => {
        pakforlay.getAmountOfLoadedMessages() // menghapus pesan cache jika sudah 3000 pesan.
            .then((msg) => {
                if (msg >= 3000) {
                    console.log('[pakforlay]', color(`Loaded Message Reach ${msg}, cuting message cache...`, 'yellow'))
                    pakforlay.cutMsgCache()
                }
            })
        HandleMsg(pakforlay, message)    
    
    })
	
    // Message log for analytic
    pakforlay.onAnyMessage((anal) => { 
        messageLog(anal.fromMe, anal.type)
    })
}

//create session
create(options(true, start))
    .then((pakforlay) => start(pakforlay))
    .catch((err) => new Error(err))
