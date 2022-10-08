var isReady = false;
const image = document.createElement('img');
image.src = "/modules/toasty/artwork/toasty.png";
image.classList.add('toasty-image-default');
document.body.appendChild(image);

const audio = document.createElement('audio');
audio.src = "/modules/toasty/sounds/toasty.mp3"
document.body.appendChild(audio);

https://schmolive.forge-vtt.com
function TOASTY() {
    
    image.classList.add('active');
    audio.play();
    setTimeout(() => {
        image.classList.remove('active');
    }, 1000);
    Hooks.off('diceSoNiceRollComplete', TOASTY);
}

Hooks.on("ready", () => isReady = true);

/**
 * Hide messages which are animating rolls.
 */
Hooks.on("renderChatMessage", (message, html, data) => {
    if (!isReady) return;

    // only process roll messages
    const rollResult = message.isRoll ? message.roll.result : null;
    if (rollResult === null) return;

    // only process 20 sided dice rolls
    const twentySidedDie = message.roll.dice.find(x => x.faces === 20);
    if (!twentySidedDie) return;

    // only process single 20 sided dice rolls
    if (twentySidedDie.results.length !== 1) return;

    // only process single 20 sided dice crit fails
    const hasCritFail = twentySidedDie.results.filter(({ result }) => result === 1).length === 1;
    if (!hasCritFail) return;

    if (message._dice3danimating && !game.settings.get("dice-so-nice", "immediatelyDisplayChatMessages")) {
        Hooks.on('diceSoNiceRollComplete', TOASTY)
    } else {
        TOASTY();
    }
});