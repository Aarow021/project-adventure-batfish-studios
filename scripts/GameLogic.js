
// imports Reactor class for reactive values
import { Reactor } from './Reactor.js';
import { CanvasHandler } from './CanvasOverlay.js';
import { Consumable, Item } from './Item.js';
import { Character } from './Character.js';
import { Enemy, Team } from './Enemies.js';
import { generateRooms } from './RoomGenerator.js';
import { AudioObject } from './Audio.js';
// imports general use functions and sets their namespace to this window
import * as fnExports from './Functions.js';
Object.entries(fnExports).forEach(([name, exported]) => window[name] = exported);

let devMode = false;

export let player;
let textController; // makes text writing cancellable
let textControllerSignal;
let textCancelled = false;
export let game;
export let history;
let itemData = {};
let enemyData = {};
let teamData = {};
let lootTableData = {};
export let particleHandler;
let audioData = {};
let audioConfig = {volume: new Reactor(0)}
let userInteracted = false;
let firstRun = true;

const parsableStyles = [
    {name: 'reset', identifier: ''}, // parses for full style resets (removes all styles). Syntax is [:]
    {name: 'class', identifier: 'class'}, // example: [class:item-count], or [class:] to reset
    {name: 'color', identifier: 'c'}, // example: [c:#0011] for green, or [c:] to reset
    {name: 'fontFamily', identifier: 'ff'}, // example: [ff:'Courier New'], or [ff:] to reset
    {name: 'fontSize', identifier: 'fs'}, // example: [fs:32px], or [fs:] to reset
    {name: 'fontStyle', identifier: 'fst'},
    {name: 'rotate', identifier: 'rt'}, // example: [rt:180deg], or [rt:] to reset
    {name: 'textShadow', identifier: 'ts'}, // example: [ts:4px,4px,3px,yellow], or [ts:] to reset
    {name: 'animation', identifier: 'an'}, // example: [an:text-blur 1s ease], or [an:] to reset
    {name: 'filter', identifier: 'fi'}, // example: [fi:blur(6px)], or [fi:] to reset
    {name: 'scale', identifier: 'sc'}, // example: [sc:1.5], or [sc:] to reset
    {name: 'opacity', identifier: 'op'}, // example: [op:0.5], or [op:] to reset
    {name: 'backdrop-filter', identifier: 'bdfi'}, // example: [bdfi:blur(8px)], or [bdfi:] to reset
]  

// holds history data
class History {
    constructor() {
        this.choices = {run: [], past: []};
        this.storyLog = [];
        this.actionsLog = [];
        this._roomsVisited = {run: [], past: []}; // rooms visited on current run and all time
        this._endings = new Set();
        this.resets = 0;
        this.container = document.getElementById('history-content')
    }
    
    get endings() { return Array.from(this._endings) }
    
    addEnding(ending) {
        this._endings.add(ending);
    }

    addStory(story) {
        this.storyLog.push(story);
        let textLine = document.createElement('div');
        textLine.textContent = story;
        textLine.classList.add('story-history');
        this.container.appendChild(textLine);
        this.container.scrollTop = this.container.scrollHeight;

    }

    addAction(action) {
        this.actionsLog.push(action);
        let textLine = document.createElement('div');
        textLine.textContent = action;
        textLine.classList.add('action-history');
        this.container.appendChild(textLine);
        this.container.scrollTop = this.container.scrollHeight;

    }

    addRoom(room) {
        this._roomsVisited.run.push(room);
    }

    addChoice(choice) {
        this.choices.run.push(choice);
        let textLine = document.createElement('div');
        textLine.textContent = choice.text;
        textLine.classList.add('choice-history');
        this.container.appendChild(textLine);
        this.container.scrollTop = this.container.scrollHeight;

    }

    // resets run specific history
    softReset() {
        this.choices.past.push(...this.choices.run);
        this._roomsVisited.past.push(...this._roomsVisited.run);
        this.choices.run = [];
        this._roomsVisited.run = [];
        this.storyLog = [];
        this.actionsLog = [];
    }
    
}

// Holds game logic methods
class Game {
    constructor() {
        this.rooms = {};
        this.currentRoom = '';
        this.isGameLoop = true;
        this.currentEnding = 'unset';
        this.endings = {}; // holds the possible ending names and text
        this.leaveChoices = false; // choices get left if this is true
        this.startingRoom = 'b-start'; // [ 'Example Hub' ][ 'b-start' ]
        this.runNumber = -1;
        this.playerState = 'default'; // 'default', 'battle', 'exploring'
    }

    // Gives an item to the player's inventory
    getItem(data={}, customMessage='') {
        let messages = [];
        let item = parseItem(data)
        player.addItem(item);
        if (item.count > 1) {
            messages.push(customMessage || `Obtained [${item.style + item.name}[:]] X ${item.count}`);
        } else {
            messages.push(customMessage || `Obtained [${item.style + item.name}[:]]`);
        }
        return { messages };
    }

    // leaves the current choice block
    leaveChoice() {
        game.leaveChoices = true;
    }

    // changes the players health
    changeHP({min=0, max=0, cause='default', customMessage = ''}={}) {
        max = max || min;
        let amount = random(min, max + 1)
        let messages = [];
        player.changeHP(amount);
        if (player.hp <= 0) {
            game.currentEnding = game.endings[cause] ? cause : 'default death';
        }
        if (amount >= 0) {
            messages.push(customMessage || `[c:lime]HP +${amount}`);
        } else {
            messages.push(customMessage || `[c:red]HP -${-amount}`);
        }
        return { messages };
    }

    // changes the players max health
    changeMaxHP(min, max, customMessage = '') {
        max = max ?? min;
        let amount = random(min, max + 1)
        let messages = [];
        player.changeMaxHP(amount);
        if (amount >= 0) {
            messages.push(customMessage || `[c:lime]Max HP +${amount}`);
        } else {
            messages.push(customMessage || `[c:red]Max HP -${-amount}`);
        }
        return { messages };
    }

    // Removes an item from the player's inventory
    removeItem(item, count) {
        player.removeItem(item, count);
    }

    // changes the current room to a new room
    changeRoom(room) {
    if (!game.rooms[room]) {
        typeText('This room does not exist', {element: document.getElementById('action-output')});
        return;
    }
        history.addRoom(room);
        game.currentRoom = game.rooms[room];
    }

    // plays a sound from audioData
    playSound(soundName, volume, speed) {
        audioData[soundName].play(volume, speed);
    }

    // stops a sound from audioData
    stopSound(soundName) {
        audioData[soundName].stop();
    }

    // stops a sound from audioData
    async changeSong(newSong, pitch, transitionDuration=500) {
        if (audioData[newSong] === audioData.currentSong) return;
        for (const audio of Object.values(audioData)) {
            if (audioData.currentSong && (audio.name != audioData.currentSong.name && audio.name != newSong)) {
                audio.volumeMulti = 0;
            }
        }
        let newAudio = audioData[newSong]
        let stepCurrent;
        if (audioData.currentSong) {
            stepCurrent = audioData.currentSong.volumeMulti / transitionDuration;
        }
        let stepNew = 1 / transitionDuration;
        
        newAudio.play(0, pitch);
        for (let index = 0; index < transitionDuration; index++) {
            if (audioData.currentSong) {
                audioData.currentSong.volumeMulti -= stepCurrent;
                audioData.currentSong.update();
            }
            newAudio.volumeMulti += stepNew;
            newAudio.update()
            await sleep(1)
        }
        if (audioData.currentSong) {
            audioData.currentSong.volumeMulti = 0;
        }
        newAudio.volumeMulti = 1;
        audioData.currentSong = newAudio;
    }

    async changeSongPitch(pitch, transitionDuration=0) {
        if (transitionDuration) {
            let pitchDifference = audioData.currentSong.pitch - pitch;
            let step;
            step = pitchDifference / transitionDuration

            for (let index = 0; index < transitionDuration; index++) {
                audioData.currentSong.pitch -= step;
                audioData.currentSong.update();
                await sleep(1)
            }
        } else {
            audioData.currentSong.pitch = pitch;
            audioData.currentSong.update();
        }
    }

    // changes the background
    // ex: changeBG('escape.jpg');
    async changeBG(name, transition = {}, id='background-image') {
        transition.out = transition.out ?? '[an:fade-out .5s ease]';
        transition.in = transition.in ?? '[an:fade-in .5s ease]';
        transition.waitsOut = transition.waitsOut ?? false;
        transition.waitsIn = transition.waitsIn ?? false;
        clearDialogueText();
        const background = document.getElementById(id);
        if (transition.out && transition.waitsOut) {
            game.styleBG(transition.out)
            await awaitAnimation(background);
        } else if (transition.out && !transition.waitsOut) {
            game.styleBG(transition.out)
        }
        if (name) {
            background.src = `../imgs/backgrounds/${name}`;
        }
        if (transition.in && transition.waitsIn) {
            game.styleBG(transition.in)
            await awaitAnimation(background);
        } else if (transition.in && !transition.waitsIn) {
            game.styleBG(transition.in)
        }
    }

    // applies styles given by a string of style identifiers to the background
    styleBG(style, id='background-image') {
        applyStyle(document.getElementById(id), generateStyleList(style));
    }

    // changes the background particle animation
    changeParticleAnimation(animationName, strength, speed, transitionDuration) {
        particleHandler.changeAnimation(animationName, transitionDuration);
        if (strength) particleHandler.strength = strength;
        if (speed) particleHandler.speed = speed;
    }

    // changes the background particle speed
    changeParticleSpeed(speed) {
        particleHandler.speed += speed;
    }

    // changes the background particle strength
    changeParticleStrength(strength) {
        particleHandler.strength += strength;
    }

    // sets the background particle speed
    setParticleSpeed(speed) {
        particleHandler.speed = speed;
    }

    // sets the background particle strength
    setParticleStrength(strength) {
        particleHandler.strength = strength;
    }

    /** 
     * @typedef {Object} WriteTextConfig
     * @prop {String} options.elementID - The ID of the element to be written on
     * @prop {Boolean} options.clearsText - Whether the previous text should be overwritten
     * @param {StoryConfig & WriteTextConfig} options - Various configuration options 
    */

    // writes text
    async writeText(text, options) {
        let textObj = new StoryObject(text, options);
        let elementID = options.elementID ?? 'story';
        let clearsText = options.clearsText ?? false;
        if (clearsText) clearText(document.getElementById(elementID));
        await typeText(textObj.text,{element: document.getElementById(elementID), speed: textObj.speed, variance: textObj.variance, skippable: options.skippable, skipElement: document.getElementById('dialogue-box'), animation: textObj.animation, textControllerSignal, waits: textObj.waits, waitdelay: textObj.waitDelay});
    }

    // diplays a story part to the dialogue box
    async showStory(story) {
        if (story.usesLeft <= 0) return;
        if (!checkRequirements(story, 'show').metRequirements) return;
        const dialogueBox = document.getElementById('dialogue-box');
        const storyElement = document.getElementById('story');
        clearText(storyElement);
        await typeText(story.text, {element: storyElement, speed: story.speed, variance: story.variance, skippable: true, skipElement: dialogueBox, animation: story.animation, signal:textControllerSignal, waits: story.waits, waitDelay: story.waitDelay});
        const cleanText = parseStyles(story.text, 'This returns the clean text because nothing matches this.').text;
        history.addStory(cleanText);
        clearText(document.getElementById('action-output'));
        story.usesLeft -= 1;
    }
    

    // has a given chance to return true
    chanceRoll(chance) {
        return chance >= random(0, 100, 10);
    }

    // a chance to initiate combat
    async encounter(data={}, songSettings={name: 'battle_stereo', pitch: 1}) {
        let team = parseTeam(data)
        let currentSong = audioData.currentSong;
        
        let battle = new Battle(team);
        game.changeSong(songSettings.name, songSettings.pitch ?? 1);
        await battle.encounter(game.runNumber);
        game.changeSong(currentSong.name, currentSong.pitch);
    }

    // // a chance to initiate combat
    //  async randomEncounter(teamPool) {
    //     let battle = new Battle({enemies, rewards, groupName})
    //     await battle.encounter(runNumber);
    //     [
    //         {
    //             enemy: new Enemy('enemy 1', 10, 10, 10),
    //             weight: 10
    //         }, 
    //         {
    //             team: [
    //             new Enemy('enemy 1', 10, 10, 10),
    //             new Enemy('enemy 2', 10, 10, 10)
    //             ],
    //             weight: 10
    //         }
    //     ]
    // }

    // initiates an ending
    async ending(endType) {
        game.currentEnding = endType;
        game.currentEnding.createChoice('Restart')
            .addAction({ type: 'restart'});
        history.addEnding(endType);
        game.currentRoom = game.currentEnding;
        // clearDialogueText();
        // for (const item of game.currentEnding.queuelist) {
        //     if (item.type === 'story') {
        //         clearText(document.getElementById('story'));
        //         await game.showStory(item.value);
        //         clearText(document.getElementById('action-output'));
        //     } else if (item.type === 'choicelist') {
        //         let selectedChoices = [];
        //         while (getShownChoices(item.value, selectedChoices).length > 0) {
        //             showChoices(item.value, document.getElementById('choices'), selectedChoices);
        //             let selectedChoice = await tryChoices(document.getElementById('choices'));
        //             selectedChoices.push(selectedChoice);
        //             history.addChoice(selectedChoice);
        //             clearText(document.getElementById('action-output'))
        //             clearText(document.getElementById('choices'))
        //             if (selectedChoice.text === 'Restart') {
        //                 attemptActionsWithText(selectedChoice.actions);
        //             } else {
        //                 await attemptActionsWithText(selectedChoice.actions);
        //             }
        //         }
        //     } else if (item.type === 'actionlist') {
        //         await attemptActionsWithText(item.value);
        //     }
        // }
        // clearDialogueText();
        // await sleep(10);
    }

    // resets the player and game
    async restart() {
        game.isGameLoop = false;
        history.resets += 1;
        game.runNumber += 1;
        history.softReset();
        document.getElementById('history-content').innerHTML = '';
        await sleep(10);
        this.start();
    }

    // begins the game
    async start() {
        player = new Player();
        if (devMode) {
            game.getItem({name: 'Super Health Maximiser', min: 10});
            game.getItem({name: 'Super Strength Maximiser', min: 10});
            game.getItem({name: 'Super Agility Maximiser', min: 10});
        }
        game.changeParticleAnimation('none', 1, 1);
        generateRooms();
        game.currentRoom = game.rooms[game.startingRoom];
        document.getElementById('background-image').src = '../imgs/backgrounds/transparent.png';
        clearDialogueText();
        game.isGameLoop = true;
        if (userInteracted && !firstRun) {
            this.changeSong('main_stereo', 1);
        }
        firstRun = false;
        gameLoop();
    }

    // Returns whether the player has an item in their inventory
    hasItem(itemName, minCount = 1, customMessage = '') {
        for (const invItem of Object.values(player.inventory)) {
            if (invItem.name === itemName && invItem.count >= minCount)
                return true;
        }
        let itemStyle = itemData?.[itemName]?.style ?? '[c:var(--item-color)]';
        let message = customMessage || `You do not have [${itemStyle + itemName}[:]]`;
        return { result: false, message };
    }

    // returns whether a choice has been previously made
    madeChoice(choiceId) {
        return checkPropertyValues(history.choices.run, 'id', choiceId)
        || checkPropertyValues(history.choices.run, 'customID', choiceId);
    }

    // returns whether a choice has been made in a previous run
    madePastChoice(choiceId) {
        return checkPropertyValues(history.choices.past, 'id', choiceId)
            || checkPropertyValues(history.choices.past, 'customID', choiceId);
    }

    // returns whether the player has a stat within a given range [CASE SENSITIVE]
    hasStat(statName, minStat=0, maxStat=Infinity) {
        return player[statName] >= minStat && player[statName] <= maxStat }
}

// represents a battle
class Battle {
    /**
     * @typedef {Object} BattleConfig
     * @prop {Array} enemies - List of enemies in the battle
     * @prop {Array} rewards - List of rewards completing the battle gives
     * @prop {String} groupName - Name of the group of enemies
     * @prop {Boolean} useEnemyLoot - Whether the enemies add their loot table to the rewards
     * 
     * @param {BattleConfig} options - Config for the battle
     */
    constructor(options) {
        let defaults = {
            enemies: [], rewards: [], groupName: 'some enemies'
        }
        Object.assign(this, Object.assign(defaults, options));
        this.inputContainer = document.getElementById('battle-input');
        this.outputContainer = document.getElementById('story');
        this.advanceElement = document.getElementById('dialogue-box');
        this.textConfig = this.textConfig ?? {element: this.outputContainer, speed: 0, skipElement: this.advanceElement, skippable: true};
        this.enemies = this.enemies.map(enemy => enemy.clone());
        this.remainingEnemies = this.enemies.map(enemy => enemy.clone());
    }

    async encounter(currentRunNumber) {
        let selectedChoice;
        let menuChoices = [
            new Choice('Fight', {speed: -1}),
            new Choice('Item', {speed: -1}),
            new Choice('Inspect', {speed: -1}),
        ];
        
        // fight loop
        while (this.remainingEnemies.length > 0 && player.hp > 0) {
            clearDialogueText();
            typeText(`You have encountered ${this.groupName}`, {...this.textConfig});
            // shows options: Fight, Item, Inspect
            showChoices(menuChoices, this.inputContainer);
            selectedChoice = await tryChoices(this.inputContainer);
            selectedChoice = selectedChoice.text.toLowerCase();
            if (currentRunNumber != game.runNumber) return;

            // check what option is clicked, and run that function
            if (selectedChoice === 'fight') {
                let result = await this.selectEnemy('fight', 'Which enemy will you attack?');
                if (this.remainingEnemies.length === 0) break;
                if (result != 'cancelled') await this.enemyTurn();
            } else if (selectedChoice === 'inspect') {
                await this.selectEnemy('inspect', 'Which enemy will you inspect?');
            } else if (selectedChoice === 'item') {
                await this.selectItem();
            }
            if (currentRunNumber != game.runNumber) return;
        }

        // end of fight
        if (player.hp > 0) {
            // loot!
            this.getRewards();
            await awaitClick(this.advanceElement);
            clearDialogueText();
        }
    }

    // shows the items the player can use
    async selectItem() {
        clearDialogueText();
        typeText('What item would you like to use?', {...this.textConfig});
        let choices = [];
        choices.push(new Choice('Back', {speed: -1, value: 'previous', color: '[c:var(--back-color)]'}))
        for (const item of Object.values(player.inventory)) {
            if (item.type != 'consumable') continue;
            choices.push(new Choice(item.name, {speed: -1, value: item.name, color: 'var(--item-color)'}));
        }
        showChoices(choices, this.inputContainer);
        let selectedChoice = await tryChoices(this.inputContainer);
        if (selectedChoice.value === 'previous') return;
        let selectedItem = player.inventory[selectedChoice.value];
        if (!selectedItem) return;
        let result = selectedItem.use(player);
        clearDialogueText();
        for (const message of result) {
            typeText(message, {...this.textConfig});
        }
        await typeText('', {...this.textConfig, waits: true})
    }
    
    // shows the remaining enemies to select
    async selectEnemy(action, text='Which enemy?') {
        clearDialogueText();
        typeText(text, {...this.textConfig});
        let selectedEnemy;
        let choices = [];
        choices.push(new Choice('Back', {speed: -1, value: 'previous', color: '[c:var(--back-color)]'}))
        for (const enemy of this.remainingEnemies) {
            choices.push(new Choice(enemy.name, {speed: -1, value: enemy, color: 'orange'}));
        }
        showChoices(choices, this.inputContainer);
        let selectedChoice = await tryChoices(this.inputContainer);
        if (selectedChoice.value === 'previous') return 'cancelled';
        selectedEnemy = selectedChoice.value;

        if (action === 'fight') {
            await this.fightEnemy(selectedEnemy);
        } else if (action === 'inspect') {
            await this.inspectEnemy(selectedEnemy);
        }

        // dead enemy gets removed
        if (selectedEnemy.hp === 0) {
            this.remainingEnemies.splice(this.remainingEnemies.indexOf(selectedEnemy), 1);
            await typeText(`[c:var(--enemy-name)]${selectedEnemy.name}[:] has been defeated!`, {...this.textConfig, waits: true});
        }
    }

    // shows the remaining enemies to select
    async fightEnemy(enemy) {
        clearDialogueText();
        let baseAttack = player.getAttack();
        let attackMulti = await this.timedAttack(enemy);
        let finalAttack = Math.round(baseAttack * attackMulti);
        enemy.changeHP(-finalAttack)
        typeText(`You delt [class:health]♥${finalAttack}[:] damage to [c:var(--enemy-name)]${enemy.name}.`, {...this.textConfig});
        await typeText(`Remaining enemy health: [class:health]♥${enemy.hp}`, {...this.textConfig, waits: true});
    }

    async enemyTurn() {
        clearDialogueText();

        // select random enemy from alive enemies
        let enemy = this.remainingEnemies[random(0, this.remainingEnemies.length)];
        let baseAttack = enemy.getAttack();
        let defenceMulti = await this.timedDefense(enemy);
        let enemyAttack = Math.round(baseAttack / defenceMulti);
        game.changeHP({min: -enemyAttack, max: -enemyAttack, cause: 'slain by enemy'})
        typeText(`[c:var(--enemy-name)]${enemy.name}[:] delt [class:health]♥${enemyAttack}[:] damage.`, {...this.textConfig});
        await typeText(`Remaining health: [class:health]♥${player.hp}`, {...this.textConfig, waits: true});
    }

    // runs a timing minigame to get attack multi
    async timedAttack(enemy) {
        let agilityRatio = player.agility / enemy.agility;
        let speedMulti;
        if (player.agility < enemy.agility) {
            let speedLog = Math.log(1 / agilityRatio);
            speedMulti = clamp(1 + .5 * speedLog, 1, 100);
        } else {
            speedMulti = clamp((1 / agilityRatio) ** .3, .5, 1);
        }

        let offset = await this.timingGame(speedMulti, 'out');
        let multi = 2 - (offset * 4) ** .5;
        return multi;
    }

    // runs a timing minigame to get defense multi
    async timedDefense(enemy) {
        let agilityRatio = player.agility / enemy.agility;
        let speedMulti;
        if (player.agility < enemy.agility) {
            let speedLog = Math.log(1 / agilityRatio);
            speedMulti = clamp(1 + .5 * speedLog, 1, 100);
        } else {
            speedMulti = clamp((1 / agilityRatio) ** .3, .5, 1);
        }

        let offset = await this.timingGame(speedMulti, 'in');
        let multi = 2 - (offset * 1.4) ** .5;
        return multi;
    }

    // runs a timing minigame to get a multi
    async timingGame(speed, direction='out') {

        let keyframes;

        if (direction === 'out') {
            keyframes = [
                {scale: 0},
                {scale: 1.5}
            ]
        } else if (direction === 'in') {
            keyframes = [
                {scale: 2},
                {scale: 0.5}
            ]
        }

        let timing = {
            duration: 1000 / speed
        }

        let target = document.createElement('div');
        target.className = 'timing-target';
        this.advanceElement.appendChild(target);

        let indicator = document.createElement('div');
        indicator.className = 'timing-indicator';
        target.appendChild(indicator);

        if (direction === 'out') {
            indicator.classList.add('solid');
        } else {
            target.classList.add('solid');
        }

        await sleep(300);

        let animation = indicator.animate(keyframes, timing);

        await Promise.race([animation.finished, awaitEvent(this.advanceElement, 'click')]);
        
        let offset = Math.abs(1 - getComputedStyle(indicator).scale)
        indicator.style.scale = getComputedStyle(indicator).scale;
        animation.cancel();

        if (offset < 1) {
            game.playSound('hit_1', 1, random(speed ** .5 - .1, speed ** .5, 3));
            animation = this.advanceElement.animate([
                {translate: '-15px -5px'},
                {translate: '15px 5px'},
                {translate: '15px -5px'},
                {translate: '15px -5px'},
                {translate: '-15px -5px'}
            ], {
                duration: 70,
                iterations: 3
            })
            await animation.finished;
        }
        await sleep(200);
        target.remove();
        return offset;
    }

    // displays an enemies info
    async inspectEnemy(enemy) {
        clearDialogueText();
        typeText(`Name: [c:var(--enemy-name)]${enemy.name}`, {...this.textConfig});
        if (enemy.desc) typeText(`Description: [c:#eeeeee]${enemy.desc}`, {...this.textConfig});
        typeText(`[class:health]HP: ♥${enemy.hp} / ♥${enemy.maxHP}`, {...this.textConfig});
        typeText(`[class:strength]Strength: ${enemy.strength}`, {...this.textConfig});
        await typeText(`[class:agility]Agility: ${enemy.agility}`, {...this.textConfig, waits: true});
    }

    // calculates the battle rewards
    calculateRewards() {
        let rewards = {}
        this.rewardMin = this.rewardMin ?? 1;
        this.rewardMax = this.rewardMax ?? this.rewardMin;
        let rewardCount = random(this.rewardMin, this.rewardMax + 1);
        let generatedRewards = fnExports.weightedRandom(this.rewardPool,
            {unique: true, count: rewardCount});
        for (const reward of generatedRewards) {
            reward.min = reward.min ?? 1;
            reward.max = reward.max ?? reward.min;
            reward.count = random(reward.min, reward.max + 1);
            if (rewards[reward.name]) {
                rewards[reward.name].count += reward.count;
            } else {
                rewards[reward.name] = { name: reward.name, count: reward.count }
            }
        }

        if (this.useEnemyLoot) for (const enemy of this.enemies) {
            for (const itemData of enemy.lootTable) {
                itemData.max = itemData.max ?? itemData.min ?? 1
                itemData.count = random(itemData.min ?? 1, itemData.max)
                if (!game.chanceRoll(itemData.chance ?? 1)) continue;
                if (rewards[itemData.name]) {
                    rewards[itemData.name].count += itemData.count
                } else {
                    rewards[itemData.name] = { name: itemData.name, count: itemData.count }
                }
            }
        }
        rewards = fnExports.sortByPath(Object.values(rewards), ['name'])
        return rewards;
    }

    // gives the player rewards
    async getRewards() {
        clearDialogueText();
            typeText(`You have defeated ${this.groupName}`, {...this.textConfig});
            let rewards = this.calculateRewards();
            let rewardActions = []
            for (const reward of rewards) {
                rewardActions.push(new Action({type: 'getItem', parameters: [{name: reward.name, min: reward.count}], waits: false}))
            }
            await attemptActionsWithText(rewardActions);
    }
}

class Player extends Character {
    /**
     * @param {CharacterConfig} options 
     */
    constructor(options={}) {
        options.name = 'Player';
        super(options);
        this._inventory = new Reactor({});
        this._maxHP.bindQuery('#stat-maxHP', "var(--element-change-animation)");
        this._hp.bindQuery('#stat-hp', "var(--element-change-animation)");
        this._strength.bindQuery('#stat-strength', "var(--element-change-animation)");
        this._agility.bindQuery('#stat-agility', "var(--element-change-animation)");
        this._inventory.subscribe(() => this.refreshInventory(this));
        this.usedItems = new Set();
        this.selectedItem;
    }

    // returns the players inventory
    get inventory() {
        return this._inventory.value;
    }

    // sets the players inventory
    set inventory(newValue) {
        this._inventory.value = newValue;
    }

    // Adds an item to the players inventory
    addItem(item) {
        let newInv = this._inventory.value;
        if (!newInv[item.name]) {
            newInv[item.name] = item
        } else {
            newInv[item.name].count += item.count;
        }
        this._inventory.value = newInv;
    }

    // Adds an item to the players inventory
    removeItem(itemName, count = 1) {
        let newInv = this._inventory.value;
        if (!newInv[itemName]) {
            return
        }
        newInv[itemName].count -= count;
        if (newInv[itemName].count <= 0) delete newInv[itemName];
        this._inventory.value = newInv;
    }

    // refreshes the elements representing the player's inventory
    refreshInventory(player) {
        const inventory = document.getElementById('inventory');
        inventory.innerHTML = '';

        if (!player.inventory[player.selectedItem?.name]) {
            document.getElementById('item-description').innerHTML = '';
            document.getElementById('item-actions').innerHTML = '';
        }

         // TODO
        // if item is in inv but not in oldInv, add the element
        // if item is not in inv but is in oldInv, remove the element
        // find the element with the item name
        // for (const invItem of object) {
            
        // }

        // repopulates inventory gui
        for (const item of sortByPath(Object.values(player.inventory), ["name"])) {
            const itemElement = document.createElement('p');
            itemElement.className = 'item-container flex wrap';
            itemElement.itemName = item.name;
            const nameElement = document.createElement('output');
            nameElement.className = 'item-name';
            const formattedText = formatText(item.style + ' ' + item.name);
            formattedText.className = 'flex wrap';
            nameElement.appendChild(formattedText);
            const countElement = document.createElement('output');
            itemElement.appendChild(countElement);
            countElement.outerHTML = `[<output class="item-count">${item.count}</output>]`;
            itemElement.appendChild(nameElement);
            inventory.appendChild(itemElement);

            itemElement.addEventListener('click', (e)=> {
                this.selectItem(item)
            })
        }
    }

    // shows an item's description and available actions in the inventory
    selectItem(item) {
        this.selectedItem = item;
        let descriptionElement = document.getElementById('item-description');
        let actionsElement = document.getElementById('item-actions')

        descriptionElement.innerHTML = '';
        actionsElement.innerHTML = '';
        
        let formattedText = formatText(`${item.style + item.name}`);
        formattedText.className = 'flex wrap';
        formattedText.style.fontSize = '1.5rem';
        document.getElementById('item-description').appendChild(formattedText);

        formattedText = formatText(item.description);
        formattedText.className = 'flex wrap';
        document.getElementById('item-description').appendChild(formattedText);

        if (item.type === 'consumable') {
            let useButton = document.createElement('button');
            useButton.type = 'button';
            useButton.className = 'choice';
            useButton.textContent = 'Use';

            if (this.usedItems.has(item.name) || item.hideEffects === false) {
                for (const effect of item.getEffects()) {
                    let effectDesc = formatText(effect);
                    effectDesc.className = 'flex wrap';
                    descriptionElement.appendChild(effectDesc);
                }
            } else {
                let effectDesc = formatText(`[[c:yellow]Use to unlock effect description[:]]`);
                effectDesc.className = 'flex wrap';
                descriptionElement.appendChild(effectDesc);
            }

            actionsElement.appendChild(useButton);
            useButton.addEventListener(('click'), ()=> {
                item.use(this);
                if (item.count > 0) {
                    this.selectItem(item)
                } else {
                    descriptionElement.innerHTML = '';
                    actionsElement.innerHTML = '';
                    for (const effect of item.getEffects()) {
                        let effectDesc = formatText(effect);
                        effectDesc.className = 'flex wrap';
                        descriptionElement.appendChild(effectDesc);
                    }
                }
            })
        }
        
    }

}



/**
 * @typedef {Object} TextObjectConfig
 * @property {Number} speed - Delay in ms between each added character
 * @property {Number} variance - Random added delay between 0 and n
 * @property {String} animation - Animation for each character when getting added
 * @property {Boolean} skippable - Whether clicking the skip element can make it type faster
 * @property {Boolean} waits - Whether it awaits the user clicking it before continuing
 * @property {Number} waitDelay - How long it halts (ms) after it is finished writing before it continues
 */

// default text object for writing to the page
export class TextObject {

    /**
     * 
     * @param {String} text - The text that is displayed
     * @param {TextObjectConfig} options 
     */
    constructor(text, options={}) {
        let defaultParams = {
            text:'', speed:0, variance:0, animation:'none', skippable:false, waits:false, waitDelay:0
        }
        Object.assign(this, defaultParams, options);
        this.text = text ?? '';
        this.requirements = [];
    }

    /**
     * @param {RequirementConfig} options 
     */
    addRequirement(options) {
        this.requirements.push(new Requirement(options));
        return this;
    }
}

export class StoryObject extends TextObject {

    /**
     * @typedef {Object} StoryConfig_
     * @prop {Number} maxUses - The number of times this object can be used. Infinity for unlimited uses
     * @prop {Array} requirements - Array of requirements for the story to show
     * 
     * @typedef {TextObjectConfig & StoryConfig_} StoryConfig
     */

    /**
     * @param {String} text 
     * @param {StoryConfig} options 
     */
    constructor(text, options) {
        let defaults = {
            speed:20, variance:5, animation:'default', waits:true, waitDelay:0, skippable:true, maxUses:Infinity, requirements: []
        }

        super(text, Object.assign(defaults, options));
        this.maxUses = this.maxUses ?? maxUses;
        this.usesLeft = this.maxUses;
    }

    /**
     * @param {RequirementConfig} options 
     */
    addRequirement(options) {
        this.requirements.push(new Requirement(options));
        return this;
    }

    clone() {
        return new StoryObject(this.text, {speed:this.speed, variance:this.variance, animation:this.animation, waitDelay:this.waitDelay, skippable:this.skippable, maxUses: this.maxUses})
    }
}

export class Requirement {

    /**
     * 
     * @typedef {Object} RequirementConfig 
     * @prop {String} mode - The way in ehich the requirement affects the item. 'show', 'use
     * @prop {String} type - The name of the function to check if it returns true/false
     * @prop {Array} parameters - The arguments to pass into the function
     * @prop {Boolean} inverse - Reverses the result of the function. 
     * 
     * @param {RequirementConfig} options - Requirement options
     */

    constructor(options) {
        let defaults = {
            mode:'show', parameters:[], inverse:false
        }
        Object.assign(this, Object.assign(defaults, options));
    }

    clone() {
        return new Requirement({type:this.type, parameters:this.parameters, inverse:this.inverse});
    }
}

export class Action {

    /**
     * @typedef {Object} ActionConfig - Config options for the Action class
     * @prop {String} type - The name of the function within game object you want to run
     * @prop {Array} parameters - parameters for the function
     * @prop {Boolean} waits - Whether the function is awaited
     * @prop {Number} chance - (0-100) The chance for the function to be run
     * @prop {Number} maxUses - The nymber of times this action be run in a run
     * @prop {Number} delay - Ms delay before action is run
     * @prop {Number} skipsWait - Hard sets the action to not be awaited
     * @prop {Array} requirements - Array of requirements for the action to run
     * 
     * @param {ActionConfig} options
     */

    constructor(options) {
        let defaults = {
            type:'', parameters:[], waits:false, chance:100, maxUses:Infinity, delay: 0, requirements: []
        }
        
        Object.assign(this, Object.assign(defaults, options))
        this.usesLeft = this.maxUses;
    }

    /**
     * @param {RequirementConfig} options 
     */
    addRequirement(options) {
        options.mode = options.mode ?? 'use';
        this.requirements.push(new Requirement(options));
        return this;
    }

    clone() {
        return new Action({type:this.type, parameters:this.parameters, waits:this.waits, chance:this.chance, maxUses:this.maxUses})
    }
}

export class Choice extends TextObject {

    /**
     * @typedef {Object} ChoiceConfig_
     * @property {Number} maxUses - The max number of times this choice can be selected in a run
     * @property {Room} room - The room that this choice is a part of
     * @property {String} id - Auto generated id
     * @property {String} customID - Custom id for reference use
     * @property {*} value - idk I don't remember
     * @property {String} color - The color of the choice
     * @property {Array} classList - Classes for the choice element
     * @property {Boolean} persistant - Whether the choice can be selected multiple times per room entrance
     * @typedef {TextObjectConfig & ChoiceConfig_} ChoiceConfig
     */

    /**
     * 
     * @param {string} text - The text that shows up on the choice element
     * @param {ChoiceConfig} options - Various configuration options
     */

    constructor(text, options={}) {
        let defaultParams = {
            maxUses:Infinity, speed:4, variance:1, animation:'default', skippable:true, room:undefined, id:'', customID:'', value:'', color:'', classList:[], persistant:false, waits:true, waitDelay:0
        }
        let props = {}
        Object.assign(props, defaultParams, options);

        super(text, props, true, 0);
        this.usesLeft = this.maxUses;
        this.actions = [];
        this.requirements = [];
    }

    clone() {
        return new Choice(this.text, {speed:this.speed, variance:this.variance, animation:this.animation, waitDelay:this.waitDelay, skippable:this.skippable, maxUses: this.maxUses, customID: this.customID, value: this.value, color: this.color, classList: this.classList, persistant: this.persistant})
    }

    /**
     * @param {ActionConfig} options
     */
    addAction(options) {
        this.actions.push(new Action(options));
        return this; 
    }

    /**
    * @param {RequirementConfig} options 
    */
    addRequirement(options) {
        this.requirements.push(new Requirement(options));
        return this;
    }

    hide() {
        this.hidden = true;
    }

}

export class Room {
    constructor(name, bg) {
        this.name = name ?? '';
        this.bg = bg ?? {};
        this.bg.transition = this.bg.transition ?? { out: '[an:fade-out .5s ease]', in: '[an:fade-in .5s ease]', waitsOut: true, waitsIn: false }
        this.bg.transition.waitsOut = this.bg.transition.waitsOut ?? true;
        this.choices = [];
        this.storyParts = []; // gets displayed when entering a room
        this.actions = [];
        this.queuelist = []; // holds the order that everything in the room should happen
        if (this.bg) { this.addAction({ type: 'changeBG', parameters: [this.bg.name, this.bg.transition] }) }
    }

    // returns a copy of this room, optionally with its own name.
    clone(name) {
        name = name ?? this.name;
        let clonedRoom = new Room(name, this.bg);
        let firstAction = true;
        for (let queueItem of this.queuelist) {
            if (queueItem.type === 'choicelist') {
                for (let choice of queueItem.value) {
                    clonedRoom.createChoice(choice.clone());
                }
            } else if (queueItem.type === 'actionlist') {
                for (let action of queueItem.value) {
                    if (firstAction) {
                        firstAction = false;
                        continue;
                    };
                    clonedRoom.addAction(action.clone());
                }
            } else if (queueItem.type === 'story') {
                clonedRoom.addStory(queueItem.value.text, queueItem.value)
            }
        }
        // Object.assign(clonedRoom.queuelist, this.queuelist);
        // Object.assign(clonedRoom.choices, this.choices);
        // Object.assign(clonedRoom.actions, this.actions);
        // Object.assign(clonedRoom.storyParts, this.storyParts);
        return clonedRoom;
    }

    // adds a choice to the room
    addChoice(choice) {
        this.choices.push(choice);
        const lastInQueue = this.queuelist[this.queuelist.length - 1];
        if (lastInQueue && lastInQueue.type === 'choicelist') {
            lastInQueue.value.push(choice);
        } else {
            this.queuelist.push({ type: 'choicelist', value: [choice]});
        }
    }

    /**@param {ChoiceConfig} options - Various configuration options */

    // creates a choice and automatically adds it to the room
    createChoice(text, options={}) {
        const id = this.getChoiceId(this.choices.length + 1);
        options.room = this;
        options.id = id;
        const choice = new Choice(text, options);
        this.addChoice(choice);
        return choice;
    }

    // returns the id of a choice given the choice number
    getChoiceId(choiceNumber) {
        return `${this.name}-${choiceNumber}`;
    }

    // adds a story line to the room
    /**
     * @param {string} text 
     * @param {StoryConfig} options 
     */
    addStory(text, options) {
        let storyObject = new StoryObject(text, options);
        this.storyParts.push(storyObject);
        this.queuelist.push({ type: 'story', value: storyObject });
        return storyObject;
    }

    // adds an action for a room
    /**
    * @param {ActionConfig} options
    */
    addAction(options) {
        const action = new Action(options);
        this.actions.push(action);

        const lastInQueue = this.queuelist[this.queuelist.length - 1]
        if (lastInQueue && lastInQueue.type === 'actionlist') {
            lastInQueue.value.push(action)
        } else {
            this.queuelist.push({ type: 'actionlist', value: [action] });
        }
        return action;
    }

    // appends a queuelist to the rooms queuelist
    addQueuelist(queuelist, timing='end') {
        if (timing === 'start') {
            this.queuelist = [...queuelist, ...this.queuelist];
        } else if (timing = 'end') {
            this.queuelist = [...this.queuelist, ...queuelist];
        }
    }
}

// generates rooms in a grid pattern
export class RoomGrid {

    /**
     * 
     * @typedef {Object} DirectionMessages - The messages for what direction to move
     * @prop {String} east - The message for heading east
     * @prop {String} north - The message for heading north
     * @prop {String} south - The message for heading south
     * @prop {String} west - The message for heading west
     * 
     * @typedef {Object} RoomGridConfig
     * @prop {String} name 
     * @prop {Number} width 
     * @prop {Number} height 
     * @prop {Array} entrance 
     * @prop {Boolean} showCoordinates
     * @prop {DirectionMessages} directionMessages 
     * 
     * @param {RoomGridConfig} options
     */

    constructor(options) {
        let defaults = {
            name:'', width:3, height:3, entrance:[0,0], showCoordinates:true, directionMessages:{}
        }
        Object.assign(this, Object.assign(defaults, options));
        if (typeof this.showCoordinates != 'boolean') this.showCoordinates = showCoordinates;
        if (!this.directionMessages.east) this.directionMessages.east = 'Go East';
        if (!this.directionMessages.west) this.directionMessages.west = 'Go West';
        if (!this.directionMessages.south) this.directionMessages.south = 'Go South';
        if (!this.directionMessages.north) this.directionMessages.north = 'Go North';
        this.grid = [];
        this.emptyTemplate = new Room();
        this.startQueuelist = [];
        this.endQueuelist = [];
        this.randomRooms = [];
        this.filledRooms = {};
        this.unusedCoords = [];
        this.iterateGrid((x, y)=> {
            this.unusedCoords.push([x, y]);
        })
    }

    // iterates a function through each grid cell (x,y coord)
    iterateGrid(fn) {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                fn(x, y)
            }
        }
    }

    // generates a room(s) at a given coordinate or at random
    generateRoom(coords, bg, count=1) {
        let room;
        if (coords) {
            room = new Room(`${this.name}-${coords[0]}-${coords[1]}`, bg)
            this.filledRooms[coords[0] + '-' + coords[1]] = room;
            if (looseIndexOf(this.unusedCoords, coords) >= 0) {
                this.unusedCoords.splice(looseIndexOf(this.unusedCoords, coords), 1);
            }
        } else {
            room = new Room(``, bg)
            this.randomRooms.push({room, count})
        }
        return room;

    }

    // sets the template for empty rooms
    setDefaultRoom(room) {
        this.emptyTemplate = room;
    }

    // sets a queuelist that runs every time a room gets explored
    // one use is to set a leave condition by using actions that are not run unless certain conditions are met
    addQueuelist(timing, queuelist, requirements) {
        timing = timing ?? 'end'
        for (const queueItem of queuelist) {
            for (const requirement of requirements) {
                if (queueItem.type === 'story') {
                    queueItem.value.addRequirement(requirement);
                } else if (queueItem.type === 'actionlist') {
                    for (const action of queueItem.value) {
                        action.addRequirement(requirement);
                    }
                }
                else if (queueItem.type === 'choicelist') {
                    for (const choice of queueItem.value) {
                        choice.addRequirement(requirement);
                    }
                }
            }
        }

        if (timing === 'start') {
            this.startQueuelist.push(...queuelist)
        } else if (timing === 'end') {
            this.endQueuelist.push(...queuelist)
        }
    }

    generateDefaultRoom(coords) {
        let room = this.emptyTemplate.clone(`${this.name}-${coords[0]}-${coords[1]}`)
        return room;
    }

    // populates the grid with rooms
    populateGrid() {
        for (const rooms of this.randomRooms) {
            for (let i = 0; i < rooms.count; i++) {
                if (this.unusedCoords.length === 0) break;
                let room = rooms.room;
                let roomCoords = this.unusedCoords[random(0,this.unusedCoords.length - 1)];
                if (looseIndexOf(this.unusedCoords, roomCoords) >= 0) {
                    this.unusedCoords.splice(looseIndexOf(this.unusedCoords, roomCoords), 1);
                }
                if (roomCoords[0] === 0 && roomCoords[1] === 0) {
                    let test;
                }
                let newRoom = room.clone(`${this.name}-${roomCoords[0]}-${roomCoords[1]}`);
                this.filledRooms[roomCoords[0] + '-' + roomCoords[1]] = newRoom;
            }
            if (this.unusedCoords.length === 0) break;
        }

        for (let x = 0; x < this.width; x++) {
            this.grid.push([]);
        }

        this.iterateGrid((x, y)=> {
            // adds predefined room or generated room to the grid
            let room;
            if (this.filledRooms[`${x}-${y}`]) {
                room = this.filledRooms[`${x}-${y}`];
            } else {
                room = this.generateDefaultRoom([x, y]);
            }
            this.grid[x].push(room);
        })

    }

    // connects the rooms by adding direction choices and injects queues to rooms
    connectRooms() {
        this.iterateGrid((x, y)=> {
            let room = this.grid[x][y];
            if (this.startQueuelist.length > 0) room.addQueuelist(this.startQueuelist, 'start');
            if (this.endQueuelist.length > 0) room.addQueuelist(this.endQueuelist, 'end');

            if (this.showCoordinates) {
                room.addStory(`Coordinates: [[c:yellow]${x}[:], [c:yellow]${y}[:]]`, {waits: false, speed: -1});
            }

            // adds move choice if there is a room in the target spot
            if (this.grid?.[x-1]?.[y]) {
                let westRoom = this.grid[x-1][y];
                room.createChoice(this.directionMessages.west)
                    .addAction({type: 'changeRoom', parameters: [westRoom.name]});
            } else {
                room.createChoice(this.directionMessages.west, {classList: ['disabled']});
            }
            if (this.grid?.[x]?.[y-1]) {
                let northRoom = this.grid[x][y-1];
                room.createChoice(this.directionMessages.north)
                    .addAction({type: 'changeRoom', parameters: [northRoom.name]});
            } else {
                room.createChoice(this.directionMessages.north, {classList: ['disabled']});
            }
            if (this.grid?.[x]?.[y+1]) {
                let southRoom = this.grid[x][y+1];
                room.createChoice(this.directionMessages.south)
                    .addAction({type: 'changeRoom', parameters: [southRoom.name]});
            } else {
                room.createChoice(this.directionMessages.south, {classList: ['disabled']});
            }
            if (this.grid?.[x+1]?.[y]) {
                let eastRoom = this.grid[x+1][y];
                room.createChoice(this.directionMessages.east)
                    .addAction({type: 'changeRoom', parameters: [eastRoom.name]});
            } else {
                room.createChoice(this.directionMessages.east, {classList: ['disabled']});
            }
        })
    }

    // adds the rooms to the global rooms variable
    deployRooms() {
        this.iterateGrid((x, y)=> {
            let room = this.grid[x][y];
            game.rooms[room.name] = room;
        })

        game.rooms[`${this.name}-start`] = this.grid[this.entrance[0]][this.entrance[1]]
    }

    // generates the grid. DO NOT CALL MORE THAN ONCE
    generateGrid() {
        this.populateGrid();
        this.connectRooms();
        this.deployRooms();
    }
}

export class Ending extends Room {
    constructor(name, bg) {
        let defaultBG = { name: 'destruction.jpeg', transition: { out: '[an:fade-out .5s ease-out][op:0]', in: '[an:fade-in .3s ease-out][fi:grayscale(.6)][sc: 1.5]', waitsOut: true, waitsIn: true } }
        bg = bg ?? defaultBG;
        super(name, bg);
        if (bg === defaultBG) {
            this.addAction({type: 'changeSong', parameters: ['VBOminous', 1, 100], skipsWait: true});
            this.addAction({type: 'changeBG', parameters: ['transparent.png', {}, 'background-image-2']});
            this.addAction({type: 'styleBG', parameters: ['', 'background-image-2']});
            this.addAction({ type: 'styleBG', parameters: ['[an:shrink 30s ease-out][fi:grayscale(.6)]'] });
        }
    }
}

// parses an input for item data, returning an Item object
export function parseItem(data) {
    let count = 1;
        if (data.min) {
            let max = data.max ?? data.min
            count = random(data.min, max + 1);
        }
        let item;
        if (!(data.name in itemData)) {
            if (data instanceof Item) {
                item = data;
            } else {
                item = new Item({count, ...data});
            }
        } else if (itemData[data.name].type === 'generic') {
            item = new Item({count, ...itemData[data.name]});
        } else if (itemData[data.name].type === 'consumable') {
            item = new Consumable({count, ...itemData[data.name]});
        }
        return item;
}

// parses an input for enemy data, returning an Enemy object
export function parseEnemy(enemy) {
    let returnedEnemy;
    enemy.id = enemy.id ?? enemy.name;
    if (enemy instanceof Enemy) {
        returnedEnemy = enemy
    } else {
        if (enemy.overrides) {
            returnedEnemy = new Enemy({...enemyData[enemy.id], ...enemy.overrides, id: enemy.id})
        } else {
            returnedEnemy = new Enemy({...enemyData[enemy.id], id: enemy.id})
        }
    }
    return returnedEnemy;
}

// parses an input for team data, returning a Team object
export function parseTeam(data) {
    let returnedTeam;
    if (data instanceof Team) {
        returnedTeam = data
    } else if (teamData[data.id]) {
        if (data.overrides) {
            returnedTeam = new Team({...teamData[data.id], ...data.overrides})
        } else {
            returnedTeam = new Team(teamData[data.id])
        }
    } else {
        returnedTeam = new Team(data)
    }

    let parsedEnemies = []
    for (const enemy of returnedTeam.enemyPool) {
        parsedEnemies.push(parseEnemy(enemy))
    }
    returnedTeam.enemyPool = parsedEnemies;

    // adds enemies to team
    returnedTeam.generateEnemies();
    return returnedTeam;
}




// creates a queueList given a list of stories, actions, and choices
export function createQueuelist(itemList) {
    let queuelist = [];
    for (const item of itemList) {
        if (item.constructor.name === 'StoryObject') {
            queuelist.push({ type: 'story', value: item });
        } else if (item.constructor.name === 'Choice') {
            const lastInQueue = queuelist[queuelist.length - 1]
            if (lastInQueue && lastInQueue.type === 'choicelist') {
                lastInQueue.value.push(item.value)
            } else {
                queuelist.push({ type: 'choicelist', value: [item]});
            }
        } else if (item.constructor.name === 'Action') {
            const lastInQueue = queuelist[queuelist.length - 1]
            if (lastInQueue && lastInQueue.type === 'actionlist') {
                lastInQueue.value.push(item.value)
            } else {
                queuelist.push({ type: 'actionlist', value: [item] });
            }
        }
    }
    return queuelist;
}

// creates an element for a loading buffer
function createLoadingBuffer(elementID='loading-buffer', count = 8, duration = 2000, animatedNumber = 1, image = 'icons/x.svg', imageSize = 16, radius = 120, keyframes = null, timing = null) {
    keyframes = keyframes ?? [
        { transform: "translateY(0px)" },
        { transform: `translateY(${-imageSize / 2}px)`, offset: 1 / count },
    ];

    timing = timing ?? {
        easing: 'ease',
    };
    timing.duration = duration / animatedNumber;
    timing.iterations = Infinity

    let bufferContainer = document.createElement('div');
    bufferContainer.style.height = `${radius}px`;
    bufferContainer.style.width = `${radius}px`;
    bufferContainer.className = `buffer-container`;
    for (let i = 0; i < count; i++) {
        const imageElement = document.createElement('span');
        imageElement.style.width = `${imageSize}px`;
        imageElement.style.backgroundImage = `url(../imgs/${image})`;
        imageElement.className = `buffer-img`;
        imageElement.style.rotate = `${360 / count * i}deg`;
        bufferContainer.appendChild(imageElement);
        timing.delay = duration / count * i / 1;
            let animation = imageElement.animate(keyframes, timing);
            animation.startTime = -duration;
    }
    let bufferWrapper = document.createElement('div');
    bufferWrapper.className = 'bufferWrapper';
    bufferWrapper.style.height = `${radius}px`;
    bufferWrapper.style.width = `${radius}px`;
    bufferWrapper.appendChild(bufferContainer);
    document.getElementById(elementID).appendChild(bufferWrapper)
}

// creates a room and adds it to rooms
export function createRoom(name, bg) {
    const newRoom = new Room(name, bg);
    game.rooms[newRoom.name] = newRoom;
    return newRoom;
}

// creates an ending and adds it to endings
export function createEnding(name, bg) {
    const newEnding = new Ending(name, bg);
    game.endings[newEnding.name] = newEnding;
    return newEnding;
}

// parses a string for style identifiers, returning clean text and a dictionary of location + identifier values
function parseStyles(text, identifier) {
    if (!text) return {text: '', data: []}
    let maxIterations = 10000000;
    let iterations = 0;
    let data = [];
    let cleanText = text;
    let specialMatches = [...text.matchAll(new RegExp(String.raw`(\[)(?!\[)(?!${identifier}:)([^:^\]]*:)([^\]]*)(\])`, 'g'))];
    for (const match of specialMatches.reverse()) {
        let index = match.index;
        cleanText = cleanText.substring(0, index) + cleanText.substring(index + match[0].length)
    }
    while (cleanText.includes(`[${identifier}:`) && iterations < maxIterations) {
        iterations++;
        let match = cleanText.match(new RegExp(String.raw`(\[)(?=${identifier || ':'})(${identifier}:)([^\]]*)(\])`));
        if (!match) continue;
        let index = match.index;
        let value = match[3];
        data.push({ index, value });
        cleanText = cleanText.substring(0, index) + cleanText.substring(index + match[0].length);
    }
    return { text: cleanText, data }
}

function generateStyleList(string) {
    let styleList = JSON.parse(JSON.stringify(parsableStyles));
    for (const style of styleList) {
        let parsedData = parseStyles(string, style.identifier);
        style.data = parsedData.data;
        style.dataIndex = 0;
        style.currentValue = style.currentValue ?? '';
    }
    return styleList;
}

// applies a parsed styleList to an element
function applyStyle(element, styleList, characterIndex) {
    for (const style of styleList) {
        if (style.data[0] && (characterIndex === undefined || characterIndex === style.data[style.dataIndex]?.index)) {
            style.currentValue = style.data[style.dataIndex].value;
            style.dataIndex += 1;
            if (style.name === 'reset') {
                for (const style of styleList) {
                    style.currentValue = '';
                }
            }
        }
        if (style.name === 'class' && style.currentValue) {
            element.className += ' ' + style.currentValue
        } else {
            element.style[style.name] = style.currentValue;
        }
    }
}

// returns an element with color formatted text
function formatText(text) {
    //to add a style, just put a valid css style in the name and add an identifier
    let textStyles = generateStyleList(text);

    let cleanText = parseStyles(text, 'This returns the clean text because nothing matches this.').text;
    let characterIndex = 0;
    let formattedElement = document.createElement('span');
    let wordArray = cleanText.split(' ')
    for (let i = 0; i < wordArray.length; i++) {
        let word = wordArray[i];
        let wordSpan = document.createElement('span')
        wordSpan.className = 'transition-word';
        formattedElement.appendChild(wordSpan)
        for (let char of word) {
            let charSpan = document.createElement('span');
            charSpan.textContent = char;
            charSpan.className = `transition-character`;
            applyStyle(charSpan, textStyles, characterIndex);
            wordSpan.appendChild(charSpan);
            characterIndex++;
        }
        let space = document.createElement('span');
        space.textContent = ' ';
        space.className = `transition-character`;
        applyStyle(space, textStyles, characterIndex);
        if (i != wordArray.length - 1) {
            wordSpan.appendChild(space);
            characterIndex++;
        }
    }
    return formattedElement;
}

// clears the text in an element
function clearText(element) {
    element.innerHTML = '';
}

// clears the text in all of the dialogue elements
function clearDialogueText() {
    clearText(document.getElementById('story'));
    clearText(document.getElementById('action-output'));
    clearText(document.getElementById('choices'));
    clearText(document.getElementById('battle-input'));
}

/**
 * 
 * @typeDef {typeTextConfig} options 
 * @prop {Object} element 
 * @prop {number} speed 
 * @prop {number} variance 
 * @prop {boolean} skippable 
 * @prop {Object} skipElement 
 * @prop {String} animation 
 * @prop {Boolean} waits 
 * @prop {Number} waitDelay  
 * @prop {*} signal - idk man. It somehow makes the text work
 */

/**
 * 
 * @param {String} text 
 * @param {typeTextConfig} options 
 */

// types out text (can be skipped by clicking on element)
async function typeText(text, {element, speed = 10, variance = 0, skippable = true, skipElement = null, animation = 'none', signal = textControllerSignal, waits = false, waitDelay = 0}={}) {
    skipElement = skipElement ?? document.getElementById('dialogue-box');

    let skipped = false;

    if (devMode) waitDelay = 0;

    let skipFunction = () => {
        speed = 0;
        variance = 0;
        textController?.abort();
        textController = new AbortController();
        textControllerSignal = textController.signal;
        skipElement.addEventListener('click', hardSkipFunction, { once: true });
    }
    let hardSkipFunction = () => {
        skipped = true;
    }
    if (skippable) {
        skipElement = skipElement ?? element; // the element the user clicks on to trigger skip
        skipElement.addEventListener('click', skipFunction, { once: true });
    }

    let textLine = document.createElement('span');
    textLine.className = 'text-line';
    element.appendChild(textLine);
    let formattedElement = formatText(text);
    for (const word of formattedElement.children) {
        let wordSpan = word.cloneNode(false);
        textLine.appendChild(wordSpan)
        for (const char of word.children) {
            if (skipped || textCancelled) break;
            let newChar = char.cloneNode(true);
            newChar.classList.add(animation);
            wordSpan.appendChild(newChar);
            if (speed >= 0) {
                try {
                    await cancelableSleep(speed + random(0, variance), signal);
                } catch (error) {
                    let test = null;
                }
            }
        }
    }

    skipElement.removeEventListener('click', skipFunction);
    skipElement.removeEventListener('click', hardSkipFunction);

    if (textCancelled) {
        return
    }

    if (skipped && !textCancelled) {
        textLine.innerHTML = '';
        for (const word of formattedElement.children) {
            textLine.appendChild(word.cloneNode(true));
        }
    }


    if (waits && waitDelay) {
        await Promise.race([awaitClick(skipElement), sleep(waitDelay)])
    } else if (waits && !waitDelay) {
        await awaitClick(skipElement);
    } else if (!waits && waitDelay) {
        await sleep(waitDelay);
    }
}

// returns the choices that are displayed
function getShownChoices(choices, selectedChoices) {
    let shownChoices = []
    for (const choice of choices) {
        if (choice.hidden) continue;
        if (!checkRequirements(choice, 'show').metRequirements) continue;
        if (choice.usesLeft <= 0) continue;
        if (!choice.persistant && selectedChoices.indexOf(choice) != -1) continue;
        shownChoices.push(choice);
    }
    return shownChoices;
}

// diplays each choice to the dialogue box
async function showChoices(choices, container, selectedChoices=[]) {
    const dialogueBox = document.getElementById('dialogue-box');
    const choiceContainer = container ?? document.getElementById('choices');
    let choiceElements = [];
    let choiceTexts = [];

    let shownChoices = getShownChoices(choices, selectedChoices);

    for (let i = 0; i < shownChoices.length; i++) {
        const choice = shownChoices[i];
        let choiceElement = document.createElement('button');
        choiceElement.className = 'choice';
        for (const className of choice.classList) {
            choiceElement.classList.add(className);
        }
        choiceElement.style.color = choice.color;
        choiceElement.id = `choice-${i}`;
        choiceElement.object = choice;
        choiceContainer.appendChild(choiceElement);
        choiceElements.push(choiceElement);
        choiceTexts.push(choice.text);
        typeText(choice.text,{element: choiceElement, speed:choice.speed, variance:choice.variance, skippable:choice.skippable, dialogueBox, animation: choice.animation, textControllerSignal});
    }
}

// returns weather all the requirments are met to do something
function checkRequirements(object, mode = 'use') {
    let metRequirements = true;
    let messages = [];
    let result;
    for (const requirement of object.requirements) {
        if (requirement.mode != mode) continue;
        if (typeof game[requirement.type] === 'function') {
            result = game[requirement.type](...requirement.parameters)
        } else if (typeof window[requirement.type] === 'function') {
            result = window?.[requirement.type](...requirement.parameters);
        } else if (typeof requirement.type === 'function') {
            result = requirement.type(...requirement.parameters);
        }
        if (typeof result != "object") {
            result = { result };
        }
        if (requirement.inverse) {
            result.result = !result.result;
        }
        metRequirements = result.result && metRequirements;
        if (result.message) {
            messages.push(result.message)
        }
    }
    return { metRequirements, messages };
}

// cancels the writing of text in the dialogue box
async function cancelText() {
    textCancelled = true;
    textController?.abort();
    textController = new AbortController();
    textControllerSignal = textController.signal;
    await sleep(1);
    textCancelled = false;
}

// waits for user to pick a choice
async function selectChoice(choiceContainer) {
    let selectedChoice;
    let clickableChoices = []
    for (const choiceElement of choiceContainer.children) {
        if (choiceElement.classList.contains('disabled')) continue;
        clickableChoices.push(choiceElement);
        choiceElement.addEventListener('click', () => { selectedChoice = choiceElement.object })
    }
    await awaitClickList(clickableChoices);
    return selectedChoice;
}

// tries to run an action
async function attemptAction(action) {
    if (action.usesLeft <= 0) return 'failedAction';
    if (!game.chanceRoll(action.chance)) return 'failedAction';
    if (!checkRequirements(action, 'use').metRequirements) return 'failedAction';
    action.usesLeft -= 1;
    if (action.delay) await sleep(action.delay)
    if (action.waits) {

        // if the function is within the game object, or is a global function
        if (typeof game[action.type] === 'function') {
            return await game[action.type](...action.parameters);
        } else if (typeof window[action.type] === 'function') {
            return await window?.[action.type](...action.parameters);
        } else if (typeof action.type === 'function') {
            return await action.type(...action.parameters);
        }
    } else {

        // if the function is within the game object, or is a global function
        if (typeof game[action.type] === 'function') {
            return game[action.type](...action.parameters);
        } else if (typeof window[action.type] === 'function') {
            return window?.[action.type](...action.parameters);
        } else if (typeof action.type === 'function') {
            return action.type(...action.parameters);
        }
    }
}

// tries to run a list of actions or an action
async function attemptActionsWithText(actions, exitCondition=()=>false) {
    let currentRunNumber = game.runNumber;
    if (Object.prototype.toString.call(actions) != '[object Array]') actions = [actions];
    for (const action of actions) {
        if (exitCondition()) return;
        if (currentRunNumber != game.runNumber) return;
        let actionResult;
        if ((!action.delay || action.waits) && !action.skipsWait) {
            actionResult = await attemptAction(action);
        } else {
            actionResult = attemptAction(action);
        }
        if (actionResult === 'failedAction') continue;
        if (actionResult && actionResult?.messages) {
            for (const message of actionResult.messages) {
                typeText(message, {element: document.getElementById('action-output')});
                const cleanText = parseStyles(message, 'This returns the clean text because nothing matches this.').text;
                history.addAction(cleanText);
            }
        }
        if (action.waits && actionResult && action.type != 'encounter' && action.type != 'randomEncounter') {
            await awaitClick(document.getElementById('dialogue-box'));
        }
        if (exitCondition()) return;
    }
}

// loops until a choice is selected that has all requirements met
async function tryChoices(choiceContainer, selectedChoices) {
    let selectedChoice;
    let metReqirements = false;
    while (!metReqirements) {
        selectedChoice = await selectChoice(choiceContainer);
        await cancelText();
        clearText(document.getElementById('action-output'));
        let requirementsResult = checkRequirements(selectedChoice, 'use');
        metReqirements = requirementsResult.metRequirements;
        for (const message of requirementsResult.messages) {
            typeText(message, {element: document.getElementById('action-output')});
            const cleanText = parseStyles(message, 'This returns the clean text because nothing matches this.').text;
            history.addAction(cleanText)
        }
    }
    const cleanText = parseStyles(selectedChoice.text, 'This returns the clean text because nothing matches this.').text;
    history.addChoice(selectedChoice)
    selectedChoice.usesLeft -= 1;
    return selectedChoice;
}

// repeats every room
async function gameLoop() {
    game.currentRoom = game.rooms[game.startingRoom];
    let currentRunNumber = game.runNumber;
    const choiceContainer = document.getElementById('choices');
    while (game.isGameLoop) {
        let thisRoom = game.currentRoom;
        for (const item of game.currentRoom.queuelist) {
            let actionlist = [];
            if (currentRunNumber != game.runNumber) return;
            if (player.hp <= 0) {
                game.ending(game.currentEnding);
                return;
            }
            if (item.type === 'story') {
                actionlist.push(new Action({type: 'showStory', parameters: [item.value], requirements: item.value.requirements, waits: item.value.waits}))
            } else if (item.type === 'choicelist') {
                let selectedChoices = [];
                game.leaveChoices = false;
                while (game.isGameLoop && getShownChoices(item.value, selectedChoices).length > 0 && thisRoom === game.currentRoom && !game.leaveChoices) {
                    game.leaveChoices = false;
                    if (player.hp <= 0) {
                        game.ending(game.currentEnding);
                        return;
                    }
                    showChoices(item.value, choiceContainer, selectedChoices);
                    let selectedChoice = await tryChoices(choiceContainer);
                    selectedChoices.push(selectedChoice);
                    clearText(document.getElementById('action-output'))
                    clearText(document.getElementById('choices'))
                    await attemptActionsWithText(selectedChoice.actions, ()=> {
                if (thisRoom != game.currentRoom || !game.isGameLoop) return true;
                if (player.hp <= 0) {
                    game.ending(game.currentEnding?.name);
                    return true;
                }
            })
                }
            } else if (item.type === 'actionlist') {
                actionlist.push(...item.value);
            }
            await attemptActionsWithText(actionlist, ()=> {
                if (thisRoom != game.currentRoom || !game.isGameLoop) return true;
                if (player.hp <= 0) {
                    game.ending(game.currentEnding);
                    return true;
                }
            })
        }
        if (currentRunNumber != game.runNumber) return;
        else if (thisRoom === game.currentRoom) {
            await game.showStory(new StoryObject('You have hit a dead end. Please add an ending or a way to change rooms here.', { waits: true, waitDelay: 30000 }));
        }
    }
}


// initializes the event listeners in on the page
function createEventListeners() {

    // x button for center menu
    document.getElementById('menu-toggle').addEventListener('click', e => {
        document.getElementById('center-menu').classList.add('hidden');
        document.getElementById('dark-overlay').classList.add('hidden');
    })

    document.querySelectorAll('#main-nav button').forEach(button => {
        const toggledElement = document.getElementById(button.id.substring(0, button.id.indexOf('-toggle')));
        const menu = document.getElementById('center-menu');
        const overlay = document.getElementById('dark-overlay');
        button.addEventListener('click', () => {
            if (toggledElement.style.display != 'none' && !menu.classList.contains('hidden')) {
                menu.classList.add('hidden');
                overlay.classList.add('hidden');
            } else {
                menu.classList.remove('hidden');
                overlay.classList.remove('hidden');
            }
            setVisibleElement(toggledElement, document.querySelector('#center-menu .menu-content').children);
        });
    })

    document.getElementById('enter-example-rooms').addEventListener('click', ()=> {
        game.startingRoom = 'Example Hub';
        game.restart();
        document.getElementById('menu-toggle').click();
    })

    // mute button
    document.getElementById('volume-button').addEventListener('click', (e)=> {
        let btn = e.target;
        document.getElementById('volume-slider').classList.toggle('hidden')
    })

    // audio slider
    document.getElementById('volume-slider').addEventListener('input', (e)=> {
        let slider = e.target;
        audioConfig.volume.value = slider.value;
        if (audioConfig.volume.value > 0) {
            document.getElementById('volume-button').classList.remove('muted')
        } else {
            document.getElementById('volume-button').classList.add('muted')
        }
    })

    // plays audio on first user interaction
    window.addEventListener('click', ()=> {
        userInteracted = true;
        game.changeSong('main_stereo', 1, 0);
    }, {once: true})

    // gives button press sound to buttons
    window.addEventListener('click', (e)=>{
        if (e.target.tagName != 'BUTTON') return;
        game.playSound('button_2', 1, random(.95, 1.05, 3));
    })
}

// creates multi-layer buffers
function multiBuffer(elementID=undefined, iterations=1,count = 8, duration = 2000, animatedNumber = 1, image = './icons/circle_white.png', imageSize = 16, radius = 120, keyframes = null, modifiers = null) {

    for (let i = 0; i < iterations; i++) {
        let newKeyframes = JSON.parse(JSON.stringify(keyframes));
        for (let j = 0; j < newKeyframes.length; j++) {
            const keyframe = newKeyframes[j];
            const mods = modifiers[j];
            for (const modKey of Object.keys(mods)) {
                keyframe[modKey] = mods[modKey](keyframe[modKey], i)
            }
        }
        createLoadingBuffer(elementID, count, duration, animatedNumber, image, imageSize, radius, newKeyframes);
    }
}

// loads the loading buffers
function loadBuffers() {
    multiBuffer('loading-buffer', 1, 10, 3000, 1, undefined, 30, 228, [
        { opacity: 1},
        { opacity: 0, offset: 1 },
    ], [{},{}]);
    // multiBuffer('loading-buffer', 1, 128, 50000, 64, 'backgrounds/destruction.jpeg', 20, 128, [
    //     { opacity: 1, scale: 1, filter: 'invert(0)' },
    //     { opacity: 0, scale: .5, offset: 1, filter: 'invert(0)' },
    // ], [{},{scale: (base, index)=>base + index*1 * (1 + index % 2 * -2)}]);
    // multiBuffer('loading-buffer', 1, 128, 20000, 32, 'icons/x.svg', 20, 128, [
    //     { opacity: 1, scale: 1, filter: 'invert(0)' },
    //     { opacity: 0, scale: .5, offset: 1, filter: 'invert(0)' },
    // ], [{},{scale: (base, index)=>base + index*1 * (1 + index % 2 * -2)}]);
    multiBuffer('loading-buffer', 4, 10, 3000, 3, undefined, 10, 60, [
        { opacity: 1, scale: 1, filter: 'invert(1)' },
        { opacity: 0, scale: .5, offset: 1, filter: 'invert(0)' },
    ], [{},{scale: (base, index)=>base + index*1 * (1 + index % 2 * -2)}]);
}

async function clearBuffers() {
    document.getElementById('loading-screen').classList.add('hidden');
    await fnExports.awaitEvent(document.getElementById('loading-screen'), 'transitionend');
    document.getElementById('loading-buffer').innerHTML = '';
}

// loads and categorizes audio
function loadAudio() {
    audioConfig.volume.subscribe(()=> {
        for (const audio of Object.values(audioData)) {
            audio.update();
        }
    })
    let defaultPath = '../audio/';
    let audios = [
        {name: 'battle_stereo', baseVolume: .8, type: 'bgm'},
        {name: 'explore_stereo', baseVolume: .8, type: 'bgm'},
        {name: 'main_stereo', baseVolume: .8, type: 'bgm'},
        {name: 'VBOminous', baseVolume: .8, type: 'bgm'},
        {name: 'button_1', baseVolume: 1},
        {name: 'button_2', baseVolume: .2},
        {name: 'hit_1', baseVolume: .6},
    ]
    for (const audio of audios) {
        audio.suffix = audio.suffix ?? 'mp3';
        audioData[audio.name] = new AudioObject(audio.name, new Audio(defaultPath + audio.name + '.' + audio.suffix), audio.type, audio.baseVolume, audio.loops, audioConfig)
    }
}

// loads the item/enemy data and preloads images
async function loadData() {
    let itemPaths = [
        '../data/items/misc_items.json',
        '../data/items/consumables.json',
        '../data/items/quest_items.json'
    ]
    let enemyPaths = [
        '../data/enemies/example_enemies.json',
        '../data/enemies/enemies.json'
    ]
    let teamPaths = [
        '../data/teams/example_teams.json',
    ]
    let lootTablePaths = [
        '../data/loot_tables/example_loot_tables.json',
    ]
    for (const itemPath of itemPaths) {
        Object.assign(itemData, await fnExports.parseJSON(itemPath));
    }
    for (const enemyPath of enemyPaths) {
        Object.assign(enemyData, await fnExports.parseJSON(enemyPath));
    }
    for (const teamPath of teamPaths) {
        Object.assign(teamData, await fnExports.parseJSON(teamPath));
    }
    for (const lootTablePath of lootTablePaths) {
        Object.assign(lootTableData, await fnExports.parseJSON(lootTablePath));
    }
    
    loadAudio();
    preloadImages();
}

// initializes the rooms and player
export async function init() {
    loadBuffers();
    particleHandler = new CanvasHandler(document.getElementById('particle-canvas'), undefined, 1, 1)
    history = new History();
    game = new Game();
    await loadData();
    createEventListeners();
    generateRooms();
    if (!devMode) await sleep(1300);
    game.start();
    clearBuffers();
}

// preloads images
function preloadImages() {
    preloadImage('../imgs/backgrounds/destruction.jpeg');
    preloadImage('../imgs/backgrounds/escape.jpeg');
    preloadImage('../imgs/backgrounds/neutral.jpeg');
    preloadImage('../imgs/backgrounds/savior.jpeg');
}

function preloadImage(src) {
    let img = new Image();
    img.src = src;
}

