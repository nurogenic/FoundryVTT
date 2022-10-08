const isReady = false;
const image = document.createElement('img');
image.src = "/modules/toasty/artwork/toasty.png";
image.classList.add('toasty-image-default');
document.appendChild(image);

const audio = document.createElement('audio');
audio.src = "/modules/toasty/sounds/toasty.mp3"
document.body.appendChild(audio);

https://schmolive.forge-vtt.com
function TOASTY() {
    
    image.classList.add('active');
    audio.play();
    setTimeout(() => {
        image.classList.remove('active');
    }, 2000);
    Hooks.off('diceSoNiceRollComplete', TOASTY);
}

Hooks.on("ready", () => isReady = 1);

/**
 * Hide messages which are animating rolls.
 */
Hooks.on("renderChatMessage", (message, html, data) => {
    // if (!isReady) return;

    const rollResult = message.isRoll ? message.roll.result : null;
    if (rollResult === null) return;

    const hasCritFail = message.roll.dice[0].results.filter(({ result }) => result === 1).length;
    if (!hasCritFail) return;


    if (message._dice3danimating && !game.settings.get("dice-so-nice", "immediatelyDisplayChatMessages")) {
        Hooks.on('diceSoNiceRollComplete', TOASTY)
    } else {
        TOASTY();
    }
});