import { Dice3D } from './Dice3D.js';
import { DiceConfig } from './DiceConfig.js';
import { RollableAreaConfig } from './RollableAreaConfig.js';
import { Utils } from './Utils.js';

/**
 * Registers the exposed settings for the various 3D dice options.
 */
Hooks.once('init', () => {
    const debouncedReload = foundry.utils.debounce(() => {
        window.location.reload();
    }, 100);
    game.settings.registerMenu("dice-so-nice", "dice-so-nice", {
        name: "DICESONICE.config",
        label: "DICESONICE.configTitle",
        hint: "DICESONICE.configHint",
        icon: "fas fa-dice-d20",
        type: DiceConfig,
        restricted: false
    });

    game.settings.registerMenu("dice-so-nice", "rollable-area", {
        name: "DICESONICE.RollableAreaConfig",
        label: "DICESONICE.RollableAreaConfigTitle",
        hint: "DICESONICE.RollableAreaConfigHint",
        icon: "fas fa-crop-alt",
        type: RollableAreaConfig,
        restricted: false
    });

    //Not used anymore but kept for compatibility with migration
    game.settings.register("dice-so-nice", "settings", {
        name: "3D Dice Settings",
        scope: "client",
        default: {},
        type: Object,
        config: false
    });

    game.settings.register("dice-so-nice", "maxDiceNumber", {
        name: "DICESONICE.maxDiceNumber",
        hint: "DICESONICE.maxDiceNumberHint",
        scope: "world",
        type: Number,
        default: 20,
        range: {
            min: 20,
            max: 100,
            step: 5
        },
        config: true
    });

    game.settings.register("dice-so-nice", "globalAnimationSpeed", {
        name: "DICESONICE.globalAnimationSpeed",
        hint: "DICESONICE.globalAnimationSpeedHint",
        scope: "world",
        type: String,
        choices: Utils.localize({
            "0": "DICESONICE.PlayerSpeed",
            "1": "DICESONICE.NormalSpeed",
            "2": "DICESONICE.2xSpeed",
            "3": "DICESONICE.3xSpeed"
        }),
        default: "0",
        config: true,
        onChange: debouncedReload
    });

    game.settings.register("dice-so-nice", "enabledSimultaneousRolls", {
        name: "DICESONICE.enabledSimultaneousRolls",
        hint: "DICESONICE.enabledSimultaneousRollsHint",
        scope: "world",
        type: Boolean,
        default: true,
        config: true,
        onChange: debouncedReload
    });

    game.settings.register("dice-so-nice", "enabledSimultaneousRollForMessage", {
        name: "DICESONICE.enabledSimultaneousRollForMessage",
        hint: "DICESONICE.enabledSimultaneousRollForMessageHint",
        scope: "world",
        type: Boolean,
        default: true,
        config: true
    });

    game.settings.register("dice-so-nice", "diceCanBeFlipped", {
        name: "DICESONICE.diceCanBeFlipped",
        hint: "DICESONICE.diceCanBeFlippedHint",
        scope: "world",
        type: Boolean,
        default: true,
        config: true
    });

    game.settings.register("dice-so-nice", "formatVersion", {
        scope: "world",
        type: String,
        default: "",
        config: false
    });

    game.settings.register("dice-so-nice", "disabledDuringCombat", {
        name: "DICESONICE.disabledDuringCombat",
        hint: "DICESONICE.disabledDuringCombatHint",
        scope: "world",
        type: Boolean,
        default: false,
        config: true
    });

    game.settings.register("dice-so-nice", "disabledForInitiative", {
        name: "DICESONICE.disabledForInitiative",
        hint: "DICESONICE.disabledForInitiativeHint",
        scope: "world",
        type: Boolean,
        default: false,
        config: true
    });

    game.settings.register("dice-so-nice", "immediatelyDisplayChatMessages", {
        name: "DICESONICE.immediatelyDisplayChatMessages",
        hint: "DICESONICE.immediatelyDisplayChatMessagesHint",
        scope: "world",
        type: Boolean,
        default: false,
        config: true
    });

    game.settings.register("dice-so-nice", "animateRollTable", {
        name: "DICESONICE.animateRollTable",
        hint: "DICESONICE.animateRollTableHint",
        scope: "world",
        type: Boolean,
        default: false,
        config: true
    });

    game.settings.register("dice-so-nice", "animateInlineRoll", {
        name: "DICESONICE.animateInlineRoll",
        hint: "DICESONICE.animateInlineRollHint",
        scope: "world",
        type: Boolean,
        default: true,
        config: true
    });

    game.settings.register("dice-so-nice", "hideNpcRolls", {
        name: "DICESONICE.hideNpcRolls",
        hint: "DICESONICE.hideNpcRollsHint",
        scope: "world",
        type: Boolean,
        default: false,
        config: true
    });

    game.settings.register("dice-so-nice", "allowInteractivity", {
        name: "DICESONICE.allowInteractivity",
        hint: "DICESONICE.allowInteractivityHint",
        scope: "world",
        type: Boolean,
        default: true,
        config: true,
        onChange: debouncedReload
    });

    game.settings.register("dice-so-nice", "showGhostDice", {
        name: "DICESONICE.showGhostDice",
        hint: "DICESONICE.showGhostDiceHint",
        scope: "world",
        type: Boolean,
        default: false,
        config: true
    });

});

/**
 * Intercepts all roll-type messages hiding the content until the animation is finished
 */
Hooks.on('createChatMessage', (chatMessage) => {
    //precheck for better perf
    console.log(chatMessage);
    return;

    let hasInlineRoll = game.settings.get("dice-so-nice", "animateInlineRoll") && chatMessage.content.indexOf('inline-roll') !== -1;
    if ((!chatMessage.isRoll && !hasInlineRoll) || (!chatMessage.isContentVisible && !game.settings.get("dice-so-nice", "showGhostDice")) ||
        (game.view != "stream" && (!game.dice3d || game.dice3d.messageHookDisabled)) ||
        (chatMessage.getFlag("core", "RollTable") && !game.settings.get("dice-so-nice", "animateRollTable"))) {
        return;
    }

    let rolls = chatMessage.isRoll ? chatMessage.rolls : null;
    let maxRollOrder = rolls ? 0 : -1;
    if (hasInlineRoll) {
        let JqInlineRolls = $($.parseHTML(`<div>${chatMessage.content}</div>`)).find(".inline-roll.inline-result:not(.inline-dsn-hidden)");
        if (JqInlineRolls.length == 0 && !chatMessage.isRoll) //it was a false positive
            return;
        let inlineRollList = [];
        JqInlineRolls.each((index, el) => {
            //We use the Roll class registered in the CONFIG constant in case the system overwrites it (eg: HeXXen)
            let roll = CONFIG.Dice.rolls[0].fromJSON(unescape(el.dataset.roll));
            maxRollOrder++;
            roll.dice.forEach(diceterm => {
                if (!diceterm.options.hasOwnProperty("rollOrder"))
                    diceterm.options.rollOrder = maxRollOrder;
            });
            inlineRollList.push(roll);
        });
        if (inlineRollList.length) {
            if (chatMessage.isRoll)
                inlineRollList = [...chatMessage.rolls, ...inlineRollList];

            let pool = PoolTerm.fromRolls(inlineRollList);
            //We use the Roll class registered in the CONFIG constant in case the system overwrites it (eg: HeXXen)
            rolls = [CONFIG.Dice.rolls[0].fromTerms([pool])];
        }
        else if (!chatMessage.isRoll)
            return;
    }

    //Because Better Roll 5e sends an empty roll object sometime
    if (!rolls.length || !rolls[0].dice.length)
        return;

    const isInitiativeRoll = chatMessage.getFlag("core", "initiativeRoll");
    if (isInitiativeRoll && game.settings.get("dice-so-nice", "disabledForInitiative"))
        return;

    //Remove the chatmessage sound if it is the core dice sound.
    if (Dice3D.CONFIG().enabled && chatMessage.sound == "sounds/dice.wav") {
        mergeObject(chatMessage, { "-=sound": null }, { performDeletions: true });
    }
    chatMessage._dice3danimating = true;

    game.dice3d.renderRolls(chatMessage, rolls);
});

/**
 * Hide messages which are animating rolls.
 */
Hooks.on("renderChatMessage", (message, html, data) => {
    console.log(message, html, data); 
    return;

    if (game.dice3d && game.dice3d.messageHookDisabled) {
        return;
    }
    if (message._dice3danimating && !game.settings.get("dice-so-nice", "immediatelyDisplayChatMessages")) {

        if (message._countNewRolls)
            html.find(`.dice-roll:nth-last-child(-n+${message._countNewRolls})`).hide();
        else
            html.hide();
    }
});

/**
 * Save the number of new rolls in the message before it is updated.
 */
Hooks.on("preUpdateChatMessage", (message, updateData, options) => {
    console.log(message, updateData, options);
    return;
    if (!("rolls" in updateData)) return;
    // We test against the source data in case the system/macro/module has modified the scoped message variable
    options.dsnCountAddedRoll = updateData.rolls.length - message.toObject().rolls.length;
});

/**
 * Hide and roll new rolls added in a chat message in a update
 */
Hooks.on("updateChatMessage", (message, updateData, options) => {
    console.log(message, updateData, options);
    return;

    //Todo: refactor this check into a function
    if (!message.rolls || !message.isRoll || (!message.isContentVisible && !game.settings.get("dice-so-nice", "showGhostDice")) ||
        (game.view != "stream" && (!game.dice3d || game.dice3d.messageHookDisabled)) ||
        (message.getFlag("core", "RollTable") && !game.settings.get("dice-so-nice", "animateRollTable"))) {
        return;
    }
    if (options.dsnCountAddedRoll > 0) {
        message._dice3danimating = true;
        message._countNewRolls = options.dsnCountAddedRoll;
        game.dice3d.renderRolls(message, message.rolls.slice(-options.dsnCountAddedRoll));
    }
});
