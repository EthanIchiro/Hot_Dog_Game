namespace SpriteKind {
    export const Cannon = SpriteKind.create()
    export const Squirrel = SpriteKind.create()
    export const Seagull = SpriteKind.create()
    export const Fry = SpriteKind.create()
    export const KetchupKing = SpriteKind.create()
    export const BonusDog = SpriteKind.create()
}

// =========================
// CORE STATE
// =========================
let Player: Sprite = null
let Bullet: Sprite = null
let Bullet_cannon: Sprite = null
let Enemy: Sprite = null
let Hot_Dog: Sprite = null
let target: Sprite = null
let SquirrelSpr: Sprite = null
let SeagullSpr: Sprite = null
let KingSpr: Sprite = null

let can_shoot = true
let cannon_launch_ready = true
let cannon_cooldown = 0
let chase_tick = 0
let busy = false
let dx = 0
let dy = 0
let musicStarted = false

let hotdog_launch_ready = true
let hotdog_cooldown = 0
let hotdog_is_plain = false
let cannon_is_messy = false
let shoot_cooldown = 0
let SHOOT_DELAY_NORMAL = 8
let SHOOT_DELAY_MESSY = 35

let start_grace = 0
const START_GRACE_FRAMES = 45
let cannon_died_this_run = false

let SCREEN_W = 160
let SCREEN_H = 120
let game_started = false
let run_frames = 0

let revolt_active = false
let revolt_timer = 0
let revolt_trigger_at = 0

let angry_dog = false
let angry_timer = 0

let player_slip_timer = 0
let fry_rain_timer = 0
let enemy_fry_mode = false
let event_cooldown = 0
let cannon_chat_timer = 0
let chatter_timer = 0

let squirrel_timer = 0
let seagull_timer = 0
let king_timer = 0
let giant_dog_timer = 0
let hotdog_scale_boost = false

let storm_active = false
let storm_end_time = 0
let bonus_eaten = 0

let enemy_404_busy = false

// "normal" | "squirrel" | "none"
let enemy_focus = "normal"

// =========================
// ACHIEVEMENTS (SCORE ONLY — NEVER LIFE)
// =========================
const ACH_NAMES = [
    "Lunch Win",
    "Snipe Win",
    "Yeet",
    "Splat",
    "Plain Win",
    "No Cannon Win",
    "Cannon Break",
    "Self Shot",
    "Shot Lunch",
    "Stolen Lunch",
    "Sticky Shot",
    "All Done",
]

const ACH_DESC = [
    "Eat the hot dog.",
    "Shoot the enemy.",
    "Get launched by the cannon.",
    "Toppings splat on the cannon.",
    "Win with a plain hot dog.",
    "Win after the cannon breaks.",
    "Break the cannon.",
    "Shoot yourself.",
    "Shoot the hot dog.",
    "Enemy eats the hot dog.",
    "Shoot while sticky.",
    "Unlock all others.",
]

let achUnlocked: boolean[] = []

function achLoad() {
    achUnlocked = []
    for (let i = 0; i < ACH_NAMES.length; i++) {
        achUnlocked.push(settings.readNumber("ach_" + i) == 1)
    }
}

function achCount() {
    let n = 0
    for (let i = 0; i < achUnlocked.length; i++) {
        if (achUnlocked[i]) {
            n += 1
        }
    }
    return n
}

function updateAchHUD() {
    info.setScore(achCount())
}

function showAchievements() {
    game.setDialogTextColor(7)
    let unlockedText = "UNLOCKED  " + achCount() + " / " + ACH_NAMES.length + "\n"
    let anyUnlocked = false
    for (let i = 0; i < ACH_NAMES.length; i++) {
        if (achUnlocked[i]) {
            anyUnlocked = true
            unlockedText += "\n* " + ACH_NAMES[i]
            unlockedText += "\n  " + ACH_DESC[i]
        }
    }
    if (!anyUnlocked) {
        unlockedText += "\n\n(none yet)"
    }
    game.showLongText(unlockedText, DialogLayout.Center)

    game.setDialogTextColor(1)
    let lockedText = "LOCKED\n"
    let anyLocked = false
    for (let j = 0; j < ACH_NAMES.length; j++) {
        if (!achUnlocked[j]) {
            anyLocked = true
            lockedText += "\n- " + ACH_NAMES[j]
            lockedText += "\n  " + ACH_DESC[j]
        }
    }
    if (!anyLocked) {
        lockedText += "\n\nAll done!"
    }
    game.showLongText(lockedText, DialogLayout.Center)
    game.setDialogTextColor(1)
}

function achUnlock(id: number) {
    if (id < 0 || id >= ACH_NAMES.length) {
        return
    }
    if (achUnlocked[id]) {
        return
    }
    achUnlocked[id] = true
    settings.writeNumber("ach_" + id, 1)
    updateAchHUD()
    music.play(music.stringPlayable("C5:1 E5:1 G5:1 C6:2", 200), music.PlaybackMode.InBackground)
    game.setDialogTextColor(7)
    game.splash(ACH_NAMES[id], ACH_DESC[id])
    game.setDialogTextColor(1)

    if (id != 11) {
        let all = true
        for (let k = 0; k < ACH_NAMES.length - 1; k++) {
            if (!achUnlocked[k]) {
                all = false
            }
        }
        if (all) {
            achUnlock(11)
        }
    }
}

// =========================
// IMAGES
// =========================
function imgCannonClean() {
    return img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . f f f f . . . . . . .
        . . . . . . 3 3 f . . . . . . .
        . . . . . f f 3 f . . . . . . .
        . . . . . . f 3 f . . . . . . .
        . . . . f f f 3 f f . . . . . .
        . . . . f 3 3 3 3 f . . . . . .
        . . . . f 3 3 3 3 f . . . . . .
        . . . . f 3 3 3 3 f . . . . . .
        . . . . f 3 3 3 3 f . . . . . .
        . . . . f f f f f f . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `
}

function imgCannonMessy() {
    return img`
        . . . . . . . . . . . . . . . .
        . . . . . . 2 . 5 . . . . . . .
        . . . . . 2 2 5 5 2 . . . . . .
        . . . . . f f f f . . . . . . .
        . . . . 5 . 3 3 f 2 . . . . . .
        . . . . . f f 3 f . 5 . . . . .
        . . . 2 . . f 3 f . . . . . . .
        . . . . f f f 3 f f . 2 . . . .
        . . . . f 3 3 3 3 f 5 . . . . .
        . . 5 . f 3 2 3 5 f . . . . . .
        . . . . f 3 3 3 3 f . 2 . . . .
        . . . 2 f 5 3 2 3 f . . . . . .
        . . . . f f f f f f . 5 . . . .
        . . . . . 2 . 5 . 2 . . . . . .
        . . . . . . 5 2 . . . . . . . .
        . . . . . . . . . . . . . . . .
    `
}

function imgHotDogPlain() {
    return img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . 4 4 4 4 4 4 4 . . . . .
        . . . 4 4 4 4 4 4 4 4 4 . . . .
        . . 4 4 e e e e e e e 4 4 . . .
        . . 4 4 e e e e e e e 4 4 . . .
        . . . 4 4 4 4 4 4 4 4 4 . . . .
        . . . . 4 4 4 4 4 4 4 . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `
}

function imgBonusDog() {
    return img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . 4 4 4 4 4 4 4 4 4 . . . .
        . . 4 4 4 4 4 4 4 4 4 4 4 . . .
        . 4 4 e e e e e e e e e 4 4 . .
        . 4 4 e 2 5 2 5 2 5 2 e 4 4 . .
        . 4 4 e 5 2 5 2 5 2 5 e 4 4 . .
        . 4 4 e 2 5 2 5 2 5 2 e 4 4 . .
        . 4 4 e e e e e e e e e 4 4 . .
        . . 4 4 4 4 4 4 4 4 4 4 4 . . .
        . . . 4 4 4 4 4 4 4 4 4 . . . .
        . . . . 2 . 5 . 2 . 5 . . . . .
        . . . . . 5 . 2 . 5 . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `
}

function imgSquirrel() {
    return img`
        . . . . . . . . . . . . . . . .
        . . . . . e e e . . . . . . . .
        . . . . e e e e e . . . . . . .
        . . . e e f e f e e . . . . . .
        . . . e e e e e e e . . . . . .
        . . . . e e e e e . . . e . . .
        . . . . . e e e . . e e e . . .
        . . . . . e e e e e e . . . . .
        . . . . e e e e e e . . . . . .
        . . . e e e . . e e . . . . . .
        . . . e e . . . . e . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `
}

function imgSeagull() {
    return img`
        . . . . . . . . . . . . . . . .
        . . . . 1 1 . . 1 1 . . . . . .
        . . . 1 1 1 1 1 1 1 1 . . . . .
        . . . . . 1 1 1 1 . . . . . . .
        . . . . . 1 f 1 f . . . . . . .
        . . . . . 1 1 5 1 . . . . . . .
        . . . . . . 1 1 . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `
}

function imgFry() {
    return img`
        . . . . . . . .
        . . 5 5 4 . . .
        . . 5 5 4 . . .
        . . 5 4 4 . . .
        . . 5 4 . . . .
        . . 4 . . . . .
        . . . . . . . .
        . . . . . . . .
    `
}

function imgKing() {
    return img`
        . . . . 2 2 2 2 2 2 . . . . . .
        . . . 2 2 2 2 2 2 2 2 . . . . .
        . . 2 2 2 2 2 2 2 2 2 2 . . . .
        . 2 2 2 f 2 2 2 2 f 2 2 2 . . .
        . 2 2 2 2 2 2 2 2 2 2 2 2 . . .
        . 2 2 2 2 2 5 5 2 2 2 2 2 . . .
        . . 2 2 2 2 2 2 2 2 2 2 . . . .
        . . . 2 2 2 2 2 2 2 2 . . . . .
        . . . . 2 2 2 2 2 2 . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `
}

// =========================
// UTILS / SFX / DIALOGUE
// =========================
function distance_squared(a: Sprite, b: Sprite) {
    dx = a.x - b.x
    dy = a.y - b.y
    return dx * dx + dy * dy
}

function wrap_sprite(sprite: Sprite) {
    if (!sprite) {
        return
    }
    if (sprite.x < 0) {
        sprite.x = SCREEN_W
    } else if (sprite.x > SCREEN_W) {
        sprite.x = 0
    }
    if (sprite.y < 0) {
        sprite.y = SCREEN_H
    } else if (sprite.y > SCREEN_H) {
        sprite.y = 0
    }
}

function overlaps_active() {
    return game_started && !busy && start_grace <= 0 && !!Player
}

function start_music() {
    if (musicStarted) {
        return
    }
    musicStarted = true
    music.setVolume(40)
    music.play(music.stringPlayable(
        "C4:4 E4:4 G4:4 A4:4 G4:4 E4:4 C4:4 R:2 " +
        "D4:4 F4:4 A4:4 B4:4 A4:4 F4:4 D4:4 R:2 " +
        "E4:4 G4:4 B4:4 C5:4 B4:4 G4:4 E4:4 R:2 " +
        "G4:2 F4:2 E4:2 D4:2 C4:4 R:4",
        160
    ), music.PlaybackMode.LoopingInBackground)
}

function sfx_shoot() {
    music.play(music.tonePlayable(880, music.beat(BeatFraction.Eighth)), music.PlaybackMode.InBackground)
}
function sfx_yeet() {
    music.play(music.stringPlayable("G4:1 B4:1 D5:1 G5:2", 220), music.PlaybackMode.InBackground)
}
function sfx_splat() {
    music.play(music.stringPlayable("E3:1 G3:1 C3:2 E3:1", 150), music.PlaybackMode.InBackground)
}
function sfx_cannon_break() {
    music.play(music.stringPlayable("E3:2 C3:2 A2:4", 120), music.PlaybackMode.InBackground)
}
function sfx_hit() {
    music.play(music.stringPlayable("C4:1 A3:1 F3:2", 180), music.PlaybackMode.InBackground)
}
function sfx_win() {
    music.play(music.stringPlayable("C4:2 E4:2 G4:2 C5:4", 140), music.PlaybackMode.InBackground)
}
function sfx_lose() {
    music.play(music.stringPlayable("G4:2 E4:2 C4:2 A3:4", 100), music.PlaybackMode.InBackground)
}
function sfx_eat() {
    music.play(music.stringPlayable("E5:1 G5:1 E5:1 C5:2", 200), music.PlaybackMode.InBackground)
}
function sfx_event() {
    music.play(music.stringPlayable("C5:1 R:1 E5:1 R:1 G5:2", 180), music.PlaybackMode.InBackground)
}
function sfx_sneeze() {
    music.play(music.stringPlayable("B4:1 G4:1 E3:3", 160), music.PlaybackMode.InBackground)
}

function say_random(sprite: Sprite, lines: string[]) {
    if (!sprite || lines.length == 0) {
        return
    }
    sprite.sayText(lines[randint(0, lines.length - 1)])
}

const PLAYER_LINES = [
    "MY LUNCH!",
    "NOT AGAIN!",
    "WHY DOES THIS KEEP HAPPENING?",
    "I'M STARVING!",
    "THIS IS FINE.",
]
const ENEMY_LINES = [
    "FOOD DETECTED.",
    "HOT DOG ACQUIRED.",
    "NOM NOM NOM.",
    ":)",
    "YUMMY",
]
const DOG_LINES = [
    "Protect me!",
    "DON'T SHOOT ME!",
    "I MISS MY KETCHUP!",
    "HELP!",
    "WHY ME?",
]
const CANNON_LINES_CLEAN = [
    "READY!",
    "I LIKE HOT DOGS",
    "DON'T TOUCH ME",
    "PLEASE STAY CLEAN",
    "FIRE!",
    "PEW!",
    "YEET!",
]
const CANNON_LINES_MESSY = [
    "I'M STICKY!",
    "I MISS MY KETCHUP",
    "RELOADING...",
    "EWW",
    "sticky...",
]

function scramble_lose_message() {
    // every 100 ms: randint(0, randint(10, randint(100, 999)))
    let loseText = "" + randint(0, randint(10, randint(100, 999)))
    game.setGameOverMessage(false, loseText)
}

function end_game(win: boolean) {
    music.stopAllSounds()
    if (win) {
        sfx_win()
        game.setGameOverMessage(true, "YOU WIN!!")
    } else {
        sfx_lose()
        scramble_lose_message()
    }
    pause(100)
    game.over(win)
}

function destroy_cannon(reason_text: string) {
    if (!Bullet_cannon) {
        return
    }
    sfx_cannon_break()
    if (randint(0, 1) == 0) {
        Bullet_cannon.sayText("I WAS ONLY 3 DAYS FROM RETIREMENT...")
        pause(700)
    }
    Bullet_cannon.sayText(reason_text)
    Bullet_cannon.destroy()
    Bullet_cannon = null
    can_shoot = false
    cannon_died_this_run = true
    achUnlock(6)
    if (Bullet) {
        controller.moveSprite(Bullet, 100, 100)
        Bullet.sayText("I remain!!!")
    }
    if (Player) {
        Player.sayText("The cannon is gone!!!")
    }
}

function clear_event_sprites() {
    sprites.destroyAllSpritesOfKind(SpriteKind.Squirrel)
    sprites.destroyAllSpritesOfKind(SpriteKind.Seagull)
    sprites.destroyAllSpritesOfKind(SpriteKind.Fry)
    sprites.destroyAllSpritesOfKind(SpriteKind.KetchupKing)
    sprites.destroyAllSpritesOfKind(SpriteKind.BonusDog)
    SquirrelSpr = null
    SeagullSpr = null
    KingSpr = null
}

// =========================
// 404 GLITCH WIN
// =========================
function try_enemy_404_glitch() {
    if (!game_started || busy || enemy_404_busy || start_grace > 0) {
        return
    }
    if (!Enemy || !Player) {
        return
    }

    enemy_404_busy = true
    busy = true
    Enemy.setVelocity(0, 0)

    sfx_event()
    Enemy.sayText("404 Error: Food not dected")
    pause(900)

    if (Enemy) {
        Enemy.sayText("404: Cannot turn off")
    }
    pause(900)

    if (Enemy) {
        Enemy.sayText("...")
        pause(400)
        Enemy.destroy()
        Enemy = null
    }

    if (Player) {
        Player.sayText("free win???")
    }
    pause(600)

    achUnlock(1)
    end_game(true)
}

// =========================
// HOT DOG STORM (7.777 sec)
// =========================
function start_hot_dog_storm() {
    if (!Player || storm_active) {
        return
    }
    storm_active = true
    storm_end_time = game.runtime() + 7777
    bonus_eaten = 0
    sfx_event()

    Player.sayText("HOT DOG STORM!!!")
    if (Hot_Dog) {
        Hot_Dog.sayText("BRING FRIENDS!!!")
    }
    if (Enemy) {
        Enemy.sayText("hey no fair...")
    }
    if (Bullet_cannon) {
        Bullet_cannon.sayText("I LIKE HOT DOGS")
    }

    for (let i = 0; i < randint(18, 28); i++) {
        let d = sprites.create(imgBonusDog(), SpriteKind.BonusDog)
        d.setPosition(randint(10, 150), randint(10, 110))
        d.setVelocity(randint(-40, 40), randint(-40, 40))
        d.setBounceOnWall(true)
    }
}

function end_hot_dog_storm() {
    storm_active = false
    storm_end_time = 0
    sprites.destroyAllSpritesOfKind(SpriteKind.BonusDog)
    if (Player) {
        if (bonus_eaten <= 0) {
            Player.sayText("I missed the storm...")
        } else if (bonus_eaten < 5) {
            Player.sayText("Only " + bonus_eaten + " extra dogs?!")
        } else if (bonus_eaten < 15) {
            Player.sayText(bonus_eaten + " bonus dogs!!")
        } else {
            Player.sayText(bonus_eaten + " DOGS!!! I'M FULL!!!")
        }
    }
    if (Enemy) {
        Enemy.sayText(":(")
    }
}

function update_hot_dog_storm() {
    if (!storm_active) {
        return
    }
    if (run_frames % 30 == 0) {
        for (let d of sprites.allOfKind(SpriteKind.BonusDog)) {
            d.setVelocity(randint(-50, 50), randint(-50, 50))
            wrap_sprite(d)
        }
    }
    if (game.runtime() >= storm_end_time || sprites.allOfKind(SpriteKind.BonusDog).length == 0) {
        end_hot_dog_storm()
    }
}

// =========================
// OTHER EVENTS
// =========================
function start_revolt() {
    if (!Hot_Dog || revolt_active || angry_dog) {
        return
    }
    revolt_active = true
    revolt_timer = randint(180, 300)
    controller.moveSprite(Hot_Dog, 0, 0)
    Hot_Dog.sayText("I'M TIRED OF WAITING!")
    pause(400)
    if (Hot_Dog) {
        Hot_Dog.sayText("SAVE YOURSELF!")
    }
    sfx_event()
}

function end_revolt() {
    revolt_active = false
    revolt_timer = 0
    if (Hot_Dog && !angry_dog) {
        controller.moveSprite(Hot_Dog, 60, 100)
        Hot_Dog.sayText("ok I'm calm...")
    }
}

function update_revolt() {
    if (!revolt_active || !Hot_Dog) {
        return
    }
    revolt_timer -= 1
    let vx = 0
    let vy = 0
    if (Player) {
        if (Hot_Dog.x < Player.x) vx -= 2
        else if (Hot_Dog.x > Player.x) vx += 2
        if (Hot_Dog.y < Player.y) vy -= 2
        else if (Hot_Dog.y > Player.y) vy += 2
    }
    if (Enemy) {
        if (Hot_Dog.x < Enemy.x) vx -= 2
        else if (Hot_Dog.x > Enemy.x) vx += 2
        if (Hot_Dog.y < Enemy.y) vy -= 2
        else if (Hot_Dog.y > Enemy.y) vy += 2
    }
    Hot_Dog.x += vx
    Hot_Dog.y += vy
    if (revolt_timer <= 0) {
        end_revolt()
    }
}

function maybe_angry_hotdog() {
    if (angry_dog || !Hot_Dog) {
        return
    }
    if (randint(0, 100) < 45) {
        angry_dog = true
        angry_timer = randint(300, 480)
        controller.moveSprite(Hot_Dog, 0, 0)
        Hot_Dog.sayText("I HAVE HAD ENOUGH!")
        if (Player) {
            Player.sayText("GET 'EM!!")
        }
        sfx_event()
    }
}

function update_angry_dog() {
    if (!angry_dog || !Hot_Dog) {
        return
    }
    angry_timer -= 1
    if (Enemy) {
        if (Hot_Dog.x < Enemy.x) Hot_Dog.x += 2
        else if (Hot_Dog.x > Enemy.x) Hot_Dog.x -= 2
        if (Hot_Dog.y < Enemy.y) Hot_Dog.y += 2
        else if (Hot_Dog.y > Enemy.y) Hot_Dog.y -= 2

        if (distance_squared(Hot_Dog, Enemy) < 120) {
            Enemy.sayText("WHY IS THE HOT DOG ALIVE?!")
            if (Player) {
                Player.sayText("GET 'EM!!")
            }
            Enemy.x = randint(10, 150)
            Enemy.y = randint(10, 110)
            sfx_hit()
        }
    }
    if (angry_timer <= 0) {
        angry_dog = false
        if (Hot_Dog && !revolt_active) {
            controller.moveSprite(Hot_Dog, 60, 100)
            Hot_Dog.sayText("huff...")
        }
    }
}

function spawn_squirrel() {
    if (!Hot_Dog || SquirrelSpr) {
        return
    }
    SquirrelSpr = sprites.create(imgSquirrel(), SpriteKind.Squirrel)
    SquirrelSpr.setPosition(Hot_Dog.x, Hot_Dog.y)
    SquirrelSpr.sayText("FREE LUNCH!")
    sfx_event()
    enemy_focus = "squirrel"
    squirrel_timer = randint(300, 480)
    controller.moveSprite(Hot_Dog, 0, 0)
}

function update_squirrel() {
    if (!SquirrelSpr) {
        return
    }
    squirrel_timer -= 1
    if (run_frames % 15 == 0) {
        SquirrelSpr.setVelocity(randint(-80, 80), randint(-80, 80))
    }
    if (Hot_Dog) {
        Hot_Dog.setPosition(SquirrelSpr.x + 6, SquirrelSpr.y + 4)
    }
    if (Enemy && distance_squared(Enemy, SquirrelSpr) < 140) {
        Enemy.sayText("Thanks.")
        if (Player) {
            Player.sayText("THAT WAS MY HOT DOG!!")
        }
        sfx_eat()
        if (Hot_Dog) {
            Hot_Dog.destroy()
        }
        Hot_Dog = null
        SquirrelSpr.destroy()
        SquirrelSpr = null
        enemy_focus = "normal"
        busy = true
        pause(1000)
        end_game(false)
        return
    }
    if (squirrel_timer <= 0) {
        SquirrelSpr.sayText("HAHA!")
        sfx_event()
        if (Hot_Dog) {
            Hot_Dog.destroy()
        }
        Hot_Dog = null
        SquirrelSpr.destroy()
        SquirrelSpr = null
        enemy_focus = "normal"
        if (Player) {
            Player.sayText("MY LUNCH!")
        }
        busy = true
        pause(900)
        end_game(false)
    }
}

function start_giant_dog() {
    if (!Hot_Dog || hotdog_scale_boost) {
        return
    }
    hotdog_scale_boost = true
    giant_dog_timer = randint(300, 450)
    Hot_Dog.setScale(2.5, ScaleAnchor.Middle)
    if (Player) {
        Player.sayText("THAT'S A BIG HOT DOG!")
    }
    if (Enemy) {
        Enemy.sayText("...")
    }
    Hot_Dog.sayText("I FEEL HUGE!!")
    sfx_event()
}

function update_giant_dog() {
    if (!hotdog_scale_boost || !Hot_Dog) {
        return
    }
    giant_dog_timer -= 1
    if (giant_dog_timer <= 0) {
        hotdog_scale_boost = false
        Hot_Dog.setScale(1, ScaleAnchor.Middle)
        Hot_Dog.sayText("back to snack size")
    }
}

function start_fry_rain() {
    fry_rain_timer = randint(200, 320)
    enemy_fry_mode = true
    enemy_focus = "none"
    if (Player) {
        Player.sayText("IT'S RAINING FRIES!")
        Player.sayText("...Really?")
    }
    if (Enemy) {
        Enemy.sayText("YUMMY")
    }
    sfx_event()
    for (let i = 0; i < 12; i++) {
        let f = sprites.create(imgFry(), SpriteKind.Fry)
        f.setPosition(randint(5, 155), randint(-40, 0))
        f.setVelocity(randint(-10, 10), randint(30, 70))
        f.setFlag(SpriteFlag.AutoDestroy, true)
    }
}

function update_fry_rain() {
    if (fry_rain_timer <= 0) {
        return
    }
    fry_rain_timer -= 1
    if (run_frames % 12 == 0) {
        let f = sprites.create(imgFry(), SpriteKind.Fry)
        f.setPosition(randint(5, 155), -5)
        f.setVelocity(randint(-15, 15), randint(35, 75))
        f.setFlag(SpriteFlag.AutoDestroy, true)
    }
    if (Enemy && enemy_fry_mode) {
        if (run_frames % 20 == 0) {
            Enemy.setVelocity(randint(-60, 60), randint(-60, 60))
        }
        if (run_frames % 40 == 0) {
            Enemy.sayText("YUMMY")
        }
    }
    if (fry_rain_timer <= 0) {
        enemy_fry_mode = false
        enemy_focus = "normal"
        if (Enemy) {
            Enemy.setVelocity(0, 0)
            Enemy.sayText("food detected.")
        }
        sprites.destroyAllSpritesOfKind(SpriteKind.Fry)
    }
}

function spawn_seagull() {
    if (!Hot_Dog || SeagullSpr) {
        return
    }
    SeagullSpr = sprites.create(imgSeagull(), SpriteKind.Seagull)
    SeagullSpr.setPosition(0, randint(20, 80))
    SeagullSpr.setVelocity(70, randint(-20, 20))
    seagull_timer = 240
    sfx_event()
}

function update_seagull() {
    if (!SeagullSpr) {
        return
    }
    seagull_timer -= 1
    wrap_sprite(SeagullSpr)
    if (Hot_Dog && distance_squared(SeagullSpr, Hot_Dog) < 160) {
        SeagullSpr.sayText("MINE!")
        if (Enemy) {
            Enemy.sayText(":(")
        }
        if (Player) {
            Player.sayText("HEY!!")
        }
        Hot_Dog.destroy()
        Hot_Dog = null
        SeagullSpr.setVelocity(100, -40)
        sfx_event()
        pause(600)
        if (SeagullSpr) {
            SeagullSpr.destroy()
        }
        SeagullSpr = null
        busy = true
        pause(500)
        end_game(false)
        return
    }
    if (seagull_timer <= 0) {
        SeagullSpr.destroy()
        SeagullSpr = null
    }
}

function spawn_ketchup_king() {
    if (KingSpr) {
        return
    }
    KingSpr = sprites.create(imgKing(), SpriteKind.KetchupKing)
    KingSpr.setPosition(randint(20, 140), randint(20, 100))
    KingSpr.setVelocity(
        randint(30, 60) * (randint(0, 1) == 0 ? -1 : 1),
        randint(30, 60) * (randint(0, 1) == 0 ? -1 : 1)
    )
    if (Player) {
        Player.sayText("THE KETCHUP KING HAS ARRIVED")
    }
    sfx_event()
    king_timer = randint(360, 540)
}

function update_king() {
    if (!KingSpr) {
        return
    }
    king_timer -= 1
    wrap_sprite(KingSpr)
    if (Bullet_cannon && distance_squared(KingSpr, Bullet_cannon) < 180) {
        if (!cannon_is_messy) {
            Bullet_cannon.sayText("NOT AGAIN!")
            Bullet_cannon.setImage(imgCannonMessy())
            cannon_is_messy = true
            sfx_splat()
            if (Player) {
                Player.sayText("NOT AGAIN!")
            }
        }
    }
    if (king_timer <= 0) {
        KingSpr.sayText("royal bye")
        KingSpr.destroy()
        KingSpr = null
    }
}

function try_cannon_sneeze(): boolean {
    if (!cannon_is_messy || !Bullet_cannon) {
        return false
    }
    if (randint(0, 100) < 28) {
        Bullet_cannon.sayText("ACHOO!")
        sfx_sneeze()
        sfx_splat()
        for (let i = 0; i < 6; i++) {
            let g = sprites.create(img`
                2 2
                2 5
            `, SpriteKind.Fry)
            g.setPosition(Bullet_cannon.x + randint(-6, 6), Bullet_cannon.y + randint(-6, 6))
            g.setVelocity(randint(-60, 60), randint(-60, 60))
            g.setFlag(SpriteFlag.AutoDestroy, true)
        }
        if (Player) {
            player_slip_timer = 120
            Player.sayText("WHOA slippery!!")
            controller.moveSprite(Player, 120, 120)
        }
        return true
    }
    return false
}

function update_slip() {
    if (player_slip_timer <= 0) {
        return
    }
    player_slip_timer -= 1
    if (player_slip_timer <= 0 && Player) {
        controller.moveSprite(Player, 30, 30)
        Player.sayText("ok traction...")
    }
}

function schedule_next_event() {
    event_cooldown = randint(500, 900)
}

function try_trigger_random_event() {
    if (!game_started || busy || start_grace > 0) {
        return
    }
    if (event_cooldown > 0) {
        event_cooldown -= 1
        return
    }
    let roll = randint(0, 100)
    if (roll < 16) {
        spawn_squirrel()
    } else if (roll < 26) {
        start_fry_rain()
    } else if (roll < 36) {
        spawn_seagull()
    } else if (roll < 44) {
        start_giant_dog()
    } else if (roll < 50) {
        spawn_ketchup_king()
    } else if (roll < 58) {
        start_hot_dog_storm()
    } else if (roll < 72 && run_frames > revolt_trigger_at && !revolt_active) {
        start_revolt()
    } else {
        if (Player && randint(0, 1) == 0) {
            say_random(Player, PLAYER_LINES)
        } else if (Enemy) {
            say_random(Enemy, ENEMY_LINES)
        } else if (Hot_Dog) {
            say_random(Hot_Dog, DOG_LINES)
        }
    }
    schedule_next_event()
}

// =========================
// START — random enemy spawn
// =========================
function start_game() {
    sprites.destroyAllSpritesOfKind(SpriteKind.Player)
    sprites.destroyAllSpritesOfKind(SpriteKind.Enemy)
    sprites.destroyAllSpritesOfKind(SpriteKind.Food)
    sprites.destroyAllSpritesOfKind(SpriteKind.Projectile)
    sprites.destroyAllSpritesOfKind(SpriteKind.Cannon)
    clear_event_sprites()

    game.setGameOverEffect(true, effects.confetti)
    game.setGameOverMessage(true, "YOU WIN!!")
    scramble_lose_message()
    game.setGameOverPlayable(true, music.melodyPlayable(music.jumpUp), false)
    game.setGameOverPlayable(false, music.melodyPlayable(music.wawawawaa), false)

    can_shoot = true
    cannon_launch_ready = true
    cannon_cooldown = 0
    chase_tick = 0
    busy = false
    Bullet = null
    target = null
    hotdog_launch_ready = true
    hotdog_cooldown = 0
    hotdog_is_plain = false
    cannon_is_messy = false
    shoot_cooldown = 0
    cannon_died_this_run = false
    start_grace = START_GRACE_FRAMES
    game_started = true
    run_frames = 0

    revolt_active = false
    revolt_timer = 0
    revolt_trigger_at = randint(600, 900)
    angry_dog = false
    angry_timer = 0
    player_slip_timer = 0
    fry_rain_timer = 0
    enemy_fry_mode = false
    enemy_focus = "normal"
    squirrel_timer = 0
    seagull_timer = 0
    king_timer = 0
    giant_dog_timer = 0
    hotdog_scale_boost = false
    storm_active = false
    storm_end_time = 0
    bonus_eaten = 0
    enemy_404_busy = false
    cannon_chat_timer = randint(180, 360)
    chatter_timer = randint(200, 400)
    schedule_next_event()

    start_music()
    updateAchHUD()

    Bullet_cannon = sprites.create(imgCannonClean(), SpriteKind.Cannon)
    Bullet_cannon.setPosition(120, 80)

    Player = sprites.create(assets.image`Me`, SpriteKind.Player)
    Player.setPosition(40, 90)

    Hot_Dog = sprites.create(assets.image`Hot dog`, SpriteKind.Food)
    Hot_Dog.setPosition(40, 30)

    // RANDOM SPAWN (no safe-distance checks)
    Enemy = sprites.create(assets.image`Enemy`, SpriteKind.Enemy)
    Enemy.setPosition(randint(0, 160), randint(0, 120))

    controller.moveSprite(Hot_Dog, 60, 100)
    controller.moveSprite(Player, 30, 30)

    Player.sayText("Go!")
    if (Bullet_cannon) {
        Bullet_cannon.sayText("READY!")
    }
}

// =========================
// INPUT
// =========================
controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
    showAchievements()
})

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    start_game()
})

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (busy || start_grace > 0 || !game_started) {
        return
    }
    if (!can_shoot || !Bullet_cannon) {
        if (Player) {
            Player.sayText("No cannon... can't shoot!")
        }
        music.play(music.tonePlayable(200, music.beat(BeatFraction.Quarter)), music.PlaybackMode.InBackground)
        return
    }
    if (shoot_cooldown > 0) {
        Bullet_cannon.sayText("sticky...")
        return
    }

    if (try_cannon_sneeze()) {
        shoot_cooldown = SHOOT_DELAY_MESSY
        return
    }

    Bullet_cannon.sayText(randint(0, 1) == 0 ? "KEPLEUY!!!!" : "PEW!")
    sfx_shoot()
    Bullet = sprites.create(assets.image`Hot Bullet`, SpriteKind.Projectile)
    Bullet.setPosition(20, 80)
    controller.moveSprite(Bullet, 100, 100)

    if (cannon_is_messy) {
        shoot_cooldown = SHOOT_DELAY_MESSY
        achUnlock(10)
        if (randint(0, 2) == 0) {
            Bullet_cannon.sayText("I'M STICKY!")
        }
    } else {
        shoot_cooldown = SHOOT_DELAY_NORMAL
        if (randint(0, 3) == 0) {
            Bullet_cannon.sayText("FIRE!")
        }
    }
})

// Lose message glitches every 100 ms
game.onUpdateInterval(100, function () {
    scramble_lose_message()
})

// 404 check every 1 second — 0.09% chance
game.onUpdateInterval(1000, function () {
    if (!game_started || busy || enemy_404_busy || start_grace > 0) {
        return
    }
    if (!Enemy) {
        return
    }
    if (randint(1, 10000) <= 9) {
        try_enemy_404_glitch()
    }
})

// =========================
// UPDATE
// =========================
game.onUpdate(function () {
    if (!game_started) {
        return
    }
    run_frames += 1

    if (start_grace > 0) {
        start_grace -= 1
    }

    if (Player) wrap_sprite(Player)
    if (Hot_Dog) wrap_sprite(Hot_Dog)
    if (Enemy) wrap_sprite(Enemy)
    if (Bullet) wrap_sprite(Bullet)
    if (SquirrelSpr) wrap_sprite(SquirrelSpr)

    if (cannon_cooldown > 0) {
        cannon_cooldown -= 1
        if (cannon_cooldown <= 0) {
            cannon_launch_ready = true
        }
    }
    if (hotdog_cooldown > 0) {
        hotdog_cooldown -= 1
        if (hotdog_cooldown <= 0) {
            hotdog_launch_ready = true
        }
    }
    if (shoot_cooldown > 0) {
        shoot_cooldown -= 1
    }

    update_slip()
    update_revolt()
    update_angry_dog()
    update_squirrel()
    update_giant_dog()
    update_fry_rain()
    update_seagull()
    update_king()
    update_hot_dog_storm()
    try_trigger_random_event()

    if (Bullet_cannon && !busy) {
        cannon_chat_timer -= 1
        if (cannon_chat_timer <= 0) {
            if (cannon_is_messy) {
                say_random(Bullet_cannon, CANNON_LINES_MESSY)
            } else {
                say_random(Bullet_cannon, CANNON_LINES_CLEAN)
            }
            cannon_chat_timer = randint(240, 480)
        }
    }

    chatter_timer -= 1
    if (chatter_timer <= 0 && !busy && start_grace <= 0) {
        let who = randint(0, 2)
        if (who == 0 && Player) {
            say_random(Player, PLAYER_LINES)
        } else if (who == 1 && Enemy) {
            say_random(Enemy, ENEMY_LINES)
        } else if (who == 2 && Hot_Dog) {
            say_random(Hot_Dog, DOG_LINES)
        }
        chatter_timer = randint(280, 520)
    }

    if (!revolt_active && !angry_dog && Hot_Dog && run_frames == revolt_trigger_at) {
        if (randint(0, 100) < 70) {
            start_revolt()
        }
    }

    if (busy || start_grace > 0 || !Enemy) {
        return
    }

    chase_tick += 1
    if (chase_tick < 8) {
        return
    }
    chase_tick = 0

    if (enemy_focus == "none" || enemy_fry_mode) {
        return
    }

    target = null
    if (enemy_focus == "squirrel" && SquirrelSpr) {
        target = SquirrelSpr
    } else if (Player && Hot_Dog) {
        if (distance_squared(Enemy, Player) <= distance_squared(Enemy, Hot_Dog)) {
            target = Player
        } else {
            target = Hot_Dog
        }
    } else if (Player) {
        target = Player
    } else if (Hot_Dog) {
        target = Hot_Dog
    }

    if (!target) {
        return
    }

    if (Enemy.x < target.x) Enemy.x += 1
    else if (Enemy.x > target.x) Enemy.x -= 1
    if (Enemy.y < target.y) Enemy.y += 1
    else if (Enemy.y > target.y) Enemy.y -= 1
})

// =========================
// OVERLAPS
// =========================
sprites.onOverlap(SpriteKind.Player, SpriteKind.Cannon, function (sprite, otherSprite) {
    if (!overlaps_active() || !cannon_launch_ready || !Player || !Bullet_cannon) {
        return
    }
    cannon_launch_ready = false
    cannon_cooldown = 30
    sfx_yeet()
    Player.setVelocity(0, 0)
    Player.setPosition(20, 80)
    Player.sayText("WHOA!!!")
    Bullet_cannon.sayText("YEET!")
    achUnlock(2)
})

sprites.onOverlap(SpriteKind.Food, SpriteKind.Cannon, function (sprite, otherSprite) {
    if (!overlaps_active() || !hotdog_launch_ready || !Hot_Dog || !Bullet_cannon) {
        return
    }
    if (SquirrelSpr) {
        return
    }
    hotdog_launch_ready = false
    hotdog_cooldown = 40
    Hot_Dog.setVelocity(0, 0)
    Hot_Dog.setPosition(20, 80)
    sfx_yeet()
    if (!hotdog_is_plain) {
        sfx_splat()
        Hot_Dog.setImage(imgHotDogPlain())
        hotdog_is_plain = true
        Hot_Dog.sayText("My toppings!!!!")
        Bullet_cannon.setImage(imgCannonMessy())
        cannon_is_messy = true
        Bullet_cannon.sayText("EWW KETCHUP")
        if (Player) {
            Player.sayText("Slow sticky cannon...")
        }
        achUnlock(3)
        maybe_angry_hotdog()
    } else {
        Hot_Dog.sayText("plain YEET")
        if (randint(0, 1) == 0) {
            Hot_Dog.sayText("I MISS MY KETCHUP!")
        }
    }
})

sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Food, function (sprite, otherSprite) {
    if (!overlaps_active() || !Player) {
        return
    }
    busy = true
    sfx_hit()
    achUnlock(8)
    sprite.destroy()
    otherSprite.destroy()
    if (sprite == Bullet) {
        Bullet = null
    }
    Hot_Dog = null
    Player.sayText(":( WHY DID YOU SHOOT THE FOOD?! IM HUNGRY!!!!")
    Player.sayText("I am DYING of hunger!!!")
    pause(1500)
    end_game(false)
})

sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Player, function (sprite, otherSprite) {
    if (!overlaps_active()) {
        return
    }
    busy = true
    sfx_hit()
    achUnlock(7)
    sprite.destroy()
    if (sprite == Bullet) {
        Bullet = null
    }
    otherSprite.sayText("OWWIE!!!")
    pause(800)
    otherSprite.sayText("I'm Dying!!!")
    pause(600)
    end_game(false)
})

sprites.onOverlap(SpriteKind.Enemy, SpriteKind.Projectile, function (sprite, otherSprite) {
    if (!overlaps_active() || !Player) {
        return
    }
    busy = true
    sfx_hit()
    otherSprite.destroy()
    if (otherSprite == Bullet) {
        Bullet = null
    }
    sprite.sayText("OWWIE!!!")
    Player.sayText(":)")
    if (Hot_Dog) {
        Hot_Dog.sayText(":)")
    }
    achUnlock(1)
    if (cannon_died_this_run) {
        achUnlock(5)
    }
    pause(1200)
    end_game(true)
})

sprites.onOverlap(SpriteKind.Food, SpriteKind.Enemy, function (sprite, otherSprite) {
    if (!overlaps_active() || !Player) {
        return
    }
    if (SquirrelSpr) {
        return
    }
    busy = true
    sfx_eat()
    achUnlock(9)
    sprite.destroy()
    Hot_Dog = null
    Player.sayText("HEY!!! My Hot dog!!")
    otherSprite.sayText(":)")
    otherSprite.sayText(hotdog_is_plain ? "plain... still yummy" : "Yummy Yummy Yummy")
    if (randint(0, 1) == 0) {
        otherSprite.sayText("NOM NOM NOM.")
    }
    pause(randint(1500, 4000))
    otherSprite.sayText("I LOVED that hot dog!!!")
    Player.sayText("I am DYING of Hunger!!!")
    pause(1500)
    end_game(false)
})

sprites.onOverlap(SpriteKind.Enemy, SpriteKind.Player, function (sprite, otherSprite) {
    if (!overlaps_active()) {
        return
    }
    busy = true
    sfx_hit()
    sprite.sayText("I MUST KILL YOU!")
    otherSprite.sayText("DON'T!!!!!")
    pause(1000)
    end_game(false)
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite, otherSprite) {
    if (!overlaps_active()) {
        return
    }
    if (SquirrelSpr) {
        return
    }

    if (!storm_active && randint(0, 99) < 30) {
        start_hot_dog_storm()
        return
    }

    busy = true
    sfx_eat()
    otherSprite.destroy()
    Hot_Dog = null
    if (hotdog_is_plain) {
        sprite.sayText("Yummy... dry hot dog")
        achUnlock(4)
    } else {
        sprite.sayText("Yummy Yummy Yummy Hot dog")
    }
    achUnlock(0)
    if (cannon_died_this_run) {
        achUnlock(5)
    }
    pause(950)
    end_game(true)
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.BonusDog, function (sprite, otherSprite) {
    if (!overlaps_active()) {
        return
    }
    otherSprite.destroy()
    bonus_eaten += 1
    sfx_eat()
    if (bonus_eaten == 1) {
        sprite.sayText("extra dog!!")
    } else if (bonus_eaten == 5) {
        sprite.sayText("5 dogs!!")
    } else if (bonus_eaten == 10) {
        sprite.sayText("10 DOGS!!!")
    } else if (bonus_eaten == 20) {
        sprite.sayText("I AM BECOME LUNCH")
    } else if (randint(0, 2) == 0) {
        sprite.sayText("nom")
    }
})

sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Cannon, function (sprite, otherSprite) {
    if (!overlaps_active()) {
        return
    }
    sprite.setPosition(20, 80)
    controller.moveSprite(sprite, 100, 100)
    if (sprite == Bullet || !Bullet) {
        Bullet = sprite
    }
    destroy_cannon("HIT!")
})

sprites.onOverlap(SpriteKind.Enemy, SpriteKind.Cannon, function (sprite, otherSprite) {
    if (!overlaps_active()) {
        return
    }
    destroy_cannon("SMASH!")
})

// =========================
// BOOT
// =========================
achLoad()
updateAchHUD()
game.setDialogTextColor(1)
scramble_lose_message()
game.splash("v7.3 - Randomness update ", "A=Start  B=Shoot  Menu=Achievements")