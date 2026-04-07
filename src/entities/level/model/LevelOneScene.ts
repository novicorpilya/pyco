import { Scene } from 'phaser';
import { EventBus } from '../../../shared/lib/phaser/EventBus';
import { TextureKeys } from '../../../shared/lib/phaser/AssetRegistry';
import { useGameStore } from '../../../shared/model/useGameStore';

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

    // State Flags
    private isInvulnerable: boolean = false;
    private isLocked: boolean = false;
    private isKnockback: boolean = false;
    private hasTriggeredQuiz: boolean = false;

    // HUD elements
    private hudHealthBar: Phaser.GameObjects.Graphics | null = null;
    private hudXpText: Phaser.GameObjects.Text | null = null;
    private hudBackpackText: Phaser.GameObjects.Text | null = null;
    private levelText: Phaser.GameObjects.Text | null = null;
    private wasd: Record<string, Phaser.Input.Keyboard.Key> | null = null;

    constructor() {
        super('LevelOneScene');
    }

    preload() {
        this.load.atlasXML(TextureKeys.Characters, '/Spritesheets/spritesheet-characters-default.png', '/Spritesheets/spritesheet-characters-default.xml');
        this.load.atlasXML(TextureKeys.Tiles, '/Spritesheets/spritesheet-tiles-default.png', '/Spritesheets/spritesheet-tiles-default.xml');
        this.load.atlasXML(TextureKeys.Backgrounds, '/Spritesheets/spritesheet-backgrounds-default.png', '/Spritesheets/spritesheet-backgrounds-default.xml');

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

        this.cameras.main.setBackgroundColor('#87CEEB');

        // Initialize Groups
        this.platforms = this.physics.add.staticGroup();
        this.coins = this.physics.add.group();
        this.spikes = this.physics.add.group({ allowGravity: false, immovable: true });
        this.enemies = this.physics.add.group();
        this.potions = this.physics.add.group({ allowGravity: false, immovable: true });

        // Level Bounds (Visual & Physics)
        this.physics.world.setBounds(0, 0, SCENE_CONFIG.LEVEL.WIDTH, height); 
        this.cameras.main.setBounds(0, 0, SCENE_CONFIG.LEVEL.WIDTH, height);

        // Kaizen: Create animations BEFORE characters to avoid 'Missing animation' warnings
        this.createAnimations();

        this.createEnvironment(height);
        this.createCharacters(height);
        this.setupCollisions();
        this.setupInput();
        this.createHUD();

        // Quiz Logic: Handle answer from React UI
        EventBus.on('quiz-answer-selected', (data: { isCorrect: boolean, isLast: boolean }) => {
            if (!this.scene || !this.scene.isActive()) return;
            
            if (data.isCorrect) {
                // SUCCESS FLOW
                useGameStore.getState().addXp(10);
                this.showFloatingText(this.player!.x, this.player!.y - 50, "+10 XP", "#22d3ee");

                if (!data.isLast) {
                    // DIALOGUE BETWEEN QUESTIONS
                    this.createSpeechBubble(this.masterNPC!, "Ты не так прост, как я думал!");
                    
                    this.time.delayedCall(2000, () => {
                        this.createSpeechBubble(this.masterNPC!, "Попробуй теперь на 2-й вопрос ответить...");
                    });

                    this.time.delayedCall(4000, () => {
                        EventBus.emit('quiz-next-question');
                    });
                } else {
                    // FINAL SUCCESS
                    this.createSpeechBubble(this.masterNPC!, "Правильно! Ты действительно мастер кода!");
                    this.time.delayedCall(2000, () => {
                        this.createSpeechBubble(this.masterNPC!, "Путь свободен, иди дальше!");
                        
                        // New: Trigger the beautiful disappearance and portal appearance
                        this.time.delayedCall(2000, () => {
                            this.onQuestFinished();
                        });
                    });
                }
            } else {
                // FAILURE FLOW (PENALTY & RETRY)
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
                    this.createSpeechBubble(this.masterNPC!, "Твоих знаний теперь недостаточно!");
                    
                    this.time.delayedCall(2500, () => {
                        this.createSpeechBubble(this.masterNPC!, "Приходи позже, когда вернешь свою мудрость...");
                        this.hasTriggeredQuiz = false; // Allow them to trigger interaction again later
                        this.isLocked = false;
                        if (this.player?.body) (this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);
                    });
                    
                    this.cameras.main.shake(500, 0.01);
                    return;
                }

                this.createSpeechBubble(this.masterNPC!, "Хмм... Это был неверный ответ!");
                
                this.time.delayedCall(2500, () => {
                    this.createSpeechBubble(this.masterNPC!, "За это я забираю твои знания... -50 XP!");
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

    private resetState() {
        this.isInvulnerable = false;
        this.isLocked = false;
        this.isKnockback = false;
        this.hasTriggeredQuiz = false;
    }

    private createEnvironment(height: number) {
        // Ground MIDDLE
        for (let x = 32; x <= SCENE_CONFIG.LEVEL.WIDTH + 32; x += 64) {
            this.platforms?.create(x, height - 32, TextureKeys.Tiles, 'terrain_grass_horizontal_middle');
        }

        // Floating Islands & Coins
        const islandCoords = [416, 480, 544, 900, 964, 1028];
        islandCoords.forEach(x => {
            this.platforms?.create(x, height - 200, TextureKeys.Tiles, 'terrain_grass_horizontal_middle');

            // High-Res Gold Coin 2x Asset
            const coin = this.coins?.create(x, height - 264, 'coin_gold_high');
            if (coin) {
                coin.setScale(0.5); 
                coin.setBounceY(0.5);
                
                // GREAT ANIMATION: High-Fidelity 3D Spin Cycle + Golden Glint
                this.tweens.add({
                    targets: coin,
                    scaleX: -0.5,
                    duration: 1200 + Math.random() * 600,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                    onYoyo: () => {
                        // Flash of gold glint when rotating edge-on
                        coin.setTint(0xffffff);
                        this.time.delayedCall(50, () => coin.clearTint());
                    },
                    onRepeat: () => {
                        coin.setTint(0xffffff);
                        this.time.delayedCall(50, () => coin.clearTint());
                    }
                });

                // (Bobbing animation removed per user request)
            }
        });

        // Potions (Knowledge Gems) - High Visibility Depth
        const potionObj = this.potions!.create(1300, height - 96, TextureKeys.Tiles, 'gem_blue');
        if (potionObj) {
            potionObj.setDepth(5);
            
            // Pulsing Heartbeat effect for the gem
            this.tweens.add({
                targets: potionObj,
                scale: 1.25,
                duration: 700,
                yoyo: true,
                repeat: -1,
                ease: 'Back.easeInOut',
                hold: 150
            });
        }

        // Spikes
        const spikeCoords = [608, 672, 1100, 1164];
        spikeCoords.forEach(x => {
            const spike = this.spikes?.create(x, height - 96, TextureKeys.Tiles, 'spikes');
            const body = spike.body as Phaser.Physics.Arcade.Body;

            // Kaizen: Direct body manipulation on a normal group is much more reliable
            body.setSize(SCENE_CONFIG.SPIKES.HITBOX.width, SCENE_CONFIG.SPIKES.HITBOX.height);
            body.setOffset(SCENE_CONFIG.SPIKES.HITBOX.offsetX, SCENE_CONFIG.SPIKES.HITBOX.offsetY);
        });
    }

    private createCharacters(height: number) {
        // Player
        this.player = this.physics.add.sprite(100, height - 128, TextureKeys.Characters, 'character_green_idle');
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        this.player.setScale(SCENE_CONFIG.PLAYER.SCALE).setDepth(10);
        this.player.setBodySize(SCENE_CONFIG.PLAYER.HITBOX.width, SCENE_CONFIG.PLAYER.HITBOX.height);
        this.player.setOffset(SCENE_CONFIG.PLAYER.HITBOX.offsetX, SCENE_CONFIG.PLAYER.HITBOX.offsetY);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Enemy #1: Spike Patrol (Between 680 and 1090)
        const enemy1 = this.enemies?.create(880, height - 96, TextureKeys.Characters, 'character_pink_idle');
        enemy1.setScale(SCENE_CONFIG.ENEMY.SCALE).setCollideWorldBounds(true).setImmovable(true);
        if (enemy1.body) (enemy1.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        enemy1.setVelocityX(-SCENE_CONFIG.ENEMY.SPEED).setFlipX(true);
        enemy1.setData('minX', 680);
        enemy1.setData('maxX', 1090);

        // Enemy #2: Start Patrol (Between 250 and 580)
        const enemy2 = this.enemies?.create(400, height - 96, TextureKeys.Characters, 'character_pink_idle');
        enemy2.setScale(SCENE_CONFIG.ENEMY.SCALE).setCollideWorldBounds(true).setImmovable(true);
        if (enemy2.body) (enemy2.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        enemy2.setVelocityX(SCENE_CONFIG.ENEMY.SPEED).setFlipX(false);
        enemy2.setData('minX', 250);
        enemy2.setData('maxX', 580);

        // Master NPC 
        const npcX = SCENE_CONFIG.LEVEL.WIDTH - 200;
        this.masterNPC = this.physics.add.sprite(npcX, height - 64, TextureKeys.Characters, 'character_beige_idle');
        this.masterNPC.setScale(0.5).setFlipX(true).setImmovable(true).setOrigin(0.5, 1);
        if (this.masterNPC.body) (this.masterNPC.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        this.createSpeechBubble(this.masterNPC, "Эй, я слышал тебе нужны знания!");

        // Portal (Tall Magical Gateway)
        this.portal = this.physics.add.sprite(SCENE_CONFIG.LEVEL.WIDTH - 80, height - 64, TextureKeys.Tiles, 'door_open');
        this.portal.setScale(1.2).setOrigin(0.5, 1).setVisible(false).setActive(false).setDepth(1); // Below player
        if (this.portal.body) {
            const body = this.portal.body as Phaser.Physics.Arcade.Body;
            body.setAllowGravity(false);
            body.setSize(20, 64);
            body.setOffset(22, 0);
        }

        // Add a "top" part to make it tall
        const portalTop = this.add.image(this.portal.x, this.portal.y - 64 * 1.2, TextureKeys.Tiles, 'door_open_top');
        portalTop.setScale(1.2).setOrigin(0.5, 1).setVisible(false).setName('portalTop').setDepth(1);
    }

    private createAnimations() {
        if (!this.anims.exists('knight-idle')) {
            this.anims.create({
                key: 'knight-idle',
                frames: [{ key: TextureKeys.Characters, frame: 'character_green_idle' }]
            });
        }

        if (!this.anims.exists('knight-walk')) {
            this.anims.create({
                key: 'knight-walk',
                frames: [
                    { key: TextureKeys.Characters, frame: 'character_green_walk_a' },
                    { key: TextureKeys.Characters, frame: 'character_green_walk_b' }
                ],
                frameRate: 8,
                repeat: -1
            });
        }

        if (!this.anims.exists('knight-jump')) {
            this.anims.create({
                key: 'knight-jump',
                frames: [{ key: TextureKeys.Characters, frame: 'character_green_jump' }]
            });
        }

        if (!this.anims.exists('knight-crouch')) {
            this.anims.create({
                key: 'knight-crouch',
                frames: [{ key: TextureKeys.Characters, frame: 'character_green_duck' }]
            });
        }
    }

    private setupCollisions() {
        if (!this.player) return;

        this.physics.add.collider(this.player, this.platforms!);
        this.physics.add.collider(this.coins!, this.platforms!);
        this.physics.add.collider(this.enemies!, this.platforms!);

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
        EventBus.on('restart-game', () => {
            this.scene.restart();
        }, this);

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
        // Kaizen: Only the player gets knocked back. The enemy keeps walking.
        this.isKnockback = true;
        const knockDir = (p.x < e.x) ? -400 : 400; // Increased power
        p.setVelocity(knockDir, -350);
        this.time.delayedCall(SCENE_CONFIG.DURATIONS.KNOCKBACK, () => this.isKnockback = false);

        this.handleDamage(SCENE_CONFIG.ENEMY.DAMAGE);
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

        // Invulnerability end (restores visibility and tint)
        this.time.delayedCall(SCENE_CONFIG.DURATIONS.INVULNERABILITY, () => {
            if (this.player) {
                this.player.visible = true;
                this.player.clearTint();
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
        EventBus.emit('show-question', { index: 0 });
    }

    private onQuestFinished() {
        if (this.npcSpeechBubble) {
            this.tweens.add({ 
                targets: this.npcSpeechBubble, alpha: 0, duration: 500, 
                onComplete: () => { this.npcSpeechBubble?.destroy(); this.npcSpeechBubble = null; } 
            });
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

                            // DYNAMIC ACHIEVEMENT CALCULATION
                            let finalAchievement = 'Бронзовый кубок';
                            if (store.level >= 4) finalAchievement = 'Золотой шлем';
                            else if (store.level >= 2) finalAchievement = 'Серебряный меч';

                            store.setVictory(true);
                            store.setAchievement(finalAchievement);
                        }
                    });
                });
            }
        });
    }

    private createHUD() {
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

    private updateHUD() {
        if (!this.hudHealthBar || !this.hudXpText || !this.hudBackpackText) return;
        const store = useGameStore.getState();
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

        const x = target.x;
        const y = target.y - 120;

        const bubbleWidth = 220, bubbleHeight = 50;
        const bubble = this.add.graphics({ x: x - bubbleWidth / 2, y: y - bubbleHeight });
        bubble.fillStyle(0x000000, 0.2).fillRoundedRect(4, 4, bubbleWidth, bubbleHeight, 12);
        bubble.fillStyle(0xffffff, 0.9).fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, 12);
        bubble.lineStyle(2, 0x6366f1, 1).strokeRoundedRect(0, 0, bubbleWidth, bubbleHeight, 12);
        bubble.fillStyle(0xffffff, 0.9).fillTriangle(bubbleWidth / 2 - 10, bubbleHeight, bubbleWidth / 2 + 10, bubbleHeight, bubbleWidth / 2, bubbleHeight + 15);

        const content = this.add.text(0, 0, text, { 
            fontFamily: 'Arial', 
            fontSize: '14px', 
            color: '#1e293b', 
            align: 'center', 
            wordWrap: { width: bubbleWidth - 20 } 
        });
        const b = content.getBounds();
        content.setPosition(bubble.x + (bubbleWidth / 2) - (b.width / 2), bubble.y + (bubbleHeight / 2) - (b.height / 2));
        
        const newBubble = this.add.container(0, 0, [bubble, content]);
        
        if (isPlayer) {
            this.playerSpeechBubble = newBubble;
        } else {
            this.npcSpeechBubble = newBubble;
        }
    }

    update() {
        if (!this.player || !this.cursors || !this.wasd) return;

        this.updateHUD();
        
        // Freeze player and skip movement logic if interaction is locked or paused
        const isPaused = useGameStore.getState().isPaused;
        if ((this.isLocked || isPaused) && this.player?.body) {
            this.player.body.stop(); // Total physical silence
            this.player.anims.play('knight-idle', true);
            if (isPaused) this.player.anims.pause(); // Truly freeze during pause
            (this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
            return;
        } else if (this.player?.body) {
            (this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);
            if (this.player.anims.isPaused) this.player.anims.resume();
        }

        // Individual Enemy AI: Checks local data for patrol bounds
        this.enemies?.getChildren().forEach((child) => {
            const e = child as Phaser.Physics.Arcade.Sprite;
            if (!e.body) return;

            const minX = e.getData('minX');
            const maxX = e.getData('maxX');
            
            // Turn back if reached a patrol limit or blocked by a wall
            if (e.x <= minX || e.body.blocked.left) {
                e.setVelocityX(SCENE_CONFIG.ENEMY.SPEED);
                e.setFlipX(false);
            }
            else if (e.x >= maxX || e.body.blocked.right) {
                e.setVelocityX(-SCENE_CONFIG.ENEMY.SPEED);
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

        // Kaizen: Crouching Mechanic
        if (down && isGrounded) {
            this.player.setVelocityX(0);
            this.player.anims.play('knight-crouch', true);
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
            if (isGrounded) this.player.anims.play('knight-walk', true);
        } else if (right) {
            this.player.setVelocityX(SCENE_CONFIG.PLAYER.SPEED);
            this.player.flipX = false;
            if (isGrounded) this.player.anims.play('knight-walk', true);
        } else {
            this.player.setVelocityX(0);
            if (isGrounded) this.player.anims.play('knight-idle', true);
        }

        if (up && isGrounded) {
            this.player.setVelocityY(SCENE_CONFIG.PLAYER.JUMP_FORCE);
            this.sound.play('sfx_jump', { volume: 0.3 });
        }

        if (!isGrounded) this.player.anims.play('knight-jump', true);
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
