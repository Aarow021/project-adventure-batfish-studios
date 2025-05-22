
import {game, createRoom, RoomGrid, Room, createQueuelist, StoryObject, Requirement, Choice, Action } from '../../scripts/GameLogic.js';
import { Enemy } from '../../scripts/Enemies.js';
export let roomGenerators = [generate];

function generate() {
    let room = createRoom('e-start', {name: 'escape.jpeg'});
    room.addAction({type: 'changeParticleAnimation', parameters: ['ashes', 2, 2]});
    room.addAction({type: 'changeBG', parameters: ['transparent.png', {}, 'background-image-2']})
    room.addAction({type: 'styleBG', parameters: ['', 'background-image-2']});
    room.addStory(`Heading to the [c:var(--escape)]left, [c:]you don't seem to recognize much of the place. It's completely trashed.`);
    room.addStory(`Everything here has been ransacked. Any cabinets that used to be here are rusted and broken down. One's even melted, leaning to its side.`);
    room.addStory(`It doesn't seem like there's much in the room that's worth—`, {waits: false, waitDelay: 1000});
    room.addAction({type: 'styleBG', parameters: ['[an:shake 70ms 9 linear alternate][sc:1.2]']});
    room.addStory(`[fst:italic][c:var(--dialogue)]"Rgh—!!"`);
    room.addStory(`[c:''][fst:'']...Is [c:var(--character)]someone [c:'']here?`);
    room.addStory(`[fst:italic][c:var(--actions)](Rustle, rustle...)`, {animation: 'fade-alternate'});
    room.addStory(`You whip your head around just in time to catch [c:var(--character)]the figure of another person, [c:]currently leaping through the broken window across the room.`);
    room.addStory(`Another survivor?`);
    let choice1 = room.createChoice(`After them!`);
    choice1.addAction({type: `changeRoom`, parameters: ['e-outside']});

    room = createRoom('e-outside');
    room.addStory(`Minding the glass, you hop through the hole in the wall, dashing to catch up with the mystery figure.`);
    room.addStory(`They stop just up ahead, regrouping with about four to five others.`);
    room.addStory(`And off to the side, they...`);
    room.addStory(`Woah.`);
    room.addStory(`That's a [c:var(--Gali)]whole spaceship.`);
    room.addStory(`Is that theirs, or has that always been there?`);
    choice1 = room.createChoice(`Run towards the ship.`);
    choice1.addAction({type: `changeRoom`, parameters: [`e-ship`]});
    let choice2 = room.createChoice(`Approach the group.`);
    choice2.addAction({type: `changeRoom`, parameters: [`e-goodFaction`]});

    room = createRoom(`e-ship`, {name: `escape.jpeg`});
    room.addStory(`Luckily, the ship's doors appear to be unlocked.`);
    room.addStory(`It's quite roomy for the amount of people that you've previously seen. Some of the interior's wiring is exposed, as if they'd run out of material midway through building the thing.`);
    choice1 = room.createChoice(`Have a look around.`);
    room.addStory(`Oh, neat! It appears they have a nice little storage rack set up in the corner. There's plenty of new, futuristic (at least, on your end) foods at your disposal.`);
    room.addStory(`And yeah, it doesn't belong to you, but...`);
    room.addStory(`In your defense, you've been starving for decades...`);
    room.addAction({type: `getItem`, parameters: [{name: `Astrostew`, min: 1, max: 5}]});
    choice1 = room.createChoice(`Quit being nosy.`);
    room.addStory(`You got quite a few stews!`)
        .addRequirement({ mode: 'show', type: 'hasItem', parameters: ['Astrostew', 4] });
    room.addStory(`Perhaps it is best if you leave, though.`)
    room.addStory(`You turn around, stuffing your pockets—`);
    room.addStory(`[fst:italic][c:var(--actions)](Whoosh!)`);
    room.addAction({type: 'styleBG', parameters: ['[an:shake 50ms 7 linear alternate][sc:1.2]']});
    room.addStory(`[fst:italic][c:var(--actions)](DONK!)`);
    room.addAction({type: 'styleBG', parameters: ['[an:blur-out 3s ease-out,fade-out 5s ease-out][fi:blur(10px)][op:0][sc:1.2]']});
    room.addAction({type: 'changeHP', parameters: [{min: -5}]})
    room.addStory(`[an:text-shiver .3s ease-in-out infinite alternate]Your head hurts...`, {waits: false, waitDelay: 4500});
    room.addAction({type: 'changeRoom', parameters: ['e-goodFaction']});

    room = createRoom(`e-goodFaction`, {name: `escape.jpeg`});
    room.addStory(`In front of you stands a small, inter-species group of survivors.`);
    room.addStory(`They all raise their weapons, which are crudely built from scraps and duct taped together.`);
    room.addStory(`Their [c:var(--character)]leader, [c:]a tall, cloaked figure, steps forward. The faintest glimpse of purple peeks out from under their burlap hood, glimmering in the Viremian sunlight.`);
    room.addStory(`[c:var(--dialogue)][fst:italic][fs:30px]"You."`, {speed: 350, waits: false, waitDelay:1500});
    room.addStory(`Their spear is pointed towards your chest.`);
    room.addStory(`[c:var(--dialogue)]"Where did you come from? Why are you following me? Who sent you here?"`);
    room.addStory(`The other four continue to circle around you, gazes intense. It's like they're throwing daggers straight into you with their eyes.`);
    choice1 = room.createChoice(`Stay calm and explain yourself.`);
    choice1.addAction({type: 'changeRoom', parameters:['e-gfCareful']});
    choice2 = room.createChoice(`Refuse to be intimidated by this riff-raff.`)
    choice2.addAction({type: 'changeRoom,', parameters: ['e-gfSarcastic']});

    room = createRoom(`e-gfCareful`, {name: 'escape.jpeg', transition: { out: '', in: '' }});
    room.addStory(`You raise your hands up in front of you, attempting to appear peaceful. As you open your mouth to speak, the leader thrusts the spear further. The head is just barely poking at your faded jumpsuit.`);
    room.addStory(`As you recall how you'd first seeked safety in the cryopod, the leader's stance seems to soften a bit.`);
    room.addStory(`They let their guard down further the more you talk, their gaze drifting to the crumbling lab behind you.`); 
    room.addStory(`Slowly, they pull their hood back, revealing their iridescent, choppy hair and purple scales.`);
    room.addStory(`[c:var(--dialogue)]"So [fst:italic]you're [fst:][c:var(--Gali)]Project Permafrost.[c:var(--dialogue)]"`);
    room.addStory(`You tilt your head in confusion, squinting at the rogue survivor.`);
    room.addStory(`Sensing your puzzlement, they approach you, glancing up and down at your figure.`);
    room.addStory(`[c:var(--dialogue)]"Of course! [fst:italic]now [fst:]I recognize the uniform. You were..."`);
    room.addStory(`[c:var(--Gali)]Gali, [c:]you state.`);
    room.addStory(`[c:var(--dialogue)]"Right, right."`);
    room.addStory(`[c:var(--dialogue)]"I was in the pod to [c:var(--Gali)]your left, [c:var(--dialogue)]I believe."`);
    room.addStory(`With their weapon tucked safely away, the leader signals for the others to lower theirs as well.`);
    room.addStory(`[c:var(--dialogue)]"You can call me [c:var(--character)]Idelle.[c:var(--dialogue)]"`);
    room.addStory(`[c:var(--actions)][fst:italic]You and [c:var(--character)]Idelle [c:var(--actions)]are now acquainted.`)
    room.addStory(`[c:var(--dialogue)]"You should have been released years ago, Gali."`);
    room.addStory(`[c:var(--dialogue)]"They let me and that other guy go after the 60-year contract was up. They couldn't get your pod to open at the time, so..."`);
    room.addStory(`...So you were [an:text-funky][c:var(--destruction)]abandoned, [an:][c:]it seems.`, {speed: 70, waits: false, waitDelay:1500});
    choice1 = room.createChoice(`Ask how long you've been frozen.`);
    room.addStory(`[c:var(--character)]Idelle [c:]gives a sheepish frown, awkwardly patting your shoulder.`);
    room.addStory(`[c:var(--dialogue)]"Oh, I don't know. Just about, erm...an extra...few..."`);
    room.addStory(`[fw:bold][fs:30px][c:var(--dialogue)][an:text-shiver .65s ease-in-out infinite alternate]"...fifteen years?"`, {speed: 65});
    room.addStory(`She moves on without giving you so much as a second to process that little tidbit.`);
    room.addStory(`[c:var(--dialogue)]"It's a good thing you're out now, I suppose. We were just popping through the area to see if there was anything worth taking."`);
    room.addAction({type: 'changeRoom', parameters: ['e-offer']});

    room = createRoom(`e-gfSarcastic`, {name: 'escape.jpeg'});
    room.addStory(`You stand your ground, glaring at the leader with a defiant expression.`);
    room.addStory(`Before you can even manage a "Wouldn't you like to know?" the leader thrusts their spear at you.`);
    room.addStory(`[c:var(--dialogue)][fs: 30px][fst:italic]"Don't test me."`, {speed: 350});
    room.addStory(`...It's becoming increasingly clear that this is not a group you want to mess with.`);
    room.addAction({type: 'changeRoom', parameters: ['e-gfCareful']});

    room = createRoom(`e-offer`, {name:'escape.jpeg', transition: {out: '', in: ''}});
    room.addStory(`Continuing to eye you a little, she appears to be lost in thought.`);
    room.addStory(`[c:var(--character)]Idelle [c:]hums to herself, examining the wreckage of the lab behind you.`);
    room.addStory(`[c:var(--dialogue)]"You know, this place is gonna blow to bits any day now.`);
    room.addStory(`"It won't do you any good if you stay here."`);
    room.addStory(`"After all, just look at the state of the lab now. Who knows what could have happened if your pod hadn't opened now?"`);
    room.addStory(`Glancing over your shoulder, the lab appears to be in a much worse state than you'd thought from the inside. As if on cue...`);
    room.addStory(`[c:var(--actions)](CRASH!)`);
    room.addStory(`...one of the walls collapses, sending a cloud of dust and debris flying.`);
    room.addStory(`With a sigh, [c:var(--character)]Idelle [c:]gestures to the wreckage.`);
    room.addStory(`"Case in point."`);
    room.addStory(`She turns to the group, who are still standing around, weapons at the ready.`);
    room.addStory(`"We were just about to head out, but...I suppose we could do with a plus one."`);
    room.addStory(`[c:var(--character)]Idelle [c:]looks back at you, her expression softening.`);
    room.addStory(`"We're still gathering up quite a bit of supplies, and we could use the extra help. Besides, it's not like you have much of a chance here."`);
    room.addStory(`The other four survivors are still eyeing you suspiciously, weapons at the ready. They don't seem like they plan on being very welcoming.`);
    room.addStory(`Meanwhile, [c:var(--character)]Idelle [c:]is still waiting for your answer, hand outstretched towards you.`);
    choice1 = room.createChoice(`Go with Idelle, your life depends on it.`);
    choice1.addAction({type: 'changeRoom', parameters: ['e-taskList']});
    choice2 = room.createChoice(`You don't know these people. Stay behind.`);
    choice2.addAction({type: 'changeRoom', parameters: ['b-return']});

    room = createRoom(`e-taskList`, {name: 'escape.jpeg', transition: {out: '', in: ''}});
    room.addStory(`You take a deep breath and step forward, shaking [c:var(--character)]Idelle's [c:]hand.`);
    room.addStory(`She smiles while the crew lower their weapons.`);
    room.addStory(`"Welcome aboard, Gali."`);
    room.addStory(`"Now then—"`);
    room.addStory(`[c:var(--character)]Idelle [c:]gestures to the ship.`);
    room.addStory(`"You can start by helping us gather supplies. We need to stock up before we leave, and there's still a bit of...[fst:italic]renovation,[fst:] we'll call it...to do."`);
    room.addStory(`You must gather the following items:`);
    room.addStory(`- 1 FUEL CANISTER`);
    room.addStory(`- 1 MICROCHIP`);
    room.addStory(`- 5 SCRAP METAL`);
    room.addStory(`- 10 FOOD PACKS`);
    room.addStory(`- MEDICAL KITS`);
    room.addStory(`[c:var(--character)]Idelle [c:]drags some kind of...thing out of the ship, pushing what appears to be a big hunk of metal towards you.`);
    room.addStory(`"Here. Call it a welcome gift."`);
    room.addStory(`"We found this a while back, but it doesn't seem to be doing much for us. You can have it."`);
    room.addStory(`Suddenly, the thing starts to shudder, and a loud whirring noise fills the air.`);
    room.addStory(`It gives a quiet chirp as a metal plate slides open, revealing a small screen with two little, glowing eyes.`);
    room.addStory(`"Oh, uh...`);
    room.addStory(`That's not supposed to happen."`);
    room.addStory(`The little machine chirps again, and the screen lights up, displaying a small, pixelated face.`);
    room.addStory(`"Wait a minute, I know what this is!"`);
    room.addStory(`[c:var(--character)]Idelle [c:]excitedly exclaims, beaming as she points at the machine.`);
    room.addStory(`"These things are ancient! They had all sorts of these little guys running around back in the day, remember?"`);
    room.addStory(`You shake your head. This is unlike anything you've ever seen before.`);
    room.addStory(`Realizing her error, [c:var(--character)]Idelle [c:]frowns, looking a little embarrassed.`);
    room.addStory(`"Right, right. You were frozen for a while, huh?"`);
    room.addStory(`She clears her throat, trying to regain her composure.`);
    room.addStory(`"This is a little helper bot! It can help you with all sorts of things, like finding items and keeping track of your inventory."`);
    room.addStory(`"Weird that it's still working, though. I thought they all broke down ages ago."`);
    room.addStory(`After a moment, she grins awkwardly.`);
    room.addStory(`"Not that I was just gonna hand it off to you to deal with or anything. I just thought it was a...neat little thing."`);
    room.addStory(`Upon inspection, the little machine appears to be a small, round ball with a screen on it. It has two little arms and legs, and a tiny little face that looks like it's made out of pixels.`);
    room.addStory(`For a moment, the screen reads in little, pixelated letters:`);
    room.addStory(`[c:var(--dialogue)]"HELLO! MY NAME IS OTTO :-]"`);
    room.addStory(`Then, the screen flickers and goes blank.`);
    room.addStory(`[c:var(--character)]Idelle [c:]shrugs with a smile.`);
    room.addStory(`"I guess it likes you."`);
    room.addStory(`"Now, if you don't mind, I have a few things to take care of. come back to the ship when you've found everything."`);
    room.addStory(`The wasteland is a desolate, barren dust bowl. The ground is cracked and dry, and the air is thick with dust and debris. Your mouth tastes more and more like metal the longer you stand out here.`);
    choice1 = room.createChoice(`Explore the wasteland and gather supplies for the ship.`);
    choice1.addAction({type: 'changeRoom', parameters: ['e-wasteland-start']});
    choice1.addAction({type: 'changeSong', parameters: ['explore_stereo'], skipsWait: true});

    let wastelandGrid = new RoomGrid({name: 'e-wasteland', width: 5, height: 5, entrance: [2, 2]});
    let defaultRoom = new Room('', {name: 'escape.jpeg'});
    // defaultRoom.addStory('The land is barren');
    wastelandGrid.setDefaultRoom(defaultRoom)
    wastelandGrid.addQueuelist('end', createQueuelist([
        new Action({type: 'getItem', parameters: [{name: 'Scrap Metal', min: 1, max: 1}], waits: true, chance: 3})
    ]), [
        new Requirement({ mode: 'use', type: 'hasItem', parameters: ['Scrap Metal', 5], inverse: true }),
    ])
    wastelandGrid.addQueuelist('end', createQueuelist([
        new StoryObject(`[an:text-shiver .15s ease-in-out infinite alternate]You've found everything!`),
        new Choice(`See Idelle.`)
            .addAction({ type: 'removeItem', parameters: ['Scrap Metal', 5] })
            .addAction({ type: 'removeItem', parameters: ['Scrap Metal', 5] })
            .addAction({ type: 'removeItem', parameters: ['Microchip', 1] })
            .addAction({ type: 'removeItem', parameters: ['Fuel Canister', 1] })
            .addAction({type: 'changeRoom', parameters: ['e-finalTask']})
    ]), [
        new Requirement({ mode: 'show', type: 'hasItem', parameters: ['Scrap Metal', 5] }),
        new Requirement({ mode: 'show', type: 'hasItem', parameters: ['Food Pack', 10] }),
        new Requirement({ mode: 'show', type: 'hasItem', parameters: ['Fuel Canister', 1] }),
        new Requirement({ mode: 'show', type: 'hasItem', parameters: ['Microchip', 1] })
    ])

    room = wastelandGrid.generateRoom([0,2], {name: 'destruction.jpeg'});
    room.addAction({type: 'encounter', parameters: [{
        enemyPool: [
            new Enemy({name: 'Average Joe', hp: 15, strength: 10, agility: 10, desc: `Jack of all trades, master of none.`})
        ],
        rewardPool: [
            {name: 'Food Pack', min: 1, max: 4},
            {name: 'Participation Trophy', min: 1, max: 1},
        ], 
        groupName: 'an abnormality!'
    }], waits: true});

    room = wastelandGrid.generateRoom([0,4], {name: 'escape.jpeg'});
    room.addAction({type: `getItem`, parameters: [{name: `Food Pack`, min: 1, max: 3}]});

    room = wastelandGrid.generateRoom([1,0], {name: 'escape.jpeg'});
    room.addAction({type: `getItem`, parameters: [{name: `Microchip`, min: 1}], waits: true, maxUses: 1});

    room = wastelandGrid.generateRoom([1,1], {name: 'escape.jpeg'});
    room.addStory(`[c:var(--dialogue)][OTTO RECOMMENDS YOU DO NOT GO EAST.]`);

    room = wastelandGrid.generateRoom([1,3], {name: 'escape.jpeg'});
    room.addStory(`[c:var(--dialogue)][OTTO RECOMMENDS YOU DO NOT GO SOUTH.]`);
    room = wastelandGrid.generateRoom([1,4], {name: 'destruction.jpeg'});
    room.addAction({type: 'encounter', parameters: [{
        enemyPool: [
            new Enemy({name: 'FishBat', hp: 20, strength: 20, agility: 5, desc: `Not to be confused with a batfish.`}),
        ],
        rewardPool: [
            {name: 'Food Pack', min: 1, max: 4}
        ], 
        groupName: 'an abnormality!'
    }], waits: true});

    room = wastelandGrid.generateRoom([2,0], {name: 'escape.jpeg'});
    room.addStory(`[c:var(--dialogue)][OTTO RECOMMENDS YOU DO NOT GO SOUTH.]`);

    room = wastelandGrid.generateRoom([2,1], {name: 'destruction.jpeg'});
    room.addAction({type: 'encounter', parameters: [{
        enemyPool: [
            new Enemy({name: 'Rootwraith', hp: 8, strength: 20, agility: 20, desc: `A horrid mass of roots and vines.`}),
            new Enemy({name: 'Blightfruit Beast', hp: 30, strength: 2, agility: 2, desc: `A large, mutated fruit with a gaping maw.`})
        ],
        rewardPool: [
            {name: 'Food Pack', min: 1, max: 4},
            {name: 'Opinionated Seedling', min: 1, max: 1},
        ],
        groupName: 'some bad apples!'
    }], waits: true});

    room = wastelandGrid.generateRoom([2,2], {name: 'escape.jpeg'});
    room.addStory('[c:var(--dialogue)][OTTO RECOMMENDS YOU DO NOT GO NORTH.]');

    room = wastelandGrid.generateRoom(null, {name: 'escape.jpeg'}, 6);
    room.addAction({type: 'getItem', parameters: [{name: 'Scrap Metal', min: 1, max: 1}], waits: true, maxUses: 1})
        .addRequirement({ mode: 'use', type: 'hasItem', parameters: ['Scrap Metal', 5], inverse: true });

    room = wastelandGrid.generateRoom([2,4], {name: 'escape.jpeg'});
    room.addStory(`[c:var(--dialogue)][OTTO RECOMMENDS YOU DO NOT GO WEST.]`);

    room = wastelandGrid.generateRoom([3,1], {name: 'escape.jpeg'});
    room.addStory(`[c:var(--dialogue)][OTTO RECOMMENDS YOU DO NOT GO WEST.]`);

    room = wastelandGrid.generateRoom([3,3], {name: 'destruction.jpeg'});
    room.addAction({type: 'encounter', parameters: [{
        enemyPool: [
            new Enemy({name: 'Heavily Armed Turtle 1', hp: 15, strength: 12, agility: 12, desc: `A mutant turtle with a pair of swords.`}),
            new Enemy({name: 'Heavily Armed Turtle 2', hp: 15, strength: 12, agility: 12, desc: `A mutant turtle with a pair of small blades.`}),
            new Enemy({name: 'Heavily Armed Turtle 3', hp: 15, strength: 12, agility: 12, desc: `A mutant turtle with some sick nunchucks.`}),
            new Enemy({name: 'Heavily Armed Turtle 4', hp: 15, strength: 12, agility: 12, desc: `A mutant turtle with a big stick.`})
        ],
        rewardPool: [
            {name: 'Food Pack', min: 1, max: 7},
            {name: 'Slice of Brotherhood', min: 1, max: 1}
        ],
        groupName: 'a clan of mutants!'
    }], waits: true});

    room = wastelandGrid.generateRoom([4,0], {name: 'destruction.jpeg'});
    room.addAction({type: 'encounter', parameters: [{
        enemyPool: [
            new Enemy({name: 'Blatto', hp: 30, strength: 20, agility: 20, desc: `A giant cockroach with a bad attitude.`}),
            new Enemy({name: 'Joyama', hp: 20, strength: 15, agility: 15, desc: `A large, spider-like creature with a nasty bite.`})
        ],
        rewardPool: [
            {name: 'Food Pack', min: 1, max: 3},
            {name: 'Questionable Mixtape', min: 1, max: 1}
        ],
        groupName: 'an infestation!'
    }], waits: true});

    room = wastelandGrid.generateRoom([4,1], {name: 'escape.jpeg'});
    room.addAction({type: 'getItem', parameters: [{name: 'Fuel Canister', min: 1}], waits: true, maxUses: 1});

    room = wastelandGrid.generateRoom([4,3], {name: 'escape.jpeg'});
    room.addAction({type: 'getItem', parameters: [{name: 'Food Pack', min: 1, max: 4}], maxUses: 1});

    wastelandGrid.generateGrid(); // only use once, and after you add all the rooms you want

    room = createRoom(`e-finalTask`, {name: 'escape.jpeg'});
    room.addStory(`Hauling all of this stuff back to Idelle is kind of a pain, but you know it's worth it. You can finally get out of this place!`);
    room.addStory(`You make your way back to the ship, where [c:var(--character)]Idelle [c:]is waiting for you. She looks relieved to see you.`);
    room.addStory(`[c:var(--dialogue)]"You made it back! Took you long enough, I was starting to worry."`);
    room.addStory(`[c:var(--character)]Idelle [c:]looks over the pile of supplies you brought back with you.`);
    room.addStory(`[c:var(--dialogue)]"I see you found everything I asked for. Good job!"`);
    room.addStory(`[c:var(--dialogue)]"You look like you got pretty banged up, though...here, let me handle it."`)
        .addRequirement({ mode: 'show', type: 'hasStat', parameters: ['hp', 0, 40] })
    choice1 = room.createChoice(`Use the medical supplies.`)
        .addRequirement({ mode: 'show', type: 'hasStat', parameters: ['hp', 0, 40] });
    choice1.addAction({type: 'changeHP', parameters: [{min: 100}]});
    room.addStory(`[c:var(--dialogue)]"Now that you're here, there's one more thing we have to do. I've got a stash of medical supplies somewhere out here, and I need all hands on deck to get it."`);
    room.addStory(`[c:var(--character)]Idelle [c:]pulls out a map and shows you where the stash is located.`);
    room.addStory(`[c:var(--dialogue)]"It's a bit of a trek, but I think we can make it. We're [fst:italic][fst:bold]this [fst:]close to getting out of here!"`);
    room.addStory(`[c:var(--character)]Idelle [c:]pinches her pointer and her thumb, barely leaving a gap between them.`);
    room.addStory(`[c:var(--dialogue)]"Let's get moving!"`);
    choice1 = room.createChoice(`Go to the stash.`);
    choice1.addAction({type: 'changeRoom', parameters: ['e-trek']});

    room = createRoom(`e-trek`, {name: 'escape.jpeg'});
    room.addAction({type: 'changeParticleAnimation', parameters: ['ashes', 2, 2]});
    room.addStory(`Luckily, [c:var(--character)]Idelle [c:]and her crew are much more equipped to handle this than you are. You follow her lead as she guides you through the treacherous terrain.`);
    room.addStory(`Staying near [c:var(--character)]Idelle, [c:]you continue to march across the land, the wind howling in your ears.`);
    room.addStory(`You can see the faint shadow of a building in the distance, but it looks like it's going to be a while before you even come close to it..`);
    room.addStory(`For a while, you've been enjoying the comfortable silence of the journey. [c:var(--character)]Idelle [c:]eventually nudges you in the side, attempting to get your attention.`);
    room.addStory(`[c:var(--dialogue)]"So, [c:var(--Gali)]Gali, [c:var(--dialogue)]tell me about yourself. What's, um..."`);
    room.addStory(`[c:var(--character)]Idelle [c:]looks around, trying to find the right words. Understandably, it must be difficult to try to make conversation with someone stuck 75 years in the past.`);
    room.addStory(`[c:var(--dialogue)]"How are you doing? Excited to get off this ticking time bomb of a planet?"`);
    choice1 = room.createChoice(`You can't wait to leave.`);
    room.addStory(`[c:var(--character)]Idelle [c:]nods her head in agreement.`);
    room.addStory(`[c:var(--dialogue)]"I can't wait to get out of here. It's been a long time coming."`);
    room.addStory(`[c:var(--dialogue)]"I mean, I love this planet and all, but it's just not the same anymore."`);
    room.addStory(`[c:var(--character)]Idelle [c:]looks around, as if to make sure no one is listening.`);
    room.addStory(`[c:var(--dialogue)]"Between you and me, I'm pretty sure it's been trying to tell us to leave for a while now."`);
    room.addStory(`[c:var(--dialogue)]"I mean, look at this place. It's a mess."`);
    room.addStory(`She gestures to the surrounding area, which is littered with debris and wreckage. All around you, traces of fallout are floating in the air.`);
    room.addStory(`[c:var(--dialogue)]"I think it's time we finally listened to it. Don't you?"`);
    room.addStory(`You consider her words for a moment, and you can't help but agree. The planet has been through a lot, and it's time to move on.`);
    room.addStory(`[c:var(--dialogue)]"It must be nice for you, though. You've been nice and safe in your little pod, and now you get to leave while you're in tip-top shape."`);
    room.addStory(`[c:var(--dialogue)]"I mean, I guess I can't blame you for that."`);
    room.addStory(`[c:var(--dialogue)]"But I have to say, I'm a little jealous. Just look at you. You're practically glowing."`);
    room.addStory(`[c:var(--dialogue)]"And not from the radiation, either."`);
    room.addStory(`[c:var(--character)]Idelle [c:]snickers, and you can't help but feel a little flattered.`);
    choice1 = room.createChoice('Return the compliment.');
    room.addStory(`You note how [c:var(--character)Idelle's [c:]own scales seem to shimmer and sparkle when the sunlight hits her.`);
    room.addStory(`[c:var(--dialogue)]"Oh, stop it. You're just saying that because you wanna ride shotgun when we leave."`);
    room.addStory(`[c:var(--dialogue)]"Boss!"`);
    room.addStory(`One of the crew members shouts from the back of the group, interrupting your conversation.`);
    room.addStory(`[c:var(--dialogue)]"Up ahead!"`);
    room.addStory(`You look ahead and see a large building in the distance. A crude hole has been blasted into the side of it, and you can see a faint light coming from inside, as well as smoke trailing out and into the air.`);
    room.addStory(`[c:var(--character)]Idelle [c:]nods. She, along with the rest of the crew, pull their cloaks and masks over themselves as they rush to the side of the building.`);
    room.addStory(`[c:var(--dialogue)]"This is it. This is where the stash is."`);
    room.addStory(`For an abandoned building, it seems awfully...`);
    room.addStory(`...lively.`);
    room.addStory(`It sounds like there's quite the crowd inside. They sound pained. You can hear the sound of metal clanging against metal, and the occasional scream.`);
    choice1 = room.createChoice(`What is this place?`);
    room.addStory(`You utter to [c:var(--character)]Idelle [c:]as you approach the entrance, peeking inside...`);
    room.addStory(`And then your eyes widen in horror.`);
    choice1 = room.createChoice(`Is this a hospital!?`);
    room.addStory(`[c:var(--character)]Idelle [c:]shushes you, and you can see her eyes darting around the room, trying to find a way in.`);
    room.addStory(`[c:var(--dialogue)]"We need to get in there. We need to find the stash."`);
    choice1 = room.createChoice(`This sounds like stealing.`);
    room.addStory(`[c:var(--character)]Idelle [c:]rolls her eyes, motioning for two of the crew members to take the other side.`);
    room.addStory(`[c:var(--dialogue)]"It's not [fst:italic]stealing, [fst:]it's..."`);
    room.addStory(`[c:var(--dialogue)]"It's...uh..."`);
    room.addStory(`She sighs.`);
    room.addStory(`[c:var(--dialogue)]"Look. Any chances of survival they have are gone if they stay here, no matter how much they recover. They were doomed from the beginning. This just ensures that, um..."`);
    room.addStory(`[c:var(--dialogue)]"We're just making sure nothing goes to waste."`);
    room.addStory(`[c:var(--character)]Idelle [c:]places a hand on your shoulder, trying to reassure you.`);
    room.addStory(`[c:var(--dialogue)]"Trust me. I know what I'm doing."`);
    room.addStory(`[c:var(--dialogue)]"They..."`);
    room.addStory(`[c:var(--dialogue)]"...are NOT..."`);
    room.addStory(`[c:var(--dialogue)]"...going to survive. You got me?"`);
    room.addStory(`[c:var(--dialogue)]"Now, let's get in there."`);
    choice1 = room.createChoice(`Rob the hospital.`);
    choice1.addAction({type: 'changeRoom', parameters: ['e-hospital']});
    choice2 = room.createChoice('Get out of here.');
    choice2.addAction({type: 'changeRoom', parameters: ['e-ultimatum']});
    room = createRoom(`e-hospital`, {name: 'neutral.jpeg'}, {transition: {out: '', in: ''}});
    room.addAction({type: 'changeParticleAnimation', parameters: ['fog', 0.3, 0.3]})
    room.addStory(`Considering her words very carefully...`);
    room.addStory(`You sigh, deciding to follow [c:var(--character)]Idelle [c:]and her crew inside.`);
    room.addStory(`[fst:italic][c:var(--actions)]Even if a little piece of you has just died inside...`, {speed: 50});
    room.addStory(`[c:var(--character)]Idelle [c:]and her crew rush inside, and you follow suit, trying to keep up with them.`);
    room.addStory(`[c:var(--actions)]"Ugh, smells like rot in here."`);
    room.addStory(`[c:var(--actions)]"Grab that! I'll distract her!"`);
    room.addStory(`[c:var(--actions)]"Shhh!"`);
    room.addStory(`You can see the crew members are already hard at work, rummaging through the supplies and trying to find anything useful as they sneak around.`);
    room.addStory(`[c:var(--dialogue)]"[c:var(--Gali)]Gali, [c:var(--dialogue)]head towards the closet over there.`);
    room.addStory(`[c:var(--dialogue)]"Be careful. The place is swarming with mutant folk."`);
    choice1 = room.createChoice(`Gather supplies.`);
    choice1.addAction({type: 'changeRoom', parameters: ['e-finale']}); // change to hospital-2-2 later

    // room = createRoom(`hospital-2-2`, {name: 'neutral.jpeg'});
    // room.addStory(`You are currently at (2,2).`);
    // choice1 = room.createChoice(`Go North.`, {maxUses: Infinity});
    // choice1.addAction({type: 'changeRoom', parameters: ['hospital-2-3']});
    // choice2 = room.createChoice(`Go East.`, {maxUses: Infinity});
    // choice2.addAction({type: 'changeRoom', parameters: ['hospital-3-2']});
    // choice3 = room.createChoice(`Go South.`, {maxUses: Infinity});
    // choice3.addAction({type: 'changeRoom', parameters: ['hospital-2-1']});
    // choice4 = room.createChoice(`Go West.`, {maxUses: Infinity});

    // room = createRoom(`hospital-2-3`, {name: 'neutral.jpeg'});
    // room.addStory(`You are currently at (2,3).`);
    // choice1 = room.createChoice(``)

    room = createRoom(`e-finale`, {name: 'escape.jpeg'});
    room.addAction({type: 'changeParticleAnimation', parameters: ['ashes', 2, 2]});
    room.addStory(`There's a subtle weight on your shoulders, and it isn't from the satchel you're carrying.`);
    room.addStory(`Everyone else seems to be in high spirits. You can hear them laughing and joking around, but you can't help but feel a little uneasy.`);
    room.addStory(`Catching [c:var(--character)]Idelle's [c:]eye, you don't have much of a chance to dwell on it. She continues to haul her own supplies with her, and she looks like she's having a blast.`);
    room.addStory(`[c:var(--dialogue)]"I can't believe we actually did it! We're gonna get out of here!"`);
    room.addStory(`The shine in her eyes fades a little, and she looks down at the ground.`);
    room.addStory(`[c:var(--dialogue)]"We..."`);
    room.addStory(`[c:var(--dialogue)]"We're going home."`);
    room.addAction({ type: 'changeBG', parameters: ['destruction.jpeg', { out: '', in: '' }] });
    room.addAction({ type: 'styleBG', parameters: ['[an:blur-in 2s ease-out,fade-in 2s ease-out][fi:][op:]'] });
    room.addAction({type: 'changeSongPitch', parameters: [.7, 300], skipsWait: true});
    room.addStory(`[c:var(--actions)](BANG!)`);
    room.addStory(`[c:var(--dialogue)][fst:italic]"AUGH!"`);
    room.addAction({type: 'styleBG', parameters: ['[an:shake 70ms 9 linear alternate][sc:1.2]']});
    room.addStory(`[c:var(--actions)](Thud!)`);
    room.addStory(`You quickly turn to the source of the noise, and your heart sinks as you see [c:var(--character)]Idelle [c:]on the ground, clutching her side.`);
    room.addStory(`Above her stands [c:var(--destruction)]a large, hulking figure with a massive shotgun strapped to their back, and a pair of glowing red eyes that seem to pierce through the darkness.`);
    room.addAction({type: 'encounter', parameters: [{
        enemyPool: [
            new Enemy({name: `Palmetto's Lackey 1`, hp: 20, strength: 5, agility: 10, desc: `A tall, lanky fellow. All brain, no brawn.`}),
            new Enemy({name: 'Palmetto',hp:  50, strength: 15, agility: 15, desc: `A rootin', tootin', mutasnt shootin' cockroach. No...a glockroach.`}),
            new Enemy({name: `Palmetto's Lackey 2`, hp: 20, strength: 10, agility: 5, desc: `A short, dumpy fellow. All brawn, no brain.`}),
        ],
        rewardPool: [
            {name: 'Unnecessary Trauma', min: 1, max: 1},
            {name: 'The Glockinator', min: 2, max: 2}
        ],
        groupName: 'the Six-Legged Syndicate!'
    }, {name: 'battle_stereo', pitch: .5}], waits: true});
    room.addStory(`You quickly rush to [c:var(--character)]Idelle's [c:]aide as the others chase the bandits away.`);
    room.addStory(`[c:var(--destruction)]...This isn't good at all.`);
    room.addStory(`[fs:12px][c:var(--dialogue)]"Go..."`);
    room.addStory(`She coughs out, her own grip on you loosening.`);
    room.addStory(`[c:var(--dialogue)][fs:12px]"My keys...take my keys..."`);
    room.addStory(`[c:var(--dialogue)]"...Save them, [c:var(--Gali)]Gali.[c:var(--dialogue)]"`)
    room.addStory(`You hold [c:var(--character)]Idelle [c:]until the glow from her scales fades away.`);
    room.addStory(`Rummaging through her pockets, you manage to pick up the ship's activation keycard. Nodding towards the others, they start to head towards the ship.`);
    room.addStory(`Looking down at [c:var(--character)]Idelle [c:]one last time, you sigh, trying to ignore the burn in your eyes as you lay her cloack over her.`);
    choice1 = room.createChoice('Head to the ship.');
    choice1.addAction({type: 'ending', parameters: ['escape']});
}