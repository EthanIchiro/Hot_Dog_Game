@namespace
class SpriteKind:
    Cannon = SpriteKind.create()
Player: Sprite = None
Bullet: Sprite = None
Bullet_cannon: Sprite = None
Enemy: Sprite = None
Hot_Dog: Sprite = None

def on_on_overlap(sprite, otherSprite):
    Player.say_text(":( WHY DID YOU SHOOT THE FOOD???\" IM HUNGRY!!!!")
    Bullet.say_text("Sorry!!!")
    Player.say_text("I am DYING of hunger!!!")
    pause(3215)
    game.game_over(False)
sprites.on_overlap(SpriteKind.projectile, SpriteKind.food, on_on_overlap)

def on_b_pressed():
    global Bullet
    Bullet = sprites.create(assets.image("""
            Hot Bullet
            """),
        SpriteKind.projectile)
    Bullet.set_position(120, 73)
    controller.move_sprite(Bullet, 100, 100)
controller.B.on_event(ControllerButtonEvent.PRESSED, on_b_pressed)

def on_a_pressed():
    global Bullet_cannon, Enemy, Hot_Dog, Player
    game.set_game_over_effect(True, effects.confetti)
    game.set_game_over_playable(True, music.melody_playable(music.jump_up), False)
    game.set_game_over_playable(False, music.melody_playable(music.wawawawaa), False)
    game.set_game_over_message(True, "YOU WIN!!")
    game.set_game_over_message(False, "GAME OVER!")
    Bullet_cannon = sprites.create(img("""
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
            """),
        SpriteKind.Cannon)
    Enemy = sprites.create(assets.image("""
        Enemy
        """), SpriteKind.enemy)
    Hot_Dog = sprites.create(assets.image("""
        Hot dog
        """), SpriteKind.food)
    Player = sprites.create(assets.image("""
        Me
        """), SpriteKind.player)
    controller.move_sprite(Hot_Dog, 60, 100)
    controller.move_sprite(Player, 30, 30)
    Bullet_cannon.set_position(120, 80)
    Enemy.set_position(randint(0, 160), randint(0, 120))
    Hot_Dog.set_position(60, 40)
    Player.set_position(90, 90)
controller.A.on_event(ControllerButtonEvent.PRESSED, on_a_pressed)

def on_on_overlap2(sprite5, otherSprite5):
    Enemy.say_text("I MUST KILL YOU!")
    Player.say_text("DON'T!!!!!")
    pause(1000)
    game.game_over(False)
sprites.on_overlap(SpriteKind.enemy, SpriteKind.player, on_on_overlap2)

def on_on_overlap3(sprite2, otherSprite2):
    Bullet.say_text("Sorry for Peircing you!!!")
    Player.say_text("OWWIE!!!")
    pause(1000)
    Player.say_text("I'm Dying!!!")
    pause(625)
    game.game_over(False)
sprites.on_overlap(SpriteKind.projectile, SpriteKind.player, on_on_overlap3)

def on_on_overlap4(sprite4, otherSprite4):
    Player.say_text("HEY!!! My Hot dog!!")
    Enemy.say_text(":)")
    Enemy.say_text("Yummy Yummy Yummy")
    pause(randint(0, 60000))
    Enemy.say_text("I LOVED that hot dog!!!")
    Player.say_text("I am DYING of Hunger!!!")
    pause(3625)
    game.game_over(False)
sprites.on_overlap(SpriteKind.food, SpriteKind.enemy, on_on_overlap4)

def on_on_overlap5(sprite6, otherSprite6):
    Player.say_text("Yummy Yummy Yummy Hot dog")
    pause(950)
    game.game_over(True)
sprites.on_overlap(SpriteKind.player, SpriteKind.food, on_on_overlap5)

def on_on_overlap6(sprite3, otherSprite3):
    Enemy.say_text("OWWIE!!!")
    Player.say_text(":)")
    Hot_Dog.say_text(":)")
    pause(2000)
    game.game_over(True)
sprites.on_overlap(SpriteKind.enemy, SpriteKind.projectile, on_on_overlap6)
