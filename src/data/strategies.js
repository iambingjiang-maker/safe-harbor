/**
 * Good Inside-inspired strategies, scripts, and reframes tailored specifically
 * for parents of a 4-year-old who tests boundaries, gets overtired easily,
 * and can become so flooded/angry he cannot hear words.
 *
 * Dynamic token `{child}` is replaced at render time with the family's child name.
 */

export const TRIGGERS = [
  {
    id: 'flooded',
    label: "Flooded / Can't Hear Us",
    shortLabel: 'Flooded',
    subtitle: 'Crying hard, screaming, zero-to-60 — logic won’t land',
    reframe:
      'His nervous system is flooded with cortisol and his thinking brain is temporarily offline. Connection and calm presence come first; words and lessons come later.',
    defaultLowWords: true,
    urgency: 'high',
  },
  {
    id: 'boundaries',
    label: 'Testing Boundaries',
    shortLabel: 'Boundaries',
    subtitle: 'Pushing limits, saying "No!", ignoring requests',
    reframe:
      'Boundary testing at 4 is not defiance—it is your child checking: "Are you sturdy enough to hold the wall when I feel big and wild?"',
    defaultLowWords: false,
    urgency: 'high',
  },
  {
    id: 'physical',
    label: 'Angry / Physical Urges',
    shortLabel: 'Physical',
    subtitle: 'Hitting, kicking, throwing, slamming doors',
    reframe:
      'Aggression is a fear-and-cortisol surge, not a bad kid. Stopping his body calmly protects him from shame and teaches him you will keep everyone safe.',
    defaultLowWords: true,
    urgency: 'high',
  },
  {
    id: 'dfk',
    label: 'Escalates When We Talk',
    shortLabel: 'Talk Backfires',
    subtitle: 'Validating or reasoning makes him angrier ("Deeply Feeling" mode)',
    reframe:
      'Some deeply feeling 4-year-olds feel exposed and shamed when feelings are narrated mid-storm. Drop the words and become a quiet, steady anchor.',
    defaultLowWords: true,
    urgency: 'high',
  },
  {
    id: 'overtired',
    label: 'Overtired Crash',
    shortLabel: 'Overtired',
    subtitle: 'End-of-day collapse, tiny trigger → massive explosion',
    reframe:
      'An overtired 4-year-old has zero emotional buffer left. Drop non-essential demands, lend him your calm nervous system, and get through the evening safely.',
    defaultLowWords: true,
    urgency: 'medium',
  },
  {
    id: 'transitions',
    label: 'Transition Meltdown',
    shortLabel: 'Transitions',
    subtitle: 'Ending screens, leaving the park, bedtime, getting dressed',
    reframe:
      'Switching gears requires executive function that 4-year-olds are still building. Joining his world briefly—then holding the boundary—reduces the shock.',
    defaultLowWords: false,
    urgency: 'medium',
  },
  {
    id: 'frustrated',
    label: 'Frustrated / Stuck',
    shortLabel: 'Frustrated',
    subtitle: '"I can’t do it!", perfectionism, plan changed',
    reframe:
      'He is in the "learning space," where not knowing yet feels scary. Stay beside him in the frustration without rushing to fix or dismiss it.',
    defaultLowWords: false,
    urgency: 'medium',
  },
  {
    id: 'sharing',
    label: 'Sharing / Waiting',
    shortLabel: 'Sharing',
    subtitle: 'Sibling conflict, taking turns, fairness battles',
    reframe:
      'At 4, impulse control is tiny and desires feel urgent. Sportscast what you see neutrally, hold safety, and protect turns rather than forcing fake generosity.',
    defaultLowWords: false,
    urgency: 'medium',
  },
];

export const PARENT_MANTRAS = [
  {
    text: '{child} is a good kid having a hard time.',
    sub: 'Separate the child (good inside) from the behavior (struggling right now).',
  },
  {
    text: 'I am the pilot in turbulence. Calm voice, steady hands.',
    sub: 'He doesn’t need me to stop the storm—he needs to see I’m not afraid of it.',
  },
  {
    text: 'My job is to hold the boundary. His job is to have his feelings.',
    sub: 'Two things are true: the limit stays, and he is allowed to hate it.',
  },
  {
    text: 'This is not an emergency. Fewer words, slower breath.',
    sub: 'When he can’t hear me, my calm body says more than ten sentences ever could.',
  },
  {
    text: 'I am doing my job well even when no one is happy right now.',
    sub: 'Sturdy leadership isn’t permissive and isn’t harsh—it is firm and warm.',
  },
  {
    text: 'Connection before correction. Repair is always available later.',
    sub: 'We don’t have to teach the lesson while his brain is flooded.',
  },
];

export const CONTEXT_TAGS = [
  'Before dinner',
  'Bedtime',
  'Morning rush',
  'After preschool',
  'Screen off',
  'In public',
  'Hungry',
  'Car / stroller',
];

export const STRATEGIES = [
  // ── FLOODED / CAN'T HEAR US ───────────────────────────────
  {
    id: 'calm-body-fewest-words',
    title: 'Calm Body, Fewest Words',
    principle: 'Co-Regulation',
    triggers: ['flooded', 'overtired', 'dfk'],
    worksWhenTired: true,
    lowWords: true,
    mgi: 'When {child} is crying or screaming so hard he can’t hear us, extra words feel like loud static to an overloaded brain.',
    scriptFlooded: '“{child}, you’re safe. I’m right here.”',
    scriptStandard:
      '“I’m right here, {child}. You’re safe. You don’t have to say anything—I’m staying close until your body feels calmer.”',
    bodyAction:
      'Drop below eye level, unclench your jaw, exhale audibly (slowly), and sit within arm’s reach. Say one short phrase, then pause in silence for 20–30 seconds.',
    avoid: [
      'Explaining why the rule makes sense mid-scream',
      'Asking "Why are you crying?" or "Use your words!"',
      'Raising your volume to talk over him',
    ],
  },
  {
    id: 'validate-magnitude',
    title: 'Validate the Magnitude',
    principle: 'Remove Aloneness',
    triggers: ['flooded', 'transitions', 'frustrated'],
    worksWhenTired: false,
    lowWords: false,
    mgi: 'Feelings aren’t as overwhelming as feeling alone inside them. Matching the size of his feeling shows him you truly get it.',
    scriptFlooded: '“So big, {child}. Huge mad. I see you.”',
    scriptStandard:
      '“You are SO mad right now—as mad as this whole room, no, this whole house! I’m glad I know how huge this feels. I’m staying right here with you.”',
    bodyAction:
      'Match his intensity slightly with sincere, steady warmth (not mockery), then let your voice gently soften downward so his nervous system can follow.',
    avoid: [
      'Minimizing ("It’s just a blue cup, it’s not a big deal")',
      'Jumping straight to solutions before he feels heard',
    ],
  },
  {
    id: 'small-safe-space',
    title: 'Small Safe Space ("Time-In")',
    principle: 'Sturdy Presence',
    triggers: ['flooded', 'physical', 'overtired'],
    worksWhenTired: true,
    lowWords: true,
    mgi: 'Big open rooms, siblings, or public audiences overload a flooded 4-year-old. Moving together to a quiet space removes stimulation—not love.',
    scriptFlooded: '“Too loud out here. Coming with you to your room. I’m staying.”',
    scriptStandard:
      '“Your body feels really out of control right now, {child}. I’m going to carry you to a quiet room and sit right next to you until the big feeling passes.”',
    bodyAction:
      'Calmly carry or guide him to a smaller, quieter room (or the car if in public). Sit on the floor near the door—calm, warm, unhurried—and wait out the wave.',
    avoid: [
      'Closing him in a room alone (time-out fuels panic and shame)',
      'Threatening "Go to your room until you can act nicely!"',
    ],
  },
  {
    id: 'pilot-in-turbulence',
    title: 'Ride the Wave (Pilot in Turbulence)',
    principle: 'Sturdy Leadership',
    triggers: ['flooded', 'boundaries', 'transitions'],
    worksWhenTired: true,
    lowWords: true,
    mgi: 'A cortisol meltdown wave naturally peaks and drops in minutes if we don’t accidentally add fuel by fighting, lecturing, or caving.',
    scriptFlooded: '“Big wave, {child}. I’ve got us. I’m right here.”',
    scriptStandard:
      '“This feels awful right now, {child}, and I’m not scared of your big feelings. We’re going to ride this wave together until your body slows down.”',
    bodyAction:
      'Plant both feet on the floor. Picture yourself as a calm airline pilot announcing turbulence. Keep your face soft and relaxed rather than tense or pleading.',
    avoid: [
      'Negotiating or changing your boundary just to stop the crying',
      'Looking panicked or begging him to stop',
    ],
  },

  // ── ESCALATES WHEN WE TALK (DFK MODE) ─────────────────────
  {
    id: 'silent-sturdy-anchor',
    title: 'Silent Sturdy Anchor (Zero-Talk Mode)',
    principle: 'Deeply Feeling Kid',
    triggers: ['dfk', 'flooded', 'overtired'],
    worksWhenTired: true,
    lowWords: true,
    mgi: 'For deeply feeling kids, hearing "I see you’re mad!" can trigger instant shame ("You’re watching me lose control!"). Silent proximity feels safer than narration.',
    scriptFlooded: '(No words—just calm breathing and steady presence 3–5 feet away.)',
    scriptStandard:
      '(Stay completely quiet. If he yells "Go away!", say softly once:) “I’m giving you space right over here by the door. I love you.”',
    bodyAction:
      'Turn your body slightly sideways (less confrontational than staring straight at him), sit on the floor, relax your hands, and breathe slowly without demanding eye contact.',
    avoid: [
      'Narrating his feelings out loud when talking clearly ramps him up',
      'Hovering inches from his face or forcing hugs',
      'Walking out in anger ("Fine, be alone then!")',
    ],
  },
  {
    id: 'micro-whisper-goodness',
    title: '4-Word Goodness Anchor',
    principle: 'Deeply Feeling Kid',
    triggers: ['dfk', 'physical', 'flooded'],
    worksWhenTired: true,
    lowWords: true,
    mgi: 'Underneath explosive anger, a 4-year-old often secretly feels "I’m bad." A tiny, low-pressure anchor reminds him he is still loved without demanding a reply.',
    scriptFlooded: '“Good kid. Hard moment.”',
    scriptStandard:
      '“{child}, you’re a good kid having a really hard moment. I’m not going anywhere.”',
    bodyAction:
      'Say it once in a low, grounded tone—almost like a gentle anchor dropped in water—and then stop talking. Let the words sit without asking for any response.',
    avoid: [
      'Adding "but..." right after ("You’re a good kid, BUT you can’t act like this!")',
      'Repeating it five times in a row',
    ],
  },
  {
    id: 'sensory-reset-no-demands',
    title: 'Silent Sensory Offer (No Questions)',
    principle: 'Deeply Feeling Kid',
    triggers: ['dfk', 'overtired', 'flooded'],
    worksWhenTired: true,
    lowWords: true,
    mgi: 'A flooded nervous system can’t answer questions ("Do you want water? A hug?"). Quietly placing a regulating sensory cue nearby lets him choose on his own terms.',
    scriptFlooded: '“Water’s right here if your body wants it.”',
    scriptStandard:
      '“I’m putting your cold water cup and cozy blanket right here next to you, {child}. No rush—I’m just sitting here.”',
    bodyAction:
      'Dim harsh overhead lights, quietly place a cup of cold water, a favorite stuffed animal, or a heavy blanket within reach, then sit calmly nearby.',
    avoid: [
      'Rapid-fire questions ("Do you want water? Blanket? Hug? Music?")',
      'Insisting he take a deep breath while mid-rage',
    ],
  },

  // ── TESTING BOUNDARIES (4-YEAR-OLD STURDY LEADERSHIP) ─────
  {
    id: 'true-boundary-what-i-will-do',
    title: 'True Boundary ("What I Will Do")',
    principle: 'Sturdy Leadership',
    triggers: ['boundaries', 'transitions', 'physical'],
    worksWhenTired: true,
    lowWords: true,
    mgi: 'A real boundary tells {child} what YOU will do—and requires him to do nothing. When he can’t stop himself, stepping in calmly is doing our job, not punishing.',
    scriptFlooded: '“Too hard to stop. I’m picking you up safely.”',
    scriptStandard:
      '“{child}, it looks too hard for your body to get off the table right now. I’m going to pick you up and put your feet safely on the floor.”',
    bodyAction:
      'Move closer BEFORE speaking so you aren’t shouting across the room. State the boundary once in a matter-of-fact voice, then calmly follow through with your body.',
    avoid: [
      'Repeating the same request 5 times louder each time',
      'Counting "1... 2... 2 and a half..."',
      'Empty threats ("If you don’t stop, no dessert forever!")',
    ],
  },
  {
    id: 'two-things-are-true',
    title: 'Two Things Are True',
    principle: 'Two Things Are True',
    triggers: ['boundaries', 'transitions', 'sharing'],
    worksWhenTired: false,
    lowWords: false,
    mgi: 'We don’t have to choose between holding a firm limit and honoring his feelings. Both realities exist at the exact same time.',
    scriptFlooded: '“TV is off, and you’re mad. Both are okay.”',
    scriptStandard:
      '“Two things are true, {child}: screen time is all done for today, and you’re allowed to be really upset about it. It’s so hard to stop fun things.”',
    bodyAction:
      'Hold the boundary physically (turn off TV / put item away calmly) while keeping your face warm and unbothered by his protest.',
    avoid: [
      'Convincing him he shouldn’t be upset ("You already watched two shows, be grateful!")',
      'Saying "Okay, 5 more minutes" after already calling time',
    ],
  },
  {
    id: 'step-out-of-power-struggle',
    title: 'Step Out of the Power Struggle',
    principle: 'End Power Struggles',
    triggers: ['boundaries', 'transitions'],
    worksWhenTired: true,
    lowWords: false,
    mgi: 'When a 4-year-old digs in and we dig in harder, his nervous system treats it like a threat. Dropping the rope while keeping the limit breaks the tug-of-war.',
    scriptFlooded: '“Not fighting you. Pajamas go on next—I’m here to help.”',
    scriptStandard:
      '“{child}, I don’t want to fight with you—we’re on the same team. Putting on shoes is happening, and I know you hate stopping play. Want to do it yourself or have my helper hands?”',
    bodyAction:
      'Drop your shoulders, take one step closer instead of leaning over him, and switch from an adversarial "me vs. you" tone to a calm team-leader tone.',
    avoid: [
      'Matching his defiant energy ("Because I said so!")',
      'Debating or lecturing a 4-year-old about respect',
    ],
  },
  {
    id: 'two-choice-agency',
    title: 'Two Approved Choices Inside the Limit',
    principle: 'Healthy Agency',
    triggers: ['boundaries', 'transitions', 'overtired'],
    worksWhenTired: false,
    lowWords: false,
    mgi: '4-year-olds crave autonomy. Giving him a real choice inside a non-negotiable boundary fills his need for power without giving up leadership.',
    scriptFlooded: '“Bath time. Walk like a bear, or Mom carries you?”',
    scriptStandard:
      '“It’s time to get in the car, {child}. Do you want to climb in like a superhero yourself, or do you want me to fly you in like an airplane?”',
    bodyAction:
      'Make sure BOTH choices are ones you happily accept. If he refuses both, calmly say, "Looks like it’s hard to choose, so I’ll help your body this time," and follow through kindly.',
    avoid: [
      'Disguising a threat as a choice ("Put on your coat or no park!")',
      'Offering 5+ open-ended options when he is tired',
    ],
  },
  {
    id: 'name-the-wish',
    title: 'Name the Wish ("Magic Wand")',
    principle: 'Validation & Connection',
    triggers: ['boundaries', 'transitions', 'sharing'],
    worksWhenTired: false,
    lowWords: false,
    mgi: 'Saying his unspoken wish out loud proves you understand his heart—even when the answer is still a firm no.',
    scriptFlooded: '“You wish you could stay forever. I know. Time to go.”',
    scriptStandard:
      '“You wish you could play at the park all night long until the moon comes up! I wish we had a magic wand for extra playtime too, {child}. And right now it’s time to head home.”',
    bodyAction:
      'Use warm, imaginative empathy for 5 seconds, then pivot cleanly to the boundary with "And..." (not "But...").',
    avoid: [
      'Using "but" ("I know you want to stay, BUT we have to make dinner")',
      'Arguing with his wish ("You can’t stay all night, it’s dark!")',
    ],
  },

  // ── ANGRY / PHYSICAL URGES ────────────────────────────────
  {
    id: 'safety-boundary-wont-let-you',
    title: 'Safety Boundary ("I Won’t Let You…")',
    principle: 'Safety Boundary',
    triggers: ['physical', 'boundaries', 'flooded'],
    worksWhenTired: true,
    lowWords: true,
    mgi: 'When cortisol hijacks his arms and legs, he is scared of his own loss of control. Blocking the hit firmly and calmly makes him feel safe.',
    scriptFlooded: '“I won’t let you hit. Keeping us safe.”',
    scriptStandard:
      '“I won’t let you hit or throw toys, {child}. I’m holding your hands gently to keep everyone safe. You can be super mad, and I will keep bodies safe.”',
    bodyAction:
      'Step in quickly and neutrally—block the hit, gently hold wrists if needed, or move throwable items out of reach without anger or roughness.',
    avoid: [
      'Yelling "NO HITTING! Bad boy!"',
      'Hitting back or grabbing harshly in frustration',
      'Guilt-tripping ("You hurt Mommy’s feelings so much!")',
    ],
  },
  {
    id: 'redirect-body-urge',
    title: 'Safe Target for Big Body Energy',
    principle: 'Work With the Urge',
    triggers: ['physical', 'flooded', 'frustrated'],
    worksWhenTired: false,
    lowWords: true,
    mgi: 'Anger is physical energy looking for an exit. Giving his hands and feet a safe job channels the urge without shaming the emotion.',
    scriptFlooded: '“Hands can’t hit me. Push my hands HARD—go!”',
    scriptStandard:
      '“Your body has HUGE mad energy right now, {child}! I won’t let you kick people—you can stomp as hard as you can on this pillow or push against my hands!”',
    bodyAction:
      'Hold up your flat palms for him to push against (heavy proprioceptive input calms the nervous system fast), or toss a couch cushion on the floor for stomping.',
    avoid: [
      'Telling him to "sit still and calm down" while his body is vibrating with adrenaline',
      'Waiting until he’s already thrown something to offer an outlet',
    ],
  },
  {
    id: 'protect-your-body-no-guilt',
    title: 'Step Back Without Guilt-Tripping',
    principle: 'Sturdy Leadership',
    triggers: ['physical', 'dfk'],
    worksWhenTired: true,
    lowWords: true,
    mgi: 'Protecting yourself calmly teaches healthy boundaries without making a 4-year-old feel responsible for managing an adult’s emotions.',
    scriptFlooded: '“I’m stepping back to keep my body safe. Still right here.”',
    scriptStandard:
      '“I know you’re really upset, {child}. I can’t stay close while you’re kicking at me, so I’m moving two steps back to keep my body safe—and I’m staying right here in the room with you.”',
    bodyAction:
      'Move just out of kicking/hitting range while keeping your posture relaxed and staying in the same room so he knows you haven’t abandoned him.',
    avoid: [
      'Saying "When you hit me, it makes Daddy so sad"',
      'Storming out of the room and slamming the door',
    ],
  },

  // ── OVERTIRED CRASH ───────────────────────────────────────
  {
    id: 'drop-demands-coregulate',
    title: 'Drop Non-Essential Demands',
    principle: 'Overtired Triage',
    triggers: ['overtired', 'flooded', 'transitions'],
    worksWhenTired: true,
    lowWords: true,
    mgi: 'When his tank is at 0%, normal 4-year-old skills (putting on PJs, walking upstairs, picking up toys) vanish. Doing the task WITH or FOR him isn’t spoiling—it’s triage.',
    scriptFlooded: '“Tired body tonight. I’ll carry you and do the PJs.”',
    scriptStandard:
      '“Your body worked so hard all day, {child}, and your battery is totally empty. You don’t have to do this by yourself tonight—I’m going to help you with pajamas and carry you up.”',
    bodyAction:
      'Lower lights, lower your voice to a warm whisper, skip the toy-cleanup battle for tonight, and physically assist through bedtime basics.',
    avoid: [
      'Insisting on independence ("You’re 4! You put your own socks on this morning!")',
      'Turning an overtired evening into a discipline lesson',
    ],
  },
  {
    id: 'playful-bridge',
    title: 'Playful Bridge (Before Full Meltdown)',
    principle: 'Connection Capital',
    triggers: ['overtired', 'transitions', 'boundaries'],
    worksWhenTired: true,
    lowWords: false,
    mgi: 'Playfulness speaks a 4-year-old’s native language and shifts his brain from fight-or-flight into connection before a meltdown locks in.',
    scriptFlooded: '“Wait… do pajama pants go on your HEAD?!”',
    scriptStandard:
      '“Uh oh, {child}’s toothbrush says it’s hungry for dinosaur teeth! Wait—are there tiny blueberries hiding in the back? Let me check!”',
    bodyAction:
      'Use light silliness, goofy voices, or a 10-second race ONLY during early friction—if he’s already full-blown crying/flooded, switch to Calm Body, Fewest Words instead.',
    avoid: [
      'Forcing silliness once he’s already furious (can feel dismissive mid-rage)',
      'Getting frustrated if he doesn’t laugh right away',
    ],
  },
  {
    id: 'soft-landing-rhythm',
    title: 'The Soft Landing (Hold, Sway, Hum)',
    principle: 'Co-Regulation',
    triggers: ['overtired', 'flooded'],
    worksWhenTired: true,
    lowWords: true,
    mgi: 'Sometimes an overtired 4-year-old just needs to release a whole day of holding it together in a safe pair of arms.',
    scriptFlooded: '“Big day, sweetie. Let it all out. I’ve got you.”',
    scriptStandard:
      '“It was such a big day, {child}. You can cry right here in my lap—I’ve got you safe and warm.”',
    bodyAction:
      'Sit in a dim room, offer open arms (don’t force if he resists), sway slowly, hum a steady low rhythm, and take slow deep breaths so his chest feels your pace.',
    avoid: [
      'Shushing impatiently or saying "Stop crying, it’s bedtime"',
      'Checking your phone while holding him',
    ],
  },

  // ── TRANSITIONS ───────────────────────────────────────────
  {
    id: 'join-before-leading',
    title: 'Join His World Before Leading Out',
    principle: 'Connection Before Direction',
    triggers: ['transitions', 'boundaries'],
    worksWhenTired: false,
    lowWords: false,
    mgi: 'Abruptly pulling a 4-year-old out of deep play feels like someone yanking a book out of our hands mid-chapter. 30 seconds of joining makes leaving way smoother.',
    scriptFlooded: '“Cool tower! Taking a photo to save it. Now dinner.”',
    scriptStandard:
      '“Whoa, {child}, look how long that train track is! Where is the red train heading? Let’s park it right at the station so it’s safe while we eat dinner.”',
    bodyAction:
      'Get down on the floor beside him for 30 real seconds, show genuine curiosity in his play, create a "pause point" (photo or parking spot), then transition calmly.',
    avoid: [
      'Calling "Time to go!" from another room three times',
      'Snatching the toy or turning off the screen without warning',
    ],
  },

  // ── FRUSTRATED / STUCK ────────────────────────────────────
  {
    id: 'jump-into-the-hole',
    title: 'Jump Into the Hole With Him',
    principle: 'The Learning Space',
    triggers: ['frustrated', 'flooded'],
    worksWhenTired: false,
    lowWords: false,
    mgi: 'When a 4-year-old yells "I CAN’T DO IT!", he feels alone in the hard "not-yet" space. Sitting beside him in the frustration builds real resilience.',
    scriptFlooded: '“Ugh, so frustrating! That piece is tricky. I’m right here.”',
    scriptStandard:
      '“Ugh, that is SO frustrating, {child}! You tried and it still popped apart—no wonder your body wants to throw it. Learning something new feels yucky at first. I’m right here with you.”',
    bodyAction:
      'Sit right next to him, resist grabbing the toy to fix it for him, and wait until his shoulders drop before asking if he wants a tiny team-up.',
    avoid: [
      'Jumping in with "It’s easy! Watch, just do it like this!"',
      'Toxic positivity ("Don’t cry, you’re fine, just try again!")',
    ],
  },
  {
    id: 'team-up-micro-step',
    title: 'Team-Up Micro-Step',
    principle: 'Build Confidence',
    triggers: ['frustrated', 'overtired'],
    worksWhenTired: true,
    lowWords: false,
    mgi: 'Splitting a hard task into a tiny shared step restores momentum without stealing his feeling of capability.',
    scriptFlooded: '“Let’s be a team. I hold the bottom, you pull up.”',
    scriptStandard:
      '“You don’t have to do the whole thing alone, {child}. Want me to start the zipper at the bottom and you zoom it all the way up?”',
    bodyAction:
      'Handle just the hardest 10% of the step, then let him finish the satisfying part and notice his effort ("You stuck with that even when it felt tricky!").',
    avoid: [
      'Taking over the entire task out of impatience',
      'Over-praising with hollow "Good job!" instead of noticing effort',
    ],
  },

  // ── SHARING / WAITING ─────────────────────────────────────
  {
    id: 'sportscast-protect-turns',
    title: 'Neutral Sportscast + Protect Turns',
    principle: 'Sturdy Leadership',
    triggers: ['sharing', 'physical', 'boundaries'],
    worksWhenTired: false,
    lowWords: false,
    mgi: 'Waiting for a coveted toy is agony for a 4-year-old. Being a neutral narrator—not a courtroom judge—calms the scramble and teaches true turn-taking.',
    scriptFlooded: '“Both want the truck. No grabbing. {child}, you’re next.”',
    scriptStandard:
      '“Two kids really want the red truck right now! I won’t let anyone grab. It’s still his turn, and {child}, you really wish you had it right now. Want to hold my hand while we wait, or find a helper toy?”',
    bodyAction:
      'Place a calm hand between the kids if grabbing starts, keep your voice neutral (no blaming), and help the waiting child bridge the wait.',
    avoid: [
      'Forcing a child to hand over a toy mid-play ("Be nice and share!")',
      'Interrogating "Who had it first?! Who hit?!"',
    ],
  },

  // ── AFTER THE STORM: REPAIR ───────────────────────────────
  {
    id: 'after-storm-repair',
    title: 'After-the-Storm Story & Repair',
    principle: 'Repair (When Calm)',
    triggers: ['flooded', 'boundaries', 'physical', 'dfk'],
    worksWhenTired: false,
    lowWords: false,
    mgi: 'Use this ONLY later when everyone is fully calm (even at bedtime). Naming what happened integrates the memory—and repairing if WE yelled builds massive trust.',
    scriptFlooded: '“Earlier was so hard. We got through it. I love you.”',
    scriptStandard:
      '“Remember earlier when {child} got super mad about leaving? Your body felt so big and loud, and I stayed right with you until you calmed down. (If we yelled:) And I’m sorry I yelled—that wasn’t okay. I’m working on staying calm. You’re always a good kid.”',
    bodyAction:
      'Bring it up casually during a calm, connected moment (bath, bedtime, snack)—keep it brief, warm, and shame-free. Zero lectures.',
    avoid: [
      'Ending an apology with "I’m sorry I yelled, BUT you pushed my buttons"',
      'Forcing him to say "I’m sorry" before he is genuinely regulated',
    ],
  },
];

export const CORE_PILLARS = [
  {
    title: 'Good Inside (MGI)',
    summary:
      'Separate who he is (good inside) from his behavior (a 4-year-old struggling with big urges). Ask: What is my Most Generous Interpretation right now?',
  },
  {
    title: 'Sturdy Leadership',
    summary:
      'Neither harsh nor permissive. You are the calm pilot in turbulence: warm empathy for his feelings + firm follow-through on safety and limits.',
  },
  {
    title: 'Two Things Are True',
    summary:
      'You can hold a boundary AND allow him to hate it at the exact same time. It’s your job to hold the wall; it’s his job to have feelings about it.',
  },
  {
    title: 'True Boundaries',
    summary:
      'A boundary states what YOU will do and requires your child to do nothing. Move closer, speak once, and follow through calmly instead of repeating or threatening.',
  },
  {
    title: 'Flooded = Fewer Words',
    summary:
      'When he is crying or raging so hard he can’t hear you (or is overtired), logic backfires. Drop words, lower your body, and lend him your calm nervous system.',
  },
  {
    title: 'Repair Beats Perfection',
    summary:
      'You will lose your cool sometimes—you are good inside too. Coming back later to own your reaction without blame builds deep resilience and trust.',
  },
];

export function formatScript(text, childName) {
  if (!text) return '';
  const name = (childName || 'Buddy').trim() || 'Buddy';
  return text.replace(/\{child\}/g, name);
}

export function getTriggerById(triggerId) {
  return TRIGGERS.find((t) => t.id === triggerId) || TRIGGERS[0];
}

export function createSampleLogs(parent1Name = 'Mom', parent2Name = 'Dad') {
  const now = Date.now();
  const h = 3600 * 1000;
  return [
    {
      id: crypto.randomUUID(),
      createdAt: new Date(now - 2 * h).toISOString(),
      parentName: parent2Name,
      triggerId: 'boundaries',
      strategyId: 'true-boundary-what-i-will-do',
      strategyTitle: 'True Boundary ("What I Will Do")',
      outcome: 'helped',
      wasTired: true,
      wasFlooded: false,
      contextTags: ['Before dinner'],
      notes: 'Refused to get off the kitchen stool. Picked him up calmly instead of repeating 5 times—cried 2 mins then settled.',
    },
    {
      id: crypto.randomUUID(),
      createdAt: new Date(now - 14 * h).toISOString(),
      parentName: parent1Name,
      triggerId: 'flooded',
      strategyId: 'silent-sturdy-anchor',
      strategyTitle: 'Silent Sturdy Anchor (Zero-Talk Mode)',
      outcome: 'helped',
      wasTired: true,
      wasFlooded: true,
      contextTags: ['Bedtime'],
      notes: 'Couldn’t hear anything when screaming about pajamas. Stopped talking, sat by the door quietly—he came over for a hug after 4 mins.',
    },
    {
      id: crypto.randomUUID(),
      createdAt: new Date(now - 26 * h).toISOString(),
      parentName: parent1Name,
      triggerId: 'dfk',
      strategyId: 'validate-magnitude',
      strategyTitle: 'Validate the Magnitude',
      outcome: 'escalated',
      wasTired: true,
      wasFlooded: true,
      contextTags: ['After preschool'],
      notes: 'Too many words while overtired—he yelled "STOP TALKING!" Switching to silence helped next.',
    },
    {
      id: crypto.randomUUID(),
      createdAt: new Date(now - 38 * h).toISOString(),
      parentName: parent2Name,
      triggerId: 'transitions',
      strategyId: 'two-things-are-true',
      strategyTitle: 'Two Things Are True',
      outcome: 'helped',
      wasTired: false,
      wasFlooded: false,
      contextTags: ['Screen off'],
      notes: 'Turned TV off cleanly and said "TV is off and you’re allowed to be mad." Way faster recovery than negotiating.',
    },
    {
      id: crypto.randomUUID(),
      createdAt: new Date(now - 52 * h).toISOString(),
      parentName: parent1Name,
      triggerId: 'physical',
      strategyId: 'redirect-body-urge',
      strategyTitle: 'Safe Target for Big Body Energy',
      outcome: 'somewhat',
      wasTired: true,
      wasFlooded: true,
      contextTags: ['Before dinner', 'Hungry'],
      notes: 'Pushing against my hands slowed the kicking, then needed a snack + quiet room.',
    },
    {
      id: crypto.randomUUID(),
      createdAt: new Date(now - 74 * h).toISOString(),
      parentName: parent2Name,
      triggerId: 'boundaries',
      strategyId: 'two-choice-agency',
      strategyTitle: 'Two Approved Choices Inside the Limit',
      outcome: 'helped',
      wasTired: false,
      wasFlooded: false,
      contextTags: ['Morning rush'],
      notes: 'Asked if he wanted to stomp like a dinosaur or hop like a frog to get shoes on—zero meltdown!',
    },
  ];
}
