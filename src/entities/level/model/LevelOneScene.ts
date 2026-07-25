import { Scene } from 'phaser';
import { EventBus } from '../../../shared/lib/phaser/EventBus';
import { TextureKeys } from '../../../shared/lib/phaser/AssetRegistry';
import { useGameStore } from '../../../shared/model/useGameStore';
import { LEVEL1_CONFIG } from '../config/level1.config';
import { LEVEL0_CONFIG } from '../config/level0.config';

/**
 * SCENE_CONFIG: Centralized game balance parameters (Kaizen)
 */
const SCENE_CONFIG = {
    PLAYER: {
        SPEED: 200,
        JUMP_FORCE: -450,
        SCALE: 0.5,
        HITBOX: { width: 60, height: 88, offsetX: 34, offsetY: 40 } // Grounded feet (40+88=128)
    },
    ENEMY: {
        SPEED: 150,
        DAMAGE: 10,
        SCALE: 0.5,
        PATROL_RANGE: { min: 675, max: 1100 }
    },
    SPIKES: {
        DAMAGE: 20,
        HITBOX: { width: 62, height: 16, offsetX: 1, offsetY: 28 } // Perfect match for peaks (48+16=64)
    },
    DURATIONS: {
        KNOCKBACK: 300,
        INVULNERABILITY: 1000,
        FLICKER_INTERVAL: 100
    },
    LEVEL: {
        WIDTH: 1600,
        XP_PER_COIN: 50,
        XP_TO_LEVEL: 100
    }
};

export class LevelOneScene extends Scene {
    // Physics Groups & Objects
    private player: Phaser.Physics.Arcade.Sprite | null = null;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
    private platforms: Phaser.Physics.Arcade.StaticGroup | null = null;
    private coins: Phaser.Physics.Arcade.Group | null = null;
    private spikes: Phaser.Physics.Arcade.Group | null = null;
    private enemies: Phaser.Physics.Arcade.Group | null = null;
    private potions: Phaser.Physics.Arcade.Group | null = null;
    private masterNPC: Phaser.Physics.Arcade.Sprite | null = null;
    private portal: Phaser.Physics.Arcade.Sprite | null = null;
    private playerSpeechBubble: Phaser.GameObjects.Container | null = null;
    private npcSpeechBubble: Phaser.GameObjects.Container | null = null;
    private auraParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
    private crownParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
    private sandLifts: Phaser.Physics.Arcade.Group | null = null;
    private crumblyBridges: Phaser.Physics.Arcade.StaticGroup | null = null;
    private conditionalGates: Phaser.Physics.Arcade.StaticGroup | null = null;

    // State Flags
    private isInvulnerable: boolean = false;
    private isLocked: boolean = false;
    private isKnockback: boolean = false;
    private hasTriggeredQuiz: boolean = false;

    private resetState() {
        this.isInvulnerable = false;
        this.isLocked = false;
        this.isKnockback = false;
        this.hasTriggeredQuiz = false;
        if (this.physics && this.physics.world) {
            this.physics.resume();
        }
        if (this.sound) {
            this.sound.resumeAll();
        }
    }

    // HUD elements
    private hudHealthBar: Phaser.GameObjects.Graphics | null = null;
    private hudXpText: Phaser.GameObjects.Text | null = null;
    private hudBackpackText: Phaser.GameObjects.Text | null = null;
    private levelText: Phaser.GameObjects.Text | null = null;
    private wasd: Record<string, Phaser.Input.Keyboard.Key> | null = null;

    // HUD caching for performance
    private lastHp: number = -1;
    private lastXp: number = -1;
    private lastPotions: number = -1;
    private lastLevel: number = -1;

    constructor() {
        super('LevelOneScene');
    }

    preload() {
        this.load.atlasXML(TextureKeys.Characters, '/Spritesheets/spritesheet-characters-default.png', '/Spritesheets/spritesheet-characters-default.xml');
        this.load.atlasXML(TextureKeys.Tiles, '/Spritesheets/spritesheet-tiles-default.png', '/Spritesheets/spritesheet-tiles-default.xml');
        this.load.atlasXML(TextureKeys.Backgrounds, '/Spritesheets/spritesheet-backgrounds-default.png', '/Spritesheets/spritesheet-backgrounds-default.xml');
        this.load.atlasXML(TextureKeys.Enemies, '/Spritesheets/spritesheet-enemies-double.png', '/Spritesheets/spritesheet-enemies-double.xml');

        this.load.audio('sfx_jump', '/Sounds/sfx_jump.ogg');
        this.load.audio('sfx_coin', '/Sounds/sfx_coin.ogg');
        this.load.audio('sfx_hurt', '/Sounds/sfx_hurt.ogg');
        this.load.audio('bg_music', '/Plucking_the_Canopy.mp3');
        this.load.image('coin_gold_high', '/Sprites/Tiles/Double/coin_gold.png');
        this.load.audio('win_music', '/win.mp3');
    }

    create() {
        // Sound management from Store
        const { isMuted, volume } = useGameStore.getState();
        this.sound.mute = isMuted;
        this.sound.volume = volume;

        // Start background music if not playing
        if (!this.sound.get('bg_music')) {
            const music = this.sound.add('bg_music', { loop: true });
            music.play();
        } else if (!this.sound.get('bg_music')?.isPlaying) {
            this.sound.get('bg_music')?.play();
        }

        // CLEANUP: Always remove listeners on shutdown to avoid leaks and 'undead' handlers
        this.events.once('shutdown', () => {
            EventBus.off('sound-muted');
            EventBus.off('volume-change');
            EventBus.off('quiz-answer-selected');
        });

        EventBus.on('sound-muted', (isMuted: boolean) => {
            if (this.sound) this.sound.mute = isMuted;
        });

        EventBus.on('volume-change', (vol: number) => {
            if (this.sound) this.sound.volume = vol;
        });

        this.resetState();
        const { height } = this.scale;
        const selectedLevelId = useGameStore.getState().selectedLevelId;
        const isLevel1 = selectedLevelId === 1;
        const isLevel2 = selectedLevelId === 2;
        const levelWidth = isLevel2 ? 3600 : isLevel1 ? 3200 : SCENE_CONFIG.LEVEL.WIDTH;

        // Level 0: Daylight Sky (#87CEEB) | Level 1: Deep Midnight (#0d1117) | Level 2: Sunset Canyon (#2b1810)
        this.cameras.main.setBackgroundColor(isLevel2 ? '#2b1810' : isLevel1 ? '#0d1117' : '#87CEEB');

        // Initialize Groups
        this.platforms = this.physics.add.staticGroup();
        this.coins = this.physics.add.group();
        this.spikes = this.physics.add.group({ allowGravity: false, immovable: true });
        this.enemies = this.physics.add.group();
        this.potions = this.physics.add.group({ allowGravity: false, immovable: true });
        this.sandLifts = this.physics.add.group({ allowGravity: false, immovable: true });
        this.crumblyBridges = this.physics.add.staticGroup();
        this.conditionalGates = this.physics.add.staticGroup();

        // Level Bounds (Visual & Physics)
        this.physics.world.setBounds(0, 0, levelWidth, height); 
        this.cameras.main.setBounds(0, 0, levelWidth, height);

        // Kaizen: Create animations BEFORE characters to avoid 'Missing animation' warnings
        this.createAnimations();

        this.createEnvironment(height);
        this.createCharacters(height);
        this.setupCollisions();
        this.setupInput();
        this.createHUD();

        // Quiz Logic: Handle answer from React UI
        EventBus.on('quiz-answer-selected', (data: { questionIndex?: number, isCorrect: boolean, isLast: boolean }) => {
            if (!this.scene || !this.scene.isActive()) return;
            
            if (data.isCorrect) {
                // SUCCESS FLOW
                useGameStore.getState().addXp(10);
                this.showFloatingText(this.player!.x, this.player!.y - 50, "+10 XP", "#22d3ee");

                const isLvl1 = useGameStore.getState().selectedLevelId === 1;

                if (!data.isLast) {
                    // DIALOGUE BETWEEN QUESTIONS (Dynamic question number from questionIndex)
                    const currentQIndex = data.questionIndex !== undefined ? data.questionIndex : 0;
                    const nextNum = currentQIndex + 2;
                    const msg1 = isLvl1 ? "Отлично! Логика подвластна тебе!" : "Ты отлично справился!";
                    const msg2 = isLvl1 
                        ? `Ответь на ${nextNum}-й вопрос!` 
                        : `Ответь на ${nextNum}-й вопрос`;

                    this.createSpeechBubble(this.masterNPC!, msg1);
                    
                    this.time.delayedCall(2000, () => {
                        this.createSpeechBubble(this.masterNPC!, msg2);
                    });

                    this.time.delayedCall(4000, () => {
                        EventBus.emit('quiz-next-question');
                    });
                } else {
                    // FINAL SUCCESS WORDS WHEN QUESTIONS ARE FINISHED
                    const finalMsg1 = isLvl1 ? LEVEL1_CONFIG.dialogues.success : LEVEL0_CONFIG.dialogues.success;
                    const finalMsg2 = isLvl1 ? "Портал Башни открыт, иди к вершинам знаний!" : "Путь свободен, проходи в следующий мир!";

                    this.createSpeechBubble(this.masterNPC!, finalMsg1);
                    this.time.delayedCall(2200, () => {
                        this.createSpeechBubble(this.masterNPC!, finalMsg2);
                        
                        // Trigger disappearance and portal appearance
                        this.time.delayedCall(2200, () => {
                            this.onQuestFinished();
                        });
                    });
                }
            } else {
                // FAILURE FLOW (PENALTY & RETRY)
                const isLvl1 = useGameStore.getState().selectedLevelId === 1;
                const store = useGameStore.getState();
                store.addXp(-50);
                this.showFloatingText(this.player!.x, this.player!.y - 50, "-50 XP", "#ff4444");
                
                // Visual HUD Hint: Pulse the XP bar red
                if (this.hudXpText) {
                    this.tweens.add({
                        targets: [this.hudXpText, this.levelText],
                        scale: 1.2,
                        tint: 0xff0000,
                        duration: 100,
                        yoyo: true,
                        repeat: 3
                    });
                }

                // Check if they hit the floor (Level 1, 0 XP)
                const finalStore = useGameStore.getState();
                if (finalStore.level === 1 && finalStore.xp === 0) {
                    EventBus.emit('hide-question');
                    const lowMsg = isLvl1 ? "Ошибки типов исчерпали твою энергию!" : "Твоих знаний теперь недостаточно!";
                    this.createSpeechBubble(this.masterNPC!, lowMsg);
                    
                    this.time.delayedCall(2500, () => {
                        this.createSpeechBubble(this.masterNPC!, "Приходи позже, когда вернешь свою мудрость...");
                        this.hasTriggeredQuiz = false; // Allow them to trigger interaction again later
                        this.isLocked = false;
                        if (this.player?.body) (this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);
                    });
                    
                    this.cameras.main.shake(500, 0.01);
                    return;
                }

                const failMsg1 = isLvl1 ? LEVEL1_CONFIG.dialogues.failure : "Хмм... Это был неверный ответ!";
                const failMsg2 = isLvl1 ? "Ошибка типов забрала часть твоих сил... -50 XP!" : "За это я забираю твои знания... -50 XP!";

                this.createSpeechBubble(this.masterNPC!, failMsg1);
                
                this.time.delayedCall(2500, () => {
                    this.createSpeechBubble(this.masterNPC!, failMsg2);
                    this.cameras.main.shake(300, 0.005);
                });

                this.time.delayedCall(5000, () => {
                    this.createSpeechBubble(this.masterNPC!, "Попробуй еще раз!");
                    this.time.delayedCall(1500, () => {
                        EventBus.emit('show-question');
                    });
                });
            }
        });

        EventBus.emit('current-scene-ready', this);
    }

    private createEnvironment(height: number) {
        const isLevel1 = useGameStore.getState().selectedLevelId === 1;

        if (isLevel1) {
            // ==========================================
            // 🏰 LEVEL 1: EXPANSIVE TOWER OF VARIABLES (3200px)
            // ==========================================
            const stoneTile = 'terrain_stone_horizontal_middle';

            // Ground segments with gaps/pits
            const groundSegments = [
                { start: 32, end: 448 },
                { start: 704, end: 1216 },
                { start: 1472, end: 2048 },
                { start: 2304, end: 3232 }
            ];

            groundSegments.forEach(seg => {
                for (let x = seg.start; x <= seg.end; x += 64) {
                    const p = this.platforms?.create(x, height - 32, TextureKeys.Tiles, stoneTile);
                    if (p) p.setTint(0x93c5fd);
                }
            });

            // Spikes in pits
            const spikePitCoords = [480, 544, 608, 1280, 1344, 1408, 2112, 2176, 2240];
            spikePitCoords.forEach(x => {
                const spike = this.spikes?.create(x, height - 32, TextureKeys.Tiles, 'spikes');
                if (spike && spike.body) {
                    const body = spike.body as Phaser.Physics.Arcade.Body;
                    body.setSize(SCENE_CONFIG.SPIKES.HITBOX.width, SCENE_CONFIG.SPIKES.HITBOX.height);
                    body.setOffset(SCENE_CONFIG.SPIKES.HITBOX.offsetX, SCENE_CONFIG.SPIKES.HITBOX.offsetY);
                }
            });

            // Multi-tiered Floating Islands (Tier 1, Tier 2, Tier 3)
            const islandData = [
                // Tier 1 (Lower Parkour)
                { xCoords: [350, 414, 478], yOffset: 190 },
                { xCoords: [580, 644], yOffset: 310 },
                { xCoords: [800, 864, 928], yOffset: 210 },
                // Tier 2 (Upper Tower Platforms)
                { xCoords: [1000, 1064, 1128, 1192], yOffset: 360 },
                { xCoords: [1350, 1414, 1478], yOffset: 240 },
                { xCoords: [1536, 1600, 1664, 1728, 1792], yOffset: 400 },
                // Tier 3 (Sky Steps to Sanctuary)
                { xCoords: [1900, 1964], yOffset: 220 },
                { xCoords: [2100, 2164], yOffset: 350 },
                { xCoords: [2300, 2364, 2428], yOffset: 480 },
                { xCoords: [2550, 2614, 2678], yOffset: 260 }
            ];

            islandData.forEach(island => {
                island.xCoords.forEach(x => {
                    const p = this.platforms?.create(x, height - island.yOffset, TextureKeys.Tiles, stoneTile);
                    if (p) p.setTint(0x93c5fd);

                    // Skip spawning yellow gem under the rare blue crystal at x=2364
                    if (x === 2364 && island.yOffset === 480) {
                        return;
                    }

                    // Collectible Memory Gems
                    const gem = this.coins?.create(x, height - island.yOffset - 64, TextureKeys.Tiles, 'gem_yellow');
                    if (gem) {
                        gem.setScale(1.0).setBounceY(0.4);
                        this.tweens.add({
                            targets: gem,
                            scaleX: -1.0,
                            duration: 1200 + Math.random() * 500,
                            yoyo: true,
                            repeat: -1,
                            ease: 'Sine.easeInOut'
                        });
                    }
                });
            });

            // Rare Health Gem at High Peak (x=2364, height - 544)
            const rarePotion = this.potions!.create(2364, height - 544, TextureKeys.Tiles, 'gem_blue');
            if (rarePotion) {
                rarePotion.setDepth(5);
                this.tweens.add({
                    targets: rarePotion,
                    scale: 1.3,
                    duration: 700,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Back.easeInOut'
                });
            }
        } else if (useGameStore.getState().selectedLevelId === 2) {
            // ==========================================
            // 🏜️ LEVEL 2: UNDER CONSTRUCTION (BLANK SLATE)
            // ==========================================
            const sandTile = 'sand_middle';
            for (let x = 32; x <= 3600; x += 64) {
                const p = this.platforms?.create(x, height - 32, TextureKeys.Tiles, sandTile);
                if (p) p.setTint(0xfcd34d);
            }
        } else {
            // ==========================================
            // 🚀 LEVEL 0: START & TUTORIAL (1600px)
            // ==========================================
            const grassTile = 'terrain_grass_horizontal_middle';

            // Ground MIDDLE
            for (let x = 32; x <= SCENE_CONFIG.LEVEL.WIDTH + 32; x += 64) {
                this.platforms?.create(x, height - 32, TextureKeys.Tiles, grassTile);
            }

            // Floating Islands & Coins
            const islandCoords = [416, 480, 544, 900, 964, 1028];
            islandCoords.forEach(x => {
                this.platforms?.create(x, height - 200, TextureKeys.Tiles, grassTile);

                const coin = this.coins?.create(x, height - 264, 'coin_gold_high');
                if (coin) {
                    coin.setScale(0.5);
                    coin.setBounceY(0.5);
                    this.tweens.add({
                        targets: coin,
                        scaleX: -0.5,
                        duration: 1200 + Math.random() * 600,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                }
            });

            // Potions
            const potionObj = this.potions!.create(1300, height - 96, TextureKeys.Tiles, 'gem_blue');
            if (potionObj) {
                potionObj.setDepth(5);
                this.tweens.add({
                    targets: potionObj,
                    scale: 1.25,
                    duration: 700,
                    yoyo: true,
                    repeat: -1
                });
            }

            // Spikes
            const spikeCoords = [608, 672, 1100, 1164];
            spikeCoords.forEach(x => {
                const spike = this.spikes?.create(x, height - 96, TextureKeys.Tiles, 'spikes');
                if (spike && spike.body) {
                    const body = spike.body as Phaser.Physics.Arcade.Body;
                    body.setSize(SCENE_CONFIG.SPIKES.HITBOX.width, SCENE_CONFIG.SPIKES.HITBOX.height);
                    body.setOffset(SCENE_CONFIG.SPIKES.HITBOX.offsetX, SCENE_CONFIG.SPIKES.HITBOX.offsetY);
                }
            });
        }
    }

    private createCharacters(height: number) {
        const isLevel1 = useGameStore.getState().selectedLevelId === 1;

        // Player
        this.player = this.physics.add.sprite(100, height - 128, TextureKeys.Characters, 'character_green_idle');
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        this.player.setScale(SCENE_CONFIG.PLAYER.SCALE).setDepth(10);
        this.player.setBodySize(SCENE_CONFIG.PLAYER.HITBOX.width, SCENE_CONFIG.PLAYER.HITBOX.height);
        this.player.setOffset(SCENE_CONFIG.PLAYER.HITBOX.offsetX, SCENE_CONFIG.PLAYER.HITBOX.offsetY);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // ==========================================
        // 🛡️ USER EQUIPPED SKIN & MAGIC AURA SELECTION
        // ==========================================
        const equippedSkin = useGameStore.getState().equippedSkin || 'default';
        this.applyEquippedSkinTint();

        if (equippedSkin === 'cyan_aura') {
            // 1. Shining Magic Crown Halo over Player's Helmet (Always Active)
            this.crownParticles = this.add.particles(0, 0, TextureKeys.Tiles, {
                frame: 'gem_blue',
                scale: { start: 0.35, end: 0 },
                speed: { min: 15, max: 35 },
                lifespan: 450,
                blendMode: 'ADD',
                frequency: 40,
                tint: 0x00f2ff,
                follow: this.player,
                followOffset: { x: 0, y: -26 }
            }).setDepth(15);

            // 2. Motion Trail Aura Particles behind Player
            this.auraParticles = this.add.particles(0, 0, TextureKeys.Tiles, {
                frame: 'coin_gold',
                scale: { start: 0.28, end: 0 },
                speed: { min: 30, max: 70 },
                lifespan: 350,
                blendMode: 'ADD',
                frequency: 30,
                tint: 0x38bdf8,
                follow: this.player,
                followOffset: { x: 0, y: 10 }
            }).setDepth(9);
        }

        if (isLevel1) {
            // ==========================================
            // 🤖 LEVEL 1: UNIQUE ANIMATED ENEMIES & EXPANDED PATROLS
            // ==========================================
            // Enemy #1: Green Slime Crawler (Full Start Platform Patrol 380px)
            const e1 = this.enemies?.create(250, height - 80, TextureKeys.Enemies, 'slime_normal_walk_a');
            e1.setScale(0.55).setCollideWorldBounds(true).setImmovable(true);
            e1.play('slime-walk');
            if (e1.body) (e1.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
            e1.setVelocityX(SCENE_CONFIG.ENEMY.SPEED * 0.8).setFlipX(false);
            e1.setData('type', 'slime').setData('minX', 50).setData('maxX', 430);

            // Enemy #2: Hovering Cyber Bee (Wide Free Sky Flight 600px)
            const e2 = this.enemies?.create(750, height - 280, TextureKeys.Enemies, 'bee_a');
            e2.setScale(0.55).setCollideWorldBounds(true).setImmovable(true);
            e2.play('bee-fly');
            if (e2.body) (e2.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
            e2.setVelocityX(SCENE_CONFIG.ENEMY.SPEED * 0.9).setFlipX(false);
            e2.setData('type', 'flyer').setData('baseY', height - 280).setData('minX', 450).setData('maxX', 1050);

            // Enemy #3: Fire Slime on Mid Tower Platform (Exact Edge-to-Edge 220px Patrol)
            const e3 = this.enemies?.create(1100, height - 410, TextureKeys.Enemies, 'slime_fire_walk_a');
            e3.setScale(0.55).setCollideWorldBounds(true).setImmovable(true);
            e3.play('slime-fire-walk');
            if (e3.body) (e3.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
            e3.setVelocityX(-SCENE_CONFIG.ENEMY.SPEED * 0.9).setFlipX(true);
            e3.setData('type', 'slime_fire').setData('minX', 985).setData('maxX', 1205);

            // Enemy #4: Fire Slime on Full Ground Platform (Full 540px Patrol from edge to edge)
            const e4 = this.enemies?.create(1550, height - 80, TextureKeys.Enemies, 'slime_fire_walk_a');
            e4.setScale(0.55).setCollideWorldBounds(true).setImmovable(true);
            e4.play('slime-fire-walk');
            if (e4.body) (e4.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);
            e4.setVelocityX(SCENE_CONFIG.ENEMY.SPEED * 0.9).setFlipX(false);
            e4.setData('type', 'slime_fire').setData('minX', 1490).setData('maxX', 2030);

            // Enemy #5: Flying Buzz Drone before Boss Sanctuary (Wide Air Patrol 600px)
            const e5 = this.enemies?.create(2550, height - 230, TextureKeys.Enemies, 'fly_a');
            e5.setScale(0.55).setCollideWorldBounds(true).setImmovable(true);
            e5.play('fly-buzz');
            if (e5.body) (e5.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
            e5.setVelocityX(-SCENE_CONFIG.ENEMY.SPEED * 1.1).setFlipX(true);
            e5.setData('type', 'flyer').setData('baseY', height - 230).setData('minX', 2250).setData('maxX', 2850);

            // ==========================================
            // 👑 ANIMATED MASTER BOSS (Магистр Синтаксиса)
            // ==========================================
            const npcX = 2950;
            this.masterNPC = this.physics.add.sprite(npcX, height - 70, TextureKeys.Characters, 'character_purple_idle');
            this.masterNPC.setScale(0.65).setFlipX(true).setImmovable(true).setOrigin(0.5, 1);
            if (this.masterNPC.body) (this.masterNPC.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
            this.masterNPC.play('boss-idle');

            // Boss Floating Animation
            this.tweens.add({
                targets: this.masterNPC,
                y: height - 85,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Boss Magic Crown Floating Gem Effect
            const bossCrown = this.add.image(npcX, height - 150, TextureKeys.Tiles, 'gem_yellow');
            bossCrown.setScale(0.7).setDepth(15);
            this.tweens.add({
                targets: bossCrown,
                y: height - 165,
                rotation: Math.PI * 2,
                duration: 2500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            this.masterNPC.setData('crown', bossCrown);

            // Boss Mystic Particles Aura
            const bossAura = this.add.particles(npcX, height - 90, TextureKeys.Tiles, {
                frame: 'gem_blue',
                scale: { start: 0.35, end: 0 },
                alpha: { start: 0.8, end: 0 },
                speed: { min: 20, max: 60 },
                angle: { min: 0, max: 360 },
                frequency: 250,
                lifespan: 1200,
                blendMode: 'ADD'
            });
            bossAura.setDepth(5);
            this.masterNPC.setData('aura', bossAura);

            this.createSpeechBubble(this.masterNPC, LEVEL1_CONFIG.dialogues.greeting);

            // Portal at x=3100
            this.portal = this.physics.add.sprite(3100, height - 64, TextureKeys.Tiles, 'door_open');
            this.portal.setScale(1.2).setOrigin(0.5, 1).setVisible(false).setActive(false).setDepth(1);
            if (this.portal.body) {
                const body = this.portal.body as Phaser.Physics.Arcade.Body;
                body.setAllowGravity(false);
                body.setSize(20, 64);
                body.setOffset(22, 0);
            }
            const portalTop = this.add.image(this.portal.x, this.portal.y - 64 * 1.2, TextureKeys.Tiles, 'door_open_top');
            portalTop.setScale(1.2).setOrigin(0.5, 1).setVisible(false).setName('portalTop').setDepth(1);

        } else if (useGameStore.getState().selectedLevelId === 2) {
            // ==========================================
            // 🏜️ LEVEL 2: BLANK SLATE
            // ==========================================
        } else {
            // ==========================================
            // 🚀 LEVEL 0: TUTORIAL ENEMIES & MASTER NPC
            // ==========================================
            const enemy1 = this.enemies?.create(880, height - 96, TextureKeys.Characters, 'character_pink_idle');
            enemy1.setScale(SCENE_CONFIG.ENEMY.SCALE).setCollideWorldBounds(true).setImmovable(true);
            if (enemy1.body) (enemy1.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
            enemy1.setVelocityX(-SCENE_CONFIG.ENEMY.SPEED).setFlipX(true);
            enemy1.setData('minX', 680).setData('maxX', 1090);

            const enemy2 = this.enemies?.create(400, height - 96, TextureKeys.Characters, 'character_pink_idle');
            enemy2.setScale(SCENE_CONFIG.ENEMY.SCALE).setCollideWorldBounds(true).setImmovable(true);
            if (enemy2.body) (enemy2.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
            enemy2.setVelocityX(SCENE_CONFIG.ENEMY.SPEED).setFlipX(false);
            enemy2.setData('minX', 250).setData('maxX', 580);

            const npcX = SCENE_CONFIG.LEVEL.WIDTH - 200;
            this.masterNPC = this.physics.add.sprite(npcX, height - 64, TextureKeys.Characters, 'character_beige_idle');
            this.masterNPC.setScale(0.5).setFlipX(true).setImmovable(true).setOrigin(0.5, 1);
            if (this.masterNPC.body) (this.masterNPC.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
            this.createSpeechBubble(this.masterNPC, LEVEL0_CONFIG.dialogues.greeting);

            this.portal = this.physics.add.sprite(SCENE_CONFIG.LEVEL.WIDTH - 80, height - 64, TextureKeys.Tiles, 'door_open');
            this.portal.setScale(1.2).setOrigin(0.5, 1).setVisible(false).setActive(false).setDepth(1);
            if (this.portal.body) {
                const body = this.portal.body as Phaser.Physics.Arcade.Body;
                body.setAllowGravity(false);
                body.setSize(20, 64);
                body.setOffset(22, 0);
            }
            const portalTop = this.add.image(this.portal.x, this.portal.y - 64 * 1.2, TextureKeys.Tiles, 'door_open_top');
            portalTop.setScale(1.2).setOrigin(0.5, 1).setVisible(false).setName('portalTop').setDepth(1);
        }
    }

    private createAnimations() {
        const skins = [
            { prefix: 'green', idleKey: 'knight-idle', walkKey: 'knight-walk', jumpKey: 'knight-jump', crouchKey: 'knight-crouch' },
            { prefix: 'yellow', idleKey: 'yellow-idle', walkKey: 'yellow-walk', jumpKey: 'yellow-jump', crouchKey: 'yellow-crouch' },
            { prefix: 'purple', idleKey: 'purple-idle', walkKey: 'purple-walk', jumpKey: 'purple-jump', crouchKey: 'purple-crouch' },
            { prefix: 'beige', idleKey: 'beige-idle', walkKey: 'beige-walk', jumpKey: 'beige-jump', crouchKey: 'beige-crouch' }
        ];

        skins.forEach(s => {
            if (!this.anims.exists(s.idleKey)) {
                this.anims.create({
                    key: s.idleKey,
                    frames: [{ key: TextureKeys.Characters, frame: `character_${s.prefix}_idle` }]
                });
            }
            if (!this.anims.exists(s.walkKey)) {
                this.anims.create({
                    key: s.walkKey,
                    frames: [
                        { key: TextureKeys.Characters, frame: `character_${s.prefix}_walk_a` },
                        { key: TextureKeys.Characters, frame: `character_${s.prefix}_walk_b` }
                    ],
                    frameRate: 8,
                    repeat: -1
                });
            }
            if (!this.anims.exists(s.jumpKey)) {
                this.anims.create({
                    key: s.jumpKey,
                    frames: [{ key: TextureKeys.Characters, frame: `character_${s.prefix}_jump` }]
                });
            }
            if (!this.anims.exists(s.crouchKey)) {
                this.anims.create({
                    key: s.crouchKey,
                    frames: [{ key: TextureKeys.Characters, frame: `character_${s.prefix}_duck` }]
                });
            }
        });

        // Enemy & Boss Animations
        if (!this.anims.exists('slime-walk')) {
            this.anims.create({
                key: 'slime-walk',
                frames: [
                    { key: TextureKeys.Enemies, frame: 'slime_normal_walk_a' },
                    { key: TextureKeys.Enemies, frame: 'slime_normal_walk_b' }
                ],
                frameRate: 6,
                repeat: -1
            });
        }

        if (!this.anims.exists('slime-fire-walk')) {
            this.anims.create({
                key: 'slime-fire-walk',
                frames: [
                    { key: TextureKeys.Enemies, frame: 'slime_fire_walk_a' },
                    { key: TextureKeys.Enemies, frame: 'slime_fire_walk_b' }
                ],
                frameRate: 6,
                repeat: -1
            });
        }

        if (!this.anims.exists('bee-fly')) {
            this.anims.create({
                key: 'bee-fly',
                frames: [
                    { key: TextureKeys.Enemies, frame: 'bee_a' },
                    { key: TextureKeys.Enemies, frame: 'bee_b' }
                ],
                frameRate: 12,
                repeat: -1
            });
        }

        if (!this.anims.exists('fly-buzz')) {
            this.anims.create({
                key: 'fly-buzz',
                frames: [
                    { key: TextureKeys.Enemies, frame: 'fly_a' },
                    { key: TextureKeys.Enemies, frame: 'fly_b' }
                ],
                frameRate: 14,
                repeat: -1
            });
        }

        if (!this.anims.exists('ladybug-walk')) {
            this.anims.create({
                key: 'ladybug-walk',
                frames: [
                    { key: TextureKeys.Enemies, frame: 'ladybug_walk_a' },
                    { key: TextureKeys.Enemies, frame: 'ladybug_walk_b' }
                ],
                frameRate: 8,
                repeat: -1
            });
        }

        if (!this.anims.exists('snail-walk')) {
            this.anims.create({
                key: 'snail-walk',
                frames: [
                    { key: TextureKeys.Enemies, frame: 'snail_walk_a' },
                    { key: TextureKeys.Enemies, frame: 'snail_walk_b' }
                ],
                frameRate: 5,
                repeat: -1
            });
        }

        if (!this.anims.exists('frog-leap')) {
            this.anims.create({
                key: 'frog-leap',
                frames: [
                    { key: TextureKeys.Enemies, frame: 'frog_leap_a' },
                    { key: TextureKeys.Enemies, frame: 'frog_leap_b' }
                ],
                frameRate: 6,
                repeat: -1
            });
        }

        if (!this.anims.exists('mouse-walk')) {
            this.anims.create({
                key: 'mouse-walk',
                frames: [
                    { key: TextureKeys.Enemies, frame: 'mouse_walk_a' },
                    { key: TextureKeys.Enemies, frame: 'mouse_walk_b' }
                ],
                frameRate: 9,
                repeat: -1
            });
        }

        if (!this.anims.exists('boss-idle')) {
            this.anims.create({
                key: 'boss-idle',
                frames: [{ key: TextureKeys.Characters, frame: 'character_purple_idle' }]
            });
        }

        if (!this.anims.exists('boss-cast')) {
            this.anims.create({
                key: 'boss-cast',
                frames: [
                    { key: TextureKeys.Characters, frame: 'character_purple_walk_a' },
                    { key: TextureKeys.Characters, frame: 'character_purple_walk_b' }
                ],
                frameRate: 6,
                repeat: -1
            });
        }
    }

    private setupCollisions() {
        if (!this.player) return;

        this.physics.add.collider(this.player, this.platforms!);
        this.physics.add.collider(this.coins!, this.platforms!);
        this.physics.add.collider(this.enemies!, this.platforms!, undefined, (enemyObj) => {
            const e = enemyObj as Phaser.Physics.Arcade.Sprite;
            return e.getData('type') !== 'flyer';
        });

        // LEVEL 2 MECHANICS COLLISIONS
        if (this.sandLifts) {
            this.physics.add.collider(this.player, this.sandLifts);
        }

        if (this.crumblyBridges) {
            this.physics.add.collider(this.player, this.crumblyBridges, (_p, bridgeObj) => {
                const bridge = bridgeObj as Phaser.Physics.Arcade.Sprite;
                if (!bridge.getData('isCrumbling')) {
                    bridge.setData('isCrumbling', true);
                    this.tweens.add({
                        targets: bridge,
                        y: bridge.y + 6,
                        duration: 70,
                        yoyo: true,
                        repeat: 4,
                        onComplete: () => {
                            this.tweens.add({
                                targets: bridge,
                                y: bridge.y + 350,
                                alpha: 0,
                                duration: 500,
                                onComplete: () => bridge.destroy()
                            });
                        }
                    });
                }
            });
        }

        if (this.conditionalGates) {
            this.physics.add.overlap(this.player, this.conditionalGates, (_p, gateObj) => {
                const gate = gateObj as Phaser.Physics.Arcade.Sprite;
                if (gate.getData('hasProcessed')) return;
                gate.setData('hasProcessed', true);

                const isCorrect = gate.getData('isCorrect');
                if (isCorrect) {
                    this.sound.play('sfx_coin', { volume: 0.6 });
                    useGameStore.getState().addXp(50);
                    this.showFloatingText(gate.x, gate.y - 40, "ВЕРНО! +50 XP", "#34d399");
                    
                    const p = this.add.particles(gate.x, gate.y, TextureKeys.Tiles, {
                        frame: 'gem_yellow',
                        speed: { min: 80, max: 180 },
                        scale: { start: 0.4, end: 0 },
                        lifespan: 600,
                        duration: 400,
                        blendMode: 'ADD'
                    });
                    this.time.delayedCall(600, () => p.destroy());

                    this.tweens.add({
                        targets: gate,
                        y: gate.y - 120,
                        alpha: 0,
                        duration: 600,
                        onComplete: () => gate.destroy()
                    });
                } else {
                    this.sound.play('sfx_hurt', { volume: 0.5 });
                    useGameStore.getState().addXp(-25);
                    this.showFloatingText(gate.x, gate.y - 40, "НЕВЕРНО! -25 XP", "#ef4444");
                    this.cameras.main.shake(200, 0.01);
                    
                    if (this.player) {
                        this.player.setVelocityX(-450);
                        this.player.setVelocityY(-200);
                    }
                    this.time.delayedCall(800, () => gate.setData('hasProcessed', false));
                }
            });
        }

        this.physics.add.collider(this.player, this.spikes!, () => this.handleDamage(SCENE_CONFIG.SPIKES.DAMAGE));
        this.physics.add.collider(this.enemies!, this.spikes!, (obj1) => {
            const e = obj1 as Phaser.Physics.Arcade.Sprite;
            const turnedRight = e.flipX;
            e.setFlipX(!turnedRight);
            e.setVelocityX(turnedRight ? SCENE_CONFIG.ENEMY.SPEED : -SCENE_CONFIG.ENEMY.SPEED);
            e.x += turnedRight ? 5 : -5;
        });

        this.physics.add.overlap(this.player, this.coins!, (p, c) => this.collectCoin(p, c), undefined, this);
        this.physics.add.collider(this.player, this.enemies!, (p, e) => this.handleEnemyCollision(p, e));
        this.physics.add.overlap(this.player, this.potions!, (p, po) => this.collectPotion(p, po), undefined, this);
        this.physics.add.overlap(this.player, this.masterNPC!, this.handleMasterInteraction, undefined, this);

        EventBus.on('quest-finished', this.onQuestFinished, this);

        // CLEANUP: Prevent duplicate listeners on restart
        this.events.once('shutdown', () => {
            EventBus.off('quest-finished');
            EventBus.off('restart-game');
            EventBus.off('sound-muted');
        });

        // HANDLE RESIZE: Update physics bounds and cameras
        this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
            const { width, height } = gameSize;
            this.cameras.main.setViewport(0, 0, width, height);
            this.physics.world.setBounds(0, 0, SCENE_CONFIG.LEVEL.WIDTH, height);
            this.cameras.main.setBounds(0, 0, SCENE_CONFIG.LEVEL.WIDTH, height);
        });
    }

    private setupInput() {
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            // Kaizen: Modern WASD support
            this.wasd = this.input.keyboard.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>; 
            this.input.keyboard.on('keydown-H', () => this.useHealPotion());
            
            // MENU LOGIC: ESC Key for Pausing
            this.input.keyboard.on('keydown-ESC', () => {
                const store = useGameStore.getState();
                if (!store.isPaused) {
                    store.setPaused(true);
                    this.physics.pause();
                    this.sound.pauseAll(); // Pause magic melodies
                } else {
                    // TOGGLE: Second ESC resumes
                    EventBus.emit('resume-game');
                }
            });
            
            // UI PAUSE: Triggered from React (e.g., Instructions)
            EventBus.on('pause-game', () => {
                this.physics.pause();
                this.sound.pauseAll();
            });

            // Resume listener from React UI
            this.events.once('shutdown', () => {
                EventBus.off('quiz-answer-selected');
                EventBus.off('restart-game');
                EventBus.off('sound-muted');
                EventBus.off('volume-change');
            });

            EventBus.on('restart-game', () => {
                if (this.scene && this.scene.isActive()) {
                    if (this.physics && this.physics.world) {
                        this.physics.resume();
                    }
                    if (this.sound) {
                        this.sound.resumeAll();
                    }
                    this.scene.restart();
                }
            });

            EventBus.on('resume-game', () => {
                this.physics.resume();
                this.sound.resumeAll();
                useGameStore.getState().setPaused(false);
            });
        }
    }

    private handleEnemyCollision(player: unknown, enemy: unknown) {
        if (this.isInvulnerable) return;

        const p = player as Phaser.Physics.Arcade.Sprite;
        const e = enemy as Phaser.Physics.Arcade.Sprite;
        if (!p.body || !e.body) return;

        const pBody = p.body as Phaser.Physics.Arcade.Body;
        const eBody = e.body as Phaser.Physics.Arcade.Body;
        const enemyType = e.getData('type');

        // STOMP MECHANIC: Strict top-down landing detection
        // Requires player falling onto top surface, horizontally centered, with NO side contact
        const isFalling = pBody.velocity.y > -20 || pBody.touching.down;
        const isAboveTopSurface = (pBody.bottom - 10) <= (eBody.top + 16);
        const isHorizontallyCentered = Math.abs(p.x - e.x) < 38;
        const isSideContact = pBody.touching.left || pBody.touching.right;

        const isStomping = isAboveTopSurface && isFalling && isHorizontallyCentered && !isSideContact;

        // RESTRICTION: Only Fire Slimes ('slime_fire') can be stomped and destroyed on this level!
        const isFireSlime = enemyType === 'slime_fire';

        if (isStomping && isFireSlime) {
            // Player bounces up gracefully
            p.setVelocityY(-420);
            this.sound.play('sfx_jump', { volume: 0.6 });

            // Score XP reward
            useGameStore.getState().addXp(25);
            this.showFloatingText(e.x, e.y - 30, "+25 XP", "#34d399");

            // Poof Sparkle Particles Effect
            const particles = this.add.particles(e.x, e.y, TextureKeys.Tiles, {
                frame: 'gem_yellow',
                speed: { min: 80, max: 200 },
                scale: { start: 0.4, end: 0 },
                alpha: { start: 1, end: 0 },
                duration: 400,
                lifespan: 600,
                blendMode: 'ADD'
            });
            this.time.delayedCall(600, () => particles.destroy());

            // Squish and Destroy Fire Slime with Animation
            e.disableBody(true, false);
            this.tweens.add({
                targets: e,
                scaleY: 0.05,
                scaleX: 0.8,
                alpha: 0,
                duration: 200,
                onComplete: () => {
                    e.destroy();
                }
            });
            return;
        }

        // Regular Knockback Hit Flow
        this.isKnockback = true;
        const knockDir = (p.x < e.x) ? -400 : 400;
        p.setVelocity(knockDir, -350);
        this.time.delayedCall(SCENE_CONFIG.DURATIONS.KNOCKBACK, () => this.isKnockback = false);

        this.handleDamage(SCENE_CONFIG.ENEMY.DAMAGE);
    }

    private applyEquippedSkinTint() {
        if (!this.player) return;
        this.player.clearTint();
    }

    private handleDamage(amount: number) {
        if (this.isInvulnerable) return;

        this.isInvulnerable = true;
        this.sound.play('sfx_hurt', { volume: 0.4 });
        useGameStore.getState().damage(amount);
        
        // CHECK FOR DEATH
        if (useGameStore.getState().hp <= 0) {
            this.handlePlayerDeath();
            return;
        }

        // Visual Feedback (Red Flash + Shake)
        this.player?.setTint(0xff0000);
        this.cameras.main.shake(200, 0.01);

        // Sanitize repeat count (Kaizen: prevent Infinity/NaN)
        const repeatCount = Math.max(0, Math.floor(SCENE_CONFIG.DURATIONS.INVULNERABILITY / SCENE_CONFIG.DURATIONS.FLICKER_INTERVAL) - 1);

        // Flickering effect (Flips visibility)
        this.time.addEvent({
            delay: SCENE_CONFIG.DURATIONS.FLICKER_INTERVAL,
            repeat: repeatCount,
            callback: () => {
                if (this.player) this.player.visible = !this.player.visible;
            }
        });

        // Invulnerability end (restores visibility and equipped skin tint)
        this.time.delayedCall(SCENE_CONFIG.DURATIONS.INVULNERABILITY, () => {
            if (this.player) {
                this.player.visible = true;
                this.applyEquippedSkinTint();
            }
            this.isInvulnerable = false;
        });
    }

    private handlePlayerDeath() {
        if (!this.player) return;
        
        this.isLocked = true;
        this.physics.pause();
        
        // Friendly "Poof" effect using sparkles
        const p = this.add.particles(this.player.x, this.player.y, TextureKeys.Tiles, {
            frame: 'gem_blue', speed: { min: 50, max: 150 }, scale: { start: 0.3, end: 0 },
            alpha: { start: 1, end: 0 }, duration: 800, lifespan: 1000, gravityY: -50,
            blendMode: 'ADD'
        });
        this.time.delayedCall(1000, () => p.destroy());

        // Player fades out gracefully with golden glow
        this.player.setTint(0xfffb00);
        this.tweens.add({
            targets: this.player,
            y: this.player.y - 20,
            alpha: 0,
            scale: 0.2,
            duration: 800,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                EventBus.emit('show-game-over');
            }
        });

        // Soft dark-blue transition (Indigo)
        this.cameras.main.fadeOut(1000, 15, 23, 42); 
    }

    private collectCoin(_player: unknown, coin: unknown) {
        const c = coin as Phaser.Physics.Arcade.Sprite;
        c.disableBody(true, true);
        this.sound.play('sfx_coin', { volume: 0.4 });
        useGameStore.getState().addXp(SCENE_CONFIG.LEVEL.XP_PER_COIN);
    }

    private collectPotion(_player: unknown, potion: unknown) {
        const p = potion as Phaser.Physics.Arcade.Sprite;
        const store = useGameStore.getState();
        if (store.hp < store.maxHp) store.heal(25); else store.addPotion();
        p.destroy();
        this.sound.play('sfx_coin', { volume: 0.6 });
    }

    private useHealPotion() {
        const store = useGameStore.getState();
        if (store.potions > 0 && this.player) {
            // Check for max HP condition
            if (store.hp >= store.maxHp) {
                this.createSpeechBubble(this.player, "Я полностью здоров, применим позже!");
                
                // Auto-destroy player bubble after 2 seconds
                this.time.delayedCall(2000, () => {
                    if (this.playerSpeechBubble && !this.isLocked) {
                        this.playerSpeechBubble.destroy();
                        this.playerSpeechBubble = null;
                    }
                });
                return;
            }

            store.usePotion();
            const p = this.add.particles(this.player.x, this.player.y, TextureKeys.Tiles, {
                frame: 'gem_blue', speed: 100, scale: { start: 0.5, end: 0 },
                duration: 500, lifespan: 500, gravityY: -200
            });
            this.time.delayedCall(500, () => p.destroy());
        }
    }

    private handleMasterInteraction() {
        const store = useGameStore.getState();
        
        // REQUISITE CHECK: Updated for Level 1 / 0 XP Condition
        if (store.level === 1 && store.xp === 0) {
            if (this.npcSpeechBubble) {
                this.npcSpeechBubble.destroy();
                this.npcSpeechBubble = null;
            }
            this.createSpeechBubble(this.masterNPC!, "Приходи, когда поднакопишь опыта!");
            return;
        }

        if (this.hasTriggeredQuiz) return;
        this.hasTriggeredQuiz = true;
        this.isLocked = true;
        
        // Clear initial bubble
        if (this.npcSpeechBubble) {
            this.npcSpeechBubble.destroy();
            this.npcSpeechBubble = null;
        }

        if (this.player?.body) {
            this.player.body.stop();
            (this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
            this.player.anims.play('knight-idle');
        }

        const isLvl1 = useGameStore.getState().selectedLevelId === 1;
        const initialPrompt = isLvl1 
            ? "Ответь на 1-й вопрос Башни!" 
            : "Ответь на 1-й вопрос";

        this.createSpeechBubble(this.masterNPC!, initialPrompt);

        this.time.delayedCall(1200, () => {
            EventBus.emit('show-question', { index: 0 });
        });
    }

    private onQuestFinished() {
        if (this.npcSpeechBubble) {
            this.tweens.add({ 
                targets: this.npcSpeechBubble, alpha: 0, duration: 500, 
                onComplete: () => { this.npcSpeechBubble?.destroy(); this.npcSpeechBubble = null; } 
            });
        }

        const crown = this.masterNPC?.getData('crown');
        const aura = this.masterNPC?.getData('aura');
        if (crown) {
            this.tweens.add({ targets: crown, alpha: 0, duration: 500, onComplete: () => crown.destroy() });
        }
        if (aura) {
            aura.destroy();
        }

        if (this.masterNPC) {
            this.cameras.main.flash(500, 255, 255, 255); // Magic flash
            this.tweens.add({
                targets: this.masterNPC,
                y: this.masterNPC.y - 100,
                alpha: 0,
                scale: 0.1,
                angle: 180,
                duration: 1200,
                ease: 'Cubic.easeIn',
                onComplete: () => { this.masterNPC?.destroy(); this.showPortal(); }
            });
        }
    }

    private showPortal() {
        if (!this.portal || !this.player) return;
        
        const portalTop = this.children.getByName('portalTop') as Phaser.GameObjects.Image;
        this.portal.setVisible(true).setActive(true).alpha = 0;
        if (portalTop) portalTop.setVisible(true).setAlpha(0);

        this.portal.setScale(0).setAngle(-90);
        if (portalTop) portalTop.setScale(0).setAngle(-90);
        
        // Appear sequence
        this.tweens.add({
            targets: [this.portal, portalTop],
            alpha: 1,
            scale: 1.2,
            angle: 0,
            duration: 1200,
            ease: 'Cubic.easeOut', // Smoother emergence
            onComplete: () => {
                this.isLocked = false;
                
                // Infinite Magic Pulse / Bobbing is removed per user request
                // Keeping only the Golden Glow Pulse
                this.tweens.add({
                    targets: [this.portal, portalTop],
                    tint: { from: 0xffffff, to: 0xfde047 },
                    duration: 1500,
                    yoyo: true,
                    repeat: -1
                });

                this.physics.add.overlap(this.player!, this.portal!, () => {
                    this.isLocked = true;
                    this.physics.pause(); // Freeze entire world
                    
                    // Clear any remaining speech bubbles
                    if (this.playerSpeechBubble) this.playerSpeechBubble.destroy();
                    if (this.npcSpeechBubble) this.npcSpeechBubble.destroy();

                    this.cameras.main.fadeOut(800, 0, 0, 0, (_camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
                        if (progress === 1) {
                            const store = useGameStore.getState();
                            
                            // Stop background music and play victory tune (once)
                            if (this.sound.get('bg_music')) this.sound.get('bg_music')?.stop();
                            this.sound.play('win_music', { loop: false, volume: 0.6 });

                            const currentSelId = store.selectedLevelId;
                            store.completeLevel(currentSelId);

                            let finalAchievement = 'Бронзовый кубок';
                            if (currentSelId === 2) {
                                finalAchievement = 'Золотой кубок';
                            } else if (currentSelId === 1) {
                                finalAchievement = 'Серебряный кубок';
                            }

                            store.setVictory(true);
                            store.setAchievement(finalAchievement);
                        }
                    });
                });
            }
        });
    }

    private createHUD() {
        const selId = useGameStore.getState().selectedLevelId;
        const levelBannerTitle = selId === 2 
            ? "🔀 УРОВЕНЬ 2: ЯНТАРНЫЕ КАНЬОНЫ УСЛОВИЙ" 
            : selId === 1 
            ? "📦 УРОВЕНЬ 1: БАШНЯ ПЕРЕМЕННЫХ" 
            : "🚀 УРОВЕНЬ 0: СТАРТ & ОБУЧЕНИЕ";
            
        const levelBannerColor = selId === 2 ? "#f59e0b" : selId === 1 ? "#38bdf8" : "#34d399";

        // Top Center Level Title Banner
        this.add.text(this.scale.width / 2, 28, levelBannerTitle, {
            fontFamily: 'Montserrat, Arial',
            fontSize: '18px',
            fontStyle: 'bold',
            color: levelBannerColor,
            stroke: '#0d1117',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(110);

        // High-end UI (Glassmorphism Minimalist)
        const hudX = 25, hudY = 25, barWidth = 160, barHeight = 8;
        this.add.graphics()
            .fillStyle(0x0f172a, 0.4) // Deep Indigo Translucent
            .fillRoundedRect(hudX - 10, hudY - 10, 240, 130, 10)
            .lineStyle(1.5, 0x6366f1, 0.5) // Neon border
            .strokeRoundedRect(hudX - 10, hudY - 10, 240, 130, 10)
            .setScrollFactor(0).setDepth(100);

        // STACK 1: HP
        this.add.image(hudX + 10, hudY + 10, TextureKeys.Tiles, 'hud_heart').setOrigin(0.5).setScale(0.5).setScrollFactor(0).setDepth(101);
        this.add.graphics().fillStyle(0x1e293b, 0.8).fillRoundedRect(hudX + 35, hudY + 6, barWidth, barHeight, 4).setScrollFactor(0).setDepth(101);
        
        // STACK 2: Level & XP (+40 from HP for spacing)
        this.add.circle(hudX + 10, hudY + 50, 15, 0xf59e0b, 1).setScrollFactor(0).setDepth(101).setStrokeStyle(2, 0xd97706);
        this.levelText = this.add.text(hudX + 10, hudY + 50, '1', { fontSize: '16px', fontStyle: 'bold', color: '#78350f' }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
        this.add.graphics().fillStyle(0x1e293b, 0.8).fillRoundedRect(hudX + 35, hudY + 46, barWidth, barHeight - 2, 4).setScrollFactor(0).setDepth(101);

        // STACK 3: Inventory (+40 from Level for spacing)
        this.add.image(hudX + 10, hudY + 92, TextureKeys.Tiles, 'gem_blue').setOrigin(0.5).setScale(0.6).setScrollFactor(0).setDepth(101);

        this.hudHealthBar = this.add.graphics().setScrollFactor(0).setDepth(102);

        // STYLED XP TEXT: Larger and brighter
        this.hudXpText = this.add.text(hudX + 35, hudY + 54, '', { 
            fontFamily: 'Montserrat, Arial', 
            fontSize: '16px', 
            fontStyle: 'bold', 
            color: '#22d3ee' 
        }).setScrollFactor(0).setDepth(101).setStroke('#0891b2', 2);

        this.hudBackpackText = this.add.text(hudX + 35, hudY + 86, '', { 
            fontFamily: 'Montserrat, Arial', 
            fontSize: '18px', 
            fontStyle: 'bold', 
            color: '#fef08a' 
        }).setScrollFactor(0).setDepth(101);

        this.updateHUD();
    }

    private updateHUD(force: boolean = false) {
        if (!this.hudHealthBar || !this.hudXpText || !this.hudBackpackText) return;
        const store = useGameStore.getState();

        // Performance Optimization: Skip HUD redraw if state hasn't changed
        if (!force &&
            this.lastHp === store.hp && 
            this.lastXp === store.xp && 
            this.lastPotions === store.potions && 
            this.lastLevel === store.level) {
            return;
        }

        this.lastHp = store.hp;
        this.lastXp = store.xp;
        this.lastPotions = store.potions;
        this.lastLevel = store.level;

        const barWidth = 160, barHeight = 8, barX = 60;

        this.hudHealthBar.clear();

        // Calculate filling
        let hpWidth = 0; if (store.maxHp > 0) hpWidth = (store.hp / store.maxHp) * barWidth;
        let xpWidth = 0; if (SCENE_CONFIG.LEVEL.XP_TO_LEVEL > 0) xpWidth = (store.xp / SCENE_CONFIG.LEVEL.XP_TO_LEVEL) * barWidth;

        // Visual Sanitization
        hpWidth = Math.max(0, Math.min(barWidth, hpWidth));
        xpWidth = Math.max(0, Math.min(barWidth, xpWidth));

        // Draw Health Bar (Ruby Gradient Simulation with Bloom effect)
        if (hpWidth > 0) {
            this.hudHealthBar.fillStyle(0xef4444, 1).fillRoundedRect(barX, 31, hpWidth, barHeight, 4);
            if (hpWidth > 10) this.hudHealthBar.fillStyle(0xffffff, 0.3).fillRoundedRect(barX + 2, 32, hpWidth - 4, barHeight / 2.5, 2);
        }

        // Draw XP Bar (Neon Cyan)
        if (xpWidth > 0) {
            this.hudHealthBar.fillStyle(0x22d3ee, 1).fillRoundedRect(barX, 71, xpWidth, barHeight - 2, 2);
        }

        this.hudXpText.setText(`${store.xp} / ${SCENE_CONFIG.LEVEL.XP_TO_LEVEL} XP`);
        this.hudBackpackText.setText(`x${store.potions}`);
        if (this.levelText) this.levelText.setText(store.level.toString());
    }

    private createSpeechBubble(target: Phaser.GameObjects.Sprite, text: string) {
        // Find if this target already has a bubble
        const isPlayer = target === this.player;
        const existingBubble = isPlayer ? this.playerSpeechBubble : this.npcSpeechBubble;

        if (existingBubble) {
            existingBubble.destroy();
        }

        // Measure text content dynamically with padding
        const maxWrapWidth = 320;
        const content = this.add.text(0, 0, text, { 
            fontFamily: 'Arial', 
            fontSize: '14px', 
            fontStyle: 'bold',
            color: '#0f172a', 
            align: 'center', 
            wordWrap: { width: maxWrapWidth } 
        });

        const bounds = content.getBounds();
        const paddingX = 20;
        const paddingY = 14;

        const bubbleWidth = Math.max(160, Math.min(360, bounds.width + paddingX * 2));
        const bubbleHeight = Math.max(48, bounds.height + paddingY * 2);

        const x = target.x;
        const y = target.y - 50 - bubbleHeight;

        // Draw dynamic background
        const bubble = this.add.graphics({ x: x - bubbleWidth / 2, y: y });
        // Shadow
        bubble.fillStyle(0x000000, 0.25).fillRoundedRect(3, 3, bubbleWidth, bubbleHeight, 14);
        // White rounded background
        bubble.fillStyle(0xffffff, 0.95).fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, 14);
        // Border stroke
        bubble.lineStyle(2.5, 0x6366f1, 1).strokeRoundedRect(0, 0, bubbleWidth, bubbleHeight, 14);
        // Tail triangle pointing down to character
        bubble.fillStyle(0xffffff, 0.95).fillTriangle(
            bubbleWidth / 2 - 10, bubbleHeight, 
            bubbleWidth / 2 + 10, bubbleHeight, 
            bubbleWidth / 2, bubbleHeight + 14
        );

        content.setPosition(
            bubble.x + (bubbleWidth / 2) - (bounds.width / 2), 
            bubble.y + (bubbleHeight / 2) - (bounds.height / 2)
        );
        
        const newBubble = this.add.container(0, 0, [bubble, content]).setDepth(2500);
        
        if (isPlayer) {
            this.playerSpeechBubble = newBubble;
        } else {
            this.npcSpeechBubble = newBubble;
        }
    }

    update() {
        if (!this.player || !this.cursors || !this.wasd) return;

        this.updateHUD();

        // Dynamic Magic Code Aura update based on player movement
        if (this.auraParticles && this.player.body) {
            const body = this.player.body as Phaser.Physics.Arcade.Body;
            const isMoving = Math.abs(body.velocity.x) > 10 || Math.abs(body.velocity.y) > 10;
            if (isMoving && !this.auraParticles.emitting) {
                this.auraParticles.start();
            } else if (!isMoving && this.auraParticles.emitting) {
                this.auraParticles.stop();
            }
        }

        if (this.crownParticles && this.player) {
            this.crownParticles.active = true;
        }
        
        // Freeze player & enemies, skip movement logic if interaction is locked or paused
        const isPaused = useGameStore.getState().isPaused;
        if ((this.isLocked || isPaused) && this.player?.body) {
            this.player.body.stop(); // Total physical silence for player
            this.player.anims.play('knight-idle', true);
            if (isPaused) this.player.anims.pause(); // Truly freeze during pause
            (this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

            // CRITICAL FIX: Freeze all enemies so they don't roll away during quizzes/dialogue!
            this.enemies?.getChildren().forEach((child) => {
                const e = child as Phaser.Physics.Arcade.Sprite;
                if (e.body) {
                    (e.body as Phaser.Physics.Arcade.Body).stop();
                    if (e.anims.isPlaying) e.anims.pause();
                }
            });

            return;
        } else if (this.player?.body) {
            (this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);
            if (this.player.anims.isPaused) this.player.anims.resume();

            // Resume enemy animations when lock is released
            this.enemies?.getChildren().forEach((child) => {
                const e = child as Phaser.Physics.Arcade.Sprite;
                if (e.anims.isPaused) e.anims.resume();
            });
        }

        // Individual Enemy AI & Dynamic Smooth Motion
        const time = this.time.now;
        this.enemies?.getChildren().forEach((child) => {
            const e = child as Phaser.Physics.Arcade.Sprite;
            if (!e.body || !e.active) return;

            const minX = e.getData('minX');
            const maxX = e.getData('maxX');
            const enemyType = e.getData('type');
            const body = e.body as Phaser.Physics.Arcade.Body;

            // Smooth Sine wave hover for Flyer enemies
            if (enemyType === 'flyer') {
                const baseY = e.getData('baseY');
                if (baseY) {
                    e.y = baseY + Math.sin(time / 300 + e.x) * 12;
                }
            }

            // Aggro Chaser behavior: Only chase if player is on the SAME platform level (deltaY < 50) AND within bounds
            if (enemyType === 'chaser' && this.player) {
                const deltaX = Math.abs(this.player.x - e.x);
                const deltaY = Math.abs(this.player.y - e.y);
                const isSameLevel = deltaY < 50; // Must be on the same platform level
                const canMoveInDir = (this.player.x > e.x && e.x < maxX) || (this.player.x < e.x && e.x > minX);

                if (deltaX < 220 && isSameLevel && canMoveInDir) {
                    const dir = (this.player.x > e.x) ? 1 : -1;
                    body.setVelocityX(SCENE_CONFIG.ENEMY.SPEED * 1.3 * dir);
                    e.setFlipX(dir < 0);
                    e.setTint(0xef4444); // Angry red tint when chasing
                    return;
                } else {
                    e.clearTint();
                }
            }

            // Restore movement velocity if stopped during quiz
            const currentSpeed = (enemyType === 'chaser') ? SCENE_CONFIG.ENEMY.SPEED * 1.1 : SCENE_CONFIG.ENEMY.SPEED;
            if (Math.abs(body.velocity.x) < 10) {
                body.setVelocityX(e.flipX ? -currentSpeed : currentSpeed);
            }

            // Turn back strictly at patrol limits minX and maxX (ignores false tile-seam blocks)
            if (e.x <= minX) {
                body.setVelocityX(Math.abs(currentSpeed));
                e.setFlipX(false);
            }
            else if (e.x >= maxX) {
                body.setVelocityX(-Math.abs(currentSpeed));
                e.setFlipX(true);
            }
        });

        if (this.isKnockback) return;

        const isGrounded = (this.player.body as Phaser.Physics.Arcade.Body).blocked.down || 
                           (this.player.body as Phaser.Physics.Arcade.Body).touching.down;
        
        const left = this.cursors.left.isDown || this.wasd.A.isDown;
        const right = this.cursors.right.isDown || this.wasd.D.isDown;
        const up = this.cursors.up.isDown || this.wasd.W.isDown;
        const down = this.cursors.down.isDown || this.wasd.S.isDown;

        const animKeys = this.getPlayerAnimKeys();

        // Kaizen: Crouching Mechanic
        if (down && isGrounded) {
            this.player.setVelocityX(0);
            this.player.anims.play(animKeys.crouch, true);
            this.player.setBodySize(60, 60).setOffset(34, 68); // Squashed hitbox
            return;
        } else {
            // Restore hitbox when not crouching
            this.player.setBodySize(SCENE_CONFIG.PLAYER.HITBOX.width, SCENE_CONFIG.PLAYER.HITBOX.height);
            this.player.setOffset(SCENE_CONFIG.PLAYER.HITBOX.offsetX, SCENE_CONFIG.PLAYER.HITBOX.offsetY);
        }

        if (left) {
            this.player.setVelocityX(-SCENE_CONFIG.PLAYER.SPEED);
            this.player.flipX = true;
            if (isGrounded) this.player.anims.play(animKeys.walk, true);
        } else if (right) {
            this.player.setVelocityX(SCENE_CONFIG.PLAYER.SPEED);
            this.player.flipX = false;
            if (isGrounded) this.player.anims.play(animKeys.walk, true);
        } else {
            this.player.setVelocityX(0);
            if (isGrounded) this.player.anims.play(animKeys.idle, true);
        }

        if (up && isGrounded) {
            this.player.setVelocityY(SCENE_CONFIG.PLAYER.JUMP_FORCE);
            this.sound.play('sfx_jump', { volume: 0.3 });
        }

        if (!isGrounded) this.player.anims.play(animKeys.jump, true);
    }

    private getPlayerAnimKeys() {
        const equippedSkin = useGameStore.getState().equippedSkin || 'default';
        switch (equippedSkin) {
            case 'bronze_armor':
                return {
                    idle: 'yellow-idle',
                    walk: 'yellow-walk',
                    jump: 'yellow-jump',
                    crouch: 'yellow-crouch'
                };
            case 'cyan_aura':
                return {
                    idle: 'purple-idle',
                    walk: 'purple-walk',
                    jump: 'purple-jump',
                    crouch: 'purple-crouch'
                };
            case 'gold_cloak':
                return {
                    idle: 'beige-idle',
                    walk: 'beige-walk',
                    jump: 'beige-jump',
                    crouch: 'beige-crouch'
                };
            default:
                return {
                    idle: 'knight-idle',
                    walk: 'knight-walk',
                    jump: 'knight-jump',
                    crouch: 'knight-crouch'
                };
        }
    }

    private showFloatingText(x: number, y: number, text: string, color: string = '#ff0000') {
        const floatingText = this.add.text(x, y, text, {
            fontSize: '24px',
            fontStyle: 'bold',
            color: color,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(2000);

        this.tweens.add({
            targets: floatingText,
            y: y - 100,
            alpha: 0,
            duration: 1500,
            ease: 'Cubic.easeOut',
            onComplete: () => floatingText.destroy()
        });
    }
}
