
import {game, createRoom, RoomGrid, Room, createQueuelist, StoryObject, Requirement, Choice, Action } from '../../scripts/GameLogic.js';
import { Enemy } from '../../scripts/Enemies.js';
export let roomGenerators = [generate];

function generate() {
    let room = createRoom(`d-start`, {name: 'destruction.jpeg'});
    room.addAction({type: 'changeBG', parameters: ['transparent.png', {}, 'background-image-2']})
    room.addAction({type: 'styleBG', parameters: ['', 'background-image-2']});
    room.addAction({type: 'changeParticleAnimation', parameters: ['none']});
    room.addStory(`Heading to the [c:var(--destruction)]right, [c:]you can hear the chants of several people. Perhaps you aren't that alone after all.`);
    room.addStory(`It's quite uniform, too. Rhythmic thuds echo through the building, a single light shining through a doorway at the end of the hall.`);
    room.addStory(`Approaching the door, you peek in to see a large, inter-species group of survivors, all donning dark masks, cloaks, hoods, and hats. There's a line of them running out of the broken window, hauling out looted supplies and equipment one by one.`);
    room.addStory(`Most, if not all of them are armed to the teeth, and they all seem to be in a trance, chanting in unison as they work.`);
    room.addStory(`Among them, [c:var(--character)]one [c:]appears to have much more authority than the others.`);
    room.addStory(`[c:var(--character)]A large, hulking figure [c:]with a massive shotgun strapped to their back, and a pair of glowing red eyes that seem to pierce through the darkness.`);
    room.addStory(`Their exoskeleton is visibly cracked, paired with four large, leathery wings. You can see the figure is wearing a mask with a different insignia than the rest, but you can't make out any of their features.`);
    let choice1 = room.createChoice(`Approach the group.`);
    choice1.addAction({type: 'changeRoom', parameters: ['d-looting']});
    let choice2 = room.createChoice(`Get out of there.`);
    choice2.addAction({type: 'changeRoom', parameters: ['b-return']});

    room = createRoom(`d-looting`, {name: 'destruction.jpeg'}); 
    room.addStory(`You step into the room, immediately alerting the others to your presence.`); 
    room.addStory(`The group stops chanting instantly. They all turn to you, their eyes glowing red as they stare you down.`);
    room.addStory(`[c:var(-character)]The largest of them all steps forward, towering over you. All four [fst:italic][c:var(--destruction)](four!?) [c:][fst:]of the guns strapped to their body clank against them as they move.`);
    room.addStory(`The only sounds among you are your own heavy breathing and the light buzz of the beast's wings.`);
    choice1 = room.createChoice(`Explain yourself.`);
    choice1.addAction({type: 'changeRoom', parameters: ['d-explain']});
    // choice2 = room.createChoice(`Refuse to be intimidated by this riff-raff.`);
    // choice2.addAction({type: 'changeRoom', parameters: ['d-fight']});
    let choice3 = room.createChoice(`Get out of here NOW.`);
    choice3.addAction({type: 'changeRoom', parameters: ['b-return']});

    room = createRoom(`d-explain`, {name: 'destruction.jpeg'});
    room.addStory(`Relieved to see other survivors, you start to rant and rave about how you'd just woke up all alone in a strange place, and how you weren't sure if anyone was left on the planet.`);
    room.addStory(`You continue on with your rambling, frantically over-explaining your situation as the group stares at you blankly.`);
    room.addStory(`[c:var(--character)]The hulking figure [c:]seems to be the only one who is actually listening to you, and they nod along as you speak.`);
    room.addStory(`Just as you gasp for a breath, they raise a hand to silence you.`);
    room.addStory(`[c:var(--dialogue)][fs:30px][an:alternate]"Enough."`, {speed: 250, waits: false, waitDelay: 1500});
    room.addStory(`[c:var(--character)]The figure [c:]speaks in a deep, gravelly voice, their words booming in your ears.`);
    room.addStory(`...which immediately melts away as they pull their mask down, revealing chittering mandibles and a pair of large, black orbs for eyes.`);
    room.addStory(`[c:var(--dialogue)]"...You the feller thet wuz all up in'net freezer pod?"`);
    room.addStory(`You nod, and the figure seems to relax slightly, chuckling to themself.`);
    room.addStory(`[c:var(--dialogue)]"Wull, ain't thet a sight 'ta behold! The one time I skedaddle right awn 'ome, 'n lookit thet!"`);
    room.addStory(`[c:var(--dialogue)]"I wuz all chilled up in thet pod on'na [c:var(--destruction)]right, [c:var(--dialogue)]'n I reckon you's wuz in wunna'em too. Ain't no one else 'round here, 'cept fer me 'n muh crew."`);
    room.addStory(`The creature offers one of six hands to you, grabbing yours before you can react.`);
    room.addStory(`[c:var(--dialogue)]"Name's [c:var(--character)]Palmetto.[c:var(--dialogue)]"`);
    room.addStory(`[c:var(--actions)][fst:italic]You and [c:var(--character)]Palmetto [c:var(--actions)]are now acquainted.`)
    room.addStory(`[c:var(--character)]Palmetto[c:] gestures to the group outside.`);
    room.addStory(`[c:var(--dialogue)]"We's all a bit...with 'er own cautions 'n such, but we's ain't hostile. Ain't no reason 'ta be."`);
    room.addStory(`[c:var(--dialogue)]"Us'n just tryin' 'ta make it through this mess, same's you, uh..."`);
    room.addStory(`[c:var(--Gali)]Gali, [c:]you state.`);
    room.addStory(`He gives you his best approximation of a smile at that, and you can't help but feel a little more at ease.`);
    room.addStory(`[c:var(--dialogue)]"Real shame 'ya had 'ta wake up in'na middle'a all the mess, though."`);
    room.addStory(`[c:var(--dialogue)]"Y'know, I wuz there thet day. Woke up inna pod, came crawlin' out widd'et other gal feelin' 60 years older, 'n we's wuz waitin' on ya 'ta pop out too."`);
    room.addStory(`[c:var(--dialogue)]"'N then. y'know..."`);
    room.addStory(`[c:var(--dialogue)]"'Ya didn't."`);
    room.addStory(`Sensing your discomfort, [c:var(--character)]Palmetto[c:] quickly changes the subject.`);
    room.addStory(`[c:var(--dialogue)]"Ah, well, ain't no use dwellin' on the past. We's all here now, ain't we?"`);
    room.addStory(`[c:var(--dialogue)]"Wut's 'nuther few years, anyways?"`);
    choice1 = room.createChoice(`Define "A few" years.`);
    room.addStory(`You hear [c:var(--character)]Palmetto [c:] quietly hiss, wings fluttering behind him.`)
    room.addStory(`[c:var(--dialogue)]"Wull, it ain't [fst:italic]thet [fst:]bad!"`);
    room.addStory(`He lands a hearty pat on your back.`);
    room.addStory(`[fw:bold][fs:30px][c:var(--dialogue)][an:text-shiver .65s ease-in-out infinite alternate]"Fifteen years [fw:][an:]ain't got nuthin' awn ya!"`, {speed: 65});
    room.addStory(`His mandibles chitter with delight as he throws an arm around you, giving you no time to let that settle in.`);
    room.addStory(`[c:var(--dialogue)]"The 'port'n thing now's thet'churr outta there. [c:var(--Gali)]Project Permafrost[c:var(--dialogue)] ain't no more!"`);
    room.addStory(`With that, Palmetto drags you to the window, boosting you up as you hop out of it.`);
    // room.addAction({type: ""});
    room.addAction({type: 'changeRoom', parameters: ['d-outside']})
    
    room = createRoom('d-outside', {name: 'destruction.jpeg'});
    room.addAction({type: 'changeParticleAnimation', parameters: ['ashes', 2, 2]});
    room.addStory(`You look to the crowd of bandits as you start walking up to them. They're currently in the middle of carrying the looted pile over to a caravan of giant, dusty, rodent-like creatures. Upon tapping their heads, they open their mouths, allowing the crew to start shoving all sorts of supplies into the critters' cheeks. [c:var(--actions)][fst:italic][fs:15px](Eww...)`);
    room.addStory(`They all turn to face you two immediately. In the distance, a stray survivor is running off into the distance, dragging one foot behind them.`);
    room.addStory(`[c:var(--character)]Palmetto [c:]grunts, his mandibles clicking quietly.`);
    room.addStory(`[c:var(--dialogue)]"We git pests r'awn here all'a time. Dun' worruh 'bout it, pal. We gotcha covered."`);
    room.addStory(`Wallking up to the biggest of the fuzzy creatures, a blonde furred fella with beads in its braids, [c:var(--character)]Palmetto [c:]scritches its chin. In return, it politely spits out a big 'ol hunk of rusty metal and bolts in front of you two.`);
    room.addStory(`His fist clangs against the top of it rather loudly. He grins(?), pushing it across the dirt until it lands at your feet.`);
    room.addStory(`Wiping the dust off of the machine, you find that it appears to be a small, round ball with a screen on it. It has two little arms and legs, and a tiny little face that looks like it's made out of pixels.`);
    room.addStory(`It chirps for a moment, rattling loudly before its head whirrs to look at you.`);
    room.addStory(`[c:var(--dialogue)]"XCFS-2B?"`);
    room.addStory(`Before you can keep gawking at the sight, [c:var(--character)]Palmetto[c:] snaps his fingers in your face to grab your attention back.`);
    room.addStory(`[c:var(--dialogue)]"Thet's a lil' welcome gift fer ya. All'n me. We's cleared out all'et junk in its brain al'riddy, so's yer all welcome."`);
    room.addStory(`He turns around, a low hiss emanating from within him. One of the crew members nods, with the rest clambering onto the rodents.`);
    room.addStory(`[c:var(--dialogue)]"Now we's dun' rilly got a Carrybeast fer ya, but'm sure we kin work it out. Ye' jus' gotta hop on up 'ere on Marisol fer now."`);
    room.addStory(`When he sees that you aren't instantly following his lead, [c:var(--character)]Palmetto [c:]squints, eyeing you intensely.`);
    room.addStory(`On cue, two of his lackeys step away from their own Carrybeasts. The two of them, cloaks crudely labeled "Aardvark" and "Roox" draw their weapons.`)
    room.addStory(`[c:var(--dialogue)]"Yer comin' with, aint'cha?"`);
    choice1 = room.createChoice(`Take the bot and run.`);
    choice1.addAction({type: 'changeRoom', parameters: ['s-start']});
    choice2 = room.createChoice(`Ride off into the sunset.`);
    choice2.addAction({type: "changeRoom", parameters: ['d-journey']});

    room = createRoom('d-journey', {name: 'destruction.jpeg'});
    room.addAction({type: 'changeSong', parameters: ['explore_stereo'], skipsWait: true});
    room.addAction({type: 'changeParticleAnimation', parameters: ['ashes', 5, 50]});
    room.addStory(`Having been frozen for 75 years, you aren't very well versed in riding a Carrybeast. You weren't even aware these were a thing!`);
    room.addStory(`So, naturally, [c:var(--character)]Palmetto [c:]has you up front piloting the thing while he holds you in place.`);
    room.addStory(`The sheer speed that you're running at pierces through the cloud of fallout around you. Everyone else seems to have masks and makeshift goggles protecting them.`);
    room.addStory(`Noting your tight grip on the beast's reins, [c:var(--character)]Palmetto [c:]lets out a boisterous howl, digging his heel further into Marisol's side.`);
    room.addStory(`[c:var(--dialogue)]"G'awn, girl, 'ye got it! Yer fine, yer fine!"`);
    room.addAction({type: 'changeParticleAnimation', parameters: ['ashes', 3, 15]});
    room.addStory(`Marisol squeaks, slowing her shuffle.`);
    room.addStory(`[c:var(--dialogue)]"Ye gotta be curr'ful wid'er. Them Carrybeasts dun' take too kindly 'ta bein' manhandled. [fst:italic]Scares 'em half 'ta death, [fst:]'n then all'a sudden yer stranded an' yer buddy's runnin' off 'ta git picked off by Butcherbirds."`);
    room.addStory(`[c:var(--character)]Palmetto [c:]runs his hand along Marisol's side.`);
    room.addStory(`[c:var(--dialogue)]"Ain't too hard if yer gentle."`);
    room.addStory(`He peers off into the distance, wings rattling behind him.`);
    room.addStory(`[c:var(--dialogue)]"Say..."`);
    room.addStory(`[c:var(--dialogue)]"How far would'ja say yer willin' 'ta go fer some justice?"`);
    choice1 = room.createChoice('Pretty far.');
    choice1.addAction({type: 'changeRoom', parameters: ['d-journey2']});
    choice2 = room.createChoice('Somewhat far.');
    choice2.addAction({type: 'changeRoom', parameters: ['d-journey2']});
    choice3 = room.createChoice('Kind of far.');
    choice3.addAction({type: 'changeRoom', parameters: ['d-journey2']});

    room = createRoom('d-journey2', {name: 'destruction.jpeg', transition: {out: '', in: ''}});
    room.addStory(`[c:var(--character)]Palmetto [c:]hums to himself, giving nothing more than a brief chitter. It's...kind of hard to gauge ow he's feeling right now.`);
    room.addStory(`[c:var(--dialogue)]"We's got...[fst:italic][c:var(--destruction)]unfinished business [fst:][c:]'ta deal with. Now thet'churr comin' along, iss'in muh bes' int'rest thet ya rilly got the guts 'ta handle this."`);
    room.addStory(`[c:var(--dialogue)]"Thurr's a camp up East'n thet we's ain't too fond of. Naw, ain't ginna get'cha all frazzled inna middle'a thet, but 'ya bet yer behind thet it's gotta git taken care'a now."`);
    room.addStory(`[c:var(--dialogue)]"Fer now, 'ye gotta git'churr practice in. Muh crew's gonna lead, an' it's yer job 'ta help Marisol follow 'em there. Capiche?"`);
    choice1 = room.createChoice(`Get to it.`);
    choice1.addAction({type: 'changeRoom', parameters: ['d-village']}); //d-wasteland grid later

    // room = createRoom(`d-wasteland`, {name: 'destruction.jpeg'});
    // let grid = new RoomGrid({name: 'd-wastelandGrid', width: 5, height: 5, showCoordinates: true})
    // room = grid.generateRoom([0, 2]);
    // room.addStory(`Marisol begins to lurch forward.`);
    // grid.generateGrid(); 

    room = createRoom(`d-village`);
    room.addStory(`Wiping the sweat from your face, you finally stop just before reaching the top of a dune. You're in the perfect position to peer down at the campsite without being spotted.`);
    room.addStory(`[c:var(--dialogue)]"Thurr it is. D'awn in'net 'ol ditch."`);
    room.addStory(`[c:var(--character)]Palmetto [c:]points down at the campsite. It's nothing too fancy. It's just a big circle closed off by a log fence. Within it there's some huts, laundry strung about, and loads of people sitting around living about as well as one could in a nuclear wasteland.`);
    room.addStory(`[c:var(--dialogue)]"Don'tcha be fooled, now. Them's all nuthin' butta load'a conniving, heartless varmints."`);
    room.addStory(`He bitterly spits the word out with a loathing sort of venom to his voice. The kind only someone...experienced...would hold.`);
    room.addStory(`[c:var(--dialogue)]"See thet?"`);
    room.addStory(`Looking closely, there's a line of smaller folks weaving in, out, and around stray poles and hopping over countless obstacles. they're squealing quite loudly as they swing around dirty rags tied to sticks.`);
    room.addStory(`[c:var(--dialogue)]"Disgustin'. They been trainin' thurr youngins fer war since day one."`);
    room.addStory(`Looking again, they do seem pretty...hefty.`);
    room.addStory(`[c:var(--destruction)]"Best 'ta take 'em out now b'fore them'alls got us'n kickin' the bucket."`);
    room.addStory(`[c:var(--dialogue)]"C'mon. We're burnin' daylight awt 'ere."`);
    room.addStory(`"Take these. Yer gunna ned 'em fer this crowd.`);
    room.addAction({type: 'getItem', parameters: [{name: 'Bandages', min: 3}]});
    room.addStory(`[c:var(--dialogue)]"An' fer the love'a all thurr's good, don'tcha go'n get yerself kil't. Ain't no one else 'round 'ere fer ya."`);
    choice1 = room.createChoice(`Nuh uh. You quit.`);
    choice1.addAction({type: 'changeRoom', parameters: ['s-start']});
    choice2 = room.createChoice(`If it's for the sake of the rest of the planet...`);
    choice2.addAction({type: 'changeRoom', parameters: ['d-villageFight']});

    room = createRoom(`d-villageFight`);
    room.addAction({type: 'encounter', parameters: [{
        enemyPool: [
            {id: 'Joyama'},
            {id: 'Virex'},
            {id: 'Murmurant'},

        ],
        rewardPool: [
            {name: 'Astrostew', min: 3, max: 5},
        ], 
        groupName: 'some desertgoers!'
    }]});
    room.addAction({type: 'changeRoom', parameters: ['d-success']});

    room = createRoom(`d-success`, {name: 'destruction.jpeg'});
    room.addAction({type: 'changeParticleAnimation', parameters: ['smoke top', 3, 1]});
    room.addStory(`The camp's been totally emptied. Their fires have been snuffed out, their supplies looted and burned, and whoever remains has escaped far into the wasteland.`);
    room.addStory(`The others are cheering with delight, rejoicing as they bask in the afterglow of victory.`);
    room.addStory(`[c:var(--dialogue)]"Ye did good, kid! Real good!"`);
    room.addStory(`[c:var(--character)]Palmetto [c:]smirks with satisfaction, grabbing your shoulder and shaking it with pride.`);
    room.addStory(`For some reason, you can't help but feel a little uneasy.`);
    room.addStory(`There's a tug in your gut as you look around the campsite. It's all completely barren now, and the only thing left is the smell of smoke, ash, and iron.`);
    room.addStory(`The others are still cheering, but you can't help but feel a little sick to your stomach.`);
    room.addStory(`Maybe this victory wasn't as clean as it seemed.`);
    room.addStory(`You look over at [c:var(--character)]Palmetto[c:] and see that he's still smiling, but there's a glint in his eye that you can't quite place.`);
    room.addStory(`[c:var(--dialogue)]"Alright, kid. Let's move. Muh crew's got a few more stops 'ta make, an' I reckon we's all got some shoppin' 'ta do."`);
    room.addStory(`He boosts you up onto Marisol, roughly scritching at her neck.`);
    room.addStory(`[c:var(--dialogue)]"I know a place 'round here we kin stop fer a bit. Could get'cha some new gear, if'n yer up fer it."`);
    room.addStory(`[c:var(--character)]Palmetto [c:]hops up behind you, wrapping his arms around your waist as he guides Marisol away from the campsite.`);
    room.addStory(`The others follow suit, and you all ride off into the distance, leaving the camp behind.`);
    room.addStory(`The sun is setting, and the sky is painted with hues of orange and pink. The air is thick and you can't get the taste of metal out of your mouth.`);
    choice1 = room.createChoice(`Head to their campsite.`);
    choice1.addAction({type: 'changeRoom', parameters: ['d-syndicate']});

    room = createRoom(`d-syndicate`, {name: 'destruction.jpeg'});
    room.addAction({type: 'changeParticleAnimation', parameters: ['ashes', 3, 1]});
    room.addStory(`You arrive at a small, rundown village in the middle of nowhere. It's filled with crude tents and shacks, all of which are in various states of disrepair.`);
    room.addStory(`The inhabitants are all wearing masks and goggles, and they all seem to be on edge. They eye you suspiciously as you ride in, and you can feel their gazes boring into your back.`);
    room.addStory(`And above all, there's almost an alarming number of them that look just like [c:var(--character)]Palmetto[c:].`);
    room.addStory(`You dismount Marisol, and [c:var(--character)]Palmetto [c:]hops off behind you.`);
    room.addStory(`[c:var(--dialogue)]"Welcome 'ta the Six-Legged Syndicate, kid. Ain't much, but it's home."`);
    room.addStory(`All around you, the inhabitants are busy working on various projects. Some are repairing machines, while others are tending to the animals. Loud chattering and laughter fills the night air.`);
    room.addStory(`You can see a few of them still eyeing you, but most seem to be too busy to care anymore.`);
    room.addStory(`[c:var(--character)]Palmetto [c:]leads you through the village, weaving in and out of the bustling crowd.`);
    room.addStory(`[c:var(--dialogue)]"We's got a few shops 'round here, if'n yer lookin' fer somethin' special."`);
    room.addStory(`[c:var(--dialogue)]"We's also got a few folks 'round here who kin help ya out with yer gear. Ain't no one else 'round here fer ya, so's yer best bet's t'git it fixed up."`);
    room.addStory(`He gestures to a small shop with a sign that reads "The Rusty Nail".`);
    room.addStory(`The shop is filled with all sorts of strange and unusual items, from weapons to armor to food. The owner, a small, scrappy-looking creature with a pair of goggles perched on their head, waves you over.`);
    room.addStory(`[c:var(--dialogue)]"Welcome to the Rusty Nail! We's got all sorts of goodies fer ya!"`);
    room.addStory(`[c:var(--character)]Palmetto [c:]nudges you with his elbow, lifting up your hand and placing his fist in your palm.`);
    room.addStory(`[c:var(--dialogue)]"Go on, kid. This'un is all'n me."`);
    room.addAction({type: 'getItem', parameters: [{name: 'Corebits', min: 25}]});
    room.addStory(`You look down at the small pile of shiny bits in your hand.`);
    room.addStory(`You can feel the weight of them, and you can't help but feel a little giddy at the thought of all the things you could buy with them.`);
    choice1 = room.createChoice(`Buy something.`);
    choice1.addAction({type: 'changeRoom', parameters: ['d-shop']});

    room = createRoom(`d-shop`, {name: 'destruction.jpeg'});
    room.addStory(`You step forward, peering at the little bits of junk on the shelves.`);
    choice1 = room.createChoice(`Buy a weapon (7 CB).`, {maxUses: 1});
    choice1.addAction({type: 'getItem', parameters: [{name: 'Rusty Pipe', min: 1}]});
    choice1.addAction({type: "removeItem", parameters: ['Corebits', 7]});
    choice2 = room.createChoice(`Buy some armor (10 CB).`, {maxUses: 1});
    choice2.addAction({type: 'getItem', parameters: [{name: 'Scrappy Armor', min: 1}]});
    choice2.addAction({type: "removeItem", parameters: ['Corebits', 10]});
    choice3 = room.createChoice(`Buy some food (5 CB).`);
    choice3.addAction({type: 'getItem', parameters: [{name: 'Astrostew', min: 1}]});
    choice3.addAction({type: "removeItem", parameters: ['Corebits', 5]});
    let choice4 = room.createChoice(`Buy some bandages (5 CB).`);
    choice4.addAction({type: 'getItem', parameters: [{name: 'Bandages', min: 1}]});
    choice4.addAction({type: "removeItem", parameters: ['Corebits', 5]});
    let choice5 = room.createChoice(`Leave the shop.`);
    choice5.addAction({type: 'changeRoom', parameters: ['d-syn2']});

    room = createRoom(`d-syn2`, {name: 'destruction.jpeg'});
    room.addStory(`You step out of the shop, feeling a little lighter in the pocket.`);
    room.addStory(`[c:var(--character)]Palmetto [c:]is still standing there, looking a little impatient.`);
    room.addStory(`[c:var(--dialogue)]"C'mon, kid. We's got a few more stops 'ta make."`);
    room.addStory(`He starts to lead you back through the village, approaching some run down stables.`);
    room.addStory(`[c:var(--dialogue)]"We's got a few spare Carrybeasts, if'n yer lookin' fer somethin' special."`);
    room.addStory(`[c:var(--character)]Palmetto[c:] gestures to a small pen filled with a few different types of Carrybeasts. There's a few different colors and sizes, but they all look pretty similar.`);
    room.addStory(`You can see a few of them are already saddled up and ready to go.`);
    room.addStory(`[c:var(--dialogue)]"So who'zzit gunna be? We's got all kinds, but them'all gunna do the same thing."`);
    choice1 = room.createChoice(`Pick the fluffy one.`);
    choice1.addAction({type: 'changeRoom', parameters: ['d-beast']});
    choice2 = room.createChoice(`Pick the cute one.`);
    choice2.addAction({type: 'changeRoom', parameters: ['d-beast']});
    choice3 = room.createChoice(`Pick the chubby one.`);
    choice3.addAction({type: 'changeRoom', parameters: ['d-beast']});

    room = createRoom(`d-beast`, {name: 'destruction.jpeg', transition: {out: '', in: ''}});
    room.addStory(`You hop onto the back of the Carrybeast, feeling a little more comfortable this time.`);
    room.addStory(`As you settle in, you can feel the warmth of the creature beneath you, and you can't help but grin.`);
    room.addStory(`The Carrybeast lets out a soft grunt, as if acknowledging your presence.`);
    room.addStory(`[c:var(--dialogue)]"Wull look'it thet! Ain't she a beaut?"`);
    room.addStory(`[c:var(--character)]Palmetto [c:]grins, patting the Carrybeast on the side.`);
    room.addStory(`[c:var(--dialogue)]"And'ja went 'n made friendly wit'er alriddy!"`);
    room.addStory(`[c:var(--character)]Palmetto helps to guide you and your Carrybeast back to the gates of the village, where the rest of the crew is waiting for you.`);
    room.addStory(`They've all gathered in a circle, and they're all looking at you expectantly.`);
    room.addStory(`You can sense the excitement in the air as you approach.`);
    room.addStory(`[c:var(--dialogue)]"Alright, naw! We's all set 'ta go!"`);
    room.addStory(`[c:var(--dialogue)]"We's got a long road ahead'a us, so's we's gotta git movin'."`);
    choice1 = room.createChoice(`Let's go!`);
    choice1.addAction({type: 'changeRoom', parameters: ['d-rushedfinale-temp']});

    room = createRoom(`d-rushedfinale-temp`, {name: 'destruction.jpeg'});
    room.addAction({type: "changeParticleAnimation", parameters: ['ashes', 3, 15]});
    room.addStory(`You and the crew have been traveling through the wasteland for what feels like centuries.`);
    room.addStory(`Town after town, you all have been looting and pillaging, taking whatever you can find.`);
    room.addStory(`The weight in your chest has been getting heavier, though you've found it easier to carry over time.`);
    room.addStory(`The crew has been getting more and more rowdy in the meantime. You've been getting used to the sound of their screeching and chittering, and it's almost uncomfortable when they fall silent nowadays.`);
    room.addStory(`Which is why you find it odd that the crew is so quiet right now.`);
    room.addStory(`You look around, and you can see that they're all staring forward with narrowed eyes.`);
    room.addStory(`You look ahead, and you can see a dark figure standing in the distance. [c:var(--character)]A tall, cloaked figure with a burlap hood. They've got their own crew with them, and they all look just as intimidating as the figure.`);
    room.addStory(`[c:var(--character)]Palmetto [c:]hisses, his wings rattling behind him.`);
    room.addStory(`[c:var(--dialogue)]"Thurr it is. Thet's the one we's been lookin' fer."`);
    room.addStory(`The figure raises their hand, and the crew behind them starts to move.`);
    room.addStory(`[c:var(--dialogue)][fst:italic]"Oi, [c:var(--Gali)]Gali![c:var(--dialogue)]"`);
    room.addStory(`Suddenly, you find that [c:var(--character)]Palmetto [c:]is thrusting his shotgun into your hands.`);
    room.addStory(`[c:var(--dialogue)]"Ye got th'better shot standin' there, kid. Take it!"`);
    room.addStory(`You look down at the shotgun, and you can feel the weight of it in your hands. It's heavy, but it feels good. Natural, almost.`);
    room.addStory(`You can feel the adrenaline pumping through your veins as you raise the gun to your shoulder, aiming it at the figure in the distance.`);
    choice1 = room.createChoice(`Take the shot.`);
    choice1.addAction({type: 'changeRoom', parameters: ['d-end']});

    room = createRoom(`d-end`, {name: 'destruction.jpeg', transition: {out: '', in: ''}});
    room.addStory(`You pull the trigger, and the gun goes off with a-`);
    room.addStory(`[c:var(--actions)](BANG!)`);
    room.addStory(`[c:var(--dialogue)][fst:italic]"AUGH!"`);
    room.addAction({type: 'styleBG', parameters: ['[an:shake 70ms 9 linear alternate][sc:1.2]']});
    room.addStory(`[c:var(--actions)](Thud!)`);
    room.addStory(`The figure falls to the ground, and you can hear the sound of their crew screaming in terror.`);
    room.addStory(`[c:var(--character)]Palmetto [c:]and the rest of the crew start charging forward.`);
    room.addStory(`The smell of gunpowder still lingers in the air. The weight in your heart is now gone.`);
    room.addStory(`You feel oddly...freed.`);
    room.addStory(`It appears that [c:var(--character)]Palmetto [c:]is still standing before you, hand outstretched to yours.`);
    choice1 = room.createChoice(`Conquer the wasteland.`);
    choice1.addAction({type: 'ending', parameters: ['destruction']});
}