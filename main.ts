namespace SpriteKind {
    export const Button = SpriteKind.create()
    export const Dice = SpriteKind.create()
}
namespace NumProp {
    export const selected = NumProp.create()
}
namespace NumArrayProp {
    export const values = NumArrayProp.create()
}
namespace StrProp {
    export const label = StrProp.create()
    export const hover = StrProp.create()
}
namespace ImageProp {
    export const image = ImageProp.create()
    export const selected = ImageProp.create()
}
function update_side_buttons () {
    if (!(spriteutils.isDestroyed(selected_side_label))) {
        selected_side_label.destroy()
    }
    for (let index = 0; index <= side_buttons.length - 1; index++) {
        button_data = blockObject.getStoredObject(side_buttons[index])
        if (selected_side_button == index) {
            side_buttons[index].setImage(blockObject.getImageProperty(button_data, ImageProp.selected))
            side_buttons[index].left = 4
            selected_side_label = textsprite.create(blockObject.getStringProperty(button_data, StrProp.hover), 0, 3)
            selected_side_label.y = side_buttons[index].y
            selected_side_label.left = side_buttons[index].right + 2
            selected_side_label.z = 20
        } else {
            side_buttons[index].setImage(blockObject.getImageProperty(button_data, ImageProp.image))
            side_buttons[index].left = 2
        }
    }
}
controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    if (selected_side_button > 0) {
        selected_side_button += -1
        update_side_buttons()
    }
})
function roll_die () {
    for (let dice of die) {
        dice_data = blockObject.getStoredObject(dice)
        blockObject.setNumberProperty(dice_data, NumProp.selected, randint(0, blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values).length - 1))
        info.changeScoreBy(blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[blockObject.getNumberProperty(dice_data, NumProp.selected)])
        dice.setImage(generate_die_side(blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[blockObject.getNumberProperty(dice_data, NumProp.selected)]))
        blockObject.storeOnSprite(dice_data, dice)
    }
    info.changeLifeBy(-1)
}
function cancel_rolling () {
    cancel_multiple_roll = true
    make_game_buttons()
}
function print_small_num_to_img (image2: Image, number: number, x: number, y: number) {
    if (!(temp_sprite)) {
        temp_sprite = textsprite.create("", 0, 15)
        temp_sprite.setFlag(SpriteFlag.Invisible, true)
        temp_sprite.setMaxFontHeight(5)
    }
    temp_sprite.setText("" + number)
    spriteutils.drawTransparentImage(temp_sprite.image, image2, x, y)
    return image2
}
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (rolling_multiple) {
        cancel_rolling()
    } else if (in_shop) {
        if (selected_side_button == 0) {
            hide_shop()
        }
    } else {
        if (selected_side_button == 0) {
            roll_die()
        } else if (selected_side_button == 1) {
            timer.background(function () {
                ask_roll_dice_multiple_times()
            })
        } else if (selected_side_button == 2) {
            timer.background(function () {
                ask_roll_dice_until()
            })
        } else if (selected_side_button == 3) {
            show_shop()
        }
    }
})
function show_shop () {
    in_shop = true
    make_shop_buttons()
    show_dice(false)
}
function make_dice () {
    dice = sprites.create(generate_die_side(1), SpriteKind.Dice)
    dice_data = blockObject.create()
    blockObject.setNumberArrayProperty(dice_data, NumArrayProp.values, [
    1,
    2,
    3,
    4,
    5,
    6
    ])
    blockObject.setNumberProperty(dice_data, NumProp.selected, 0)
    blockObject.storeOnSprite(dice_data, dice)
    return dice
}
function make_cancel_rolls_buttons () {
    destroy_side_buttons()
    side_buttons = [make_button(assets.image`cancel_rolls_button`, assets.image`cancel_rolls_selected_button`, "", "Stop")]
    selected_side_button = 0
    for (let index = 0; index <= side_buttons.length - 1; index++) {
        side_buttons[index].left = 2
        side_buttons[index].y = scene.screenHeight() / 2 - (side_buttons.length - 1) * 10 + index * 20
    }
    update_side_buttons()
}
function make_game_buttons () {
    destroy_side_buttons()
    side_buttons = [
    make_button(assets.image`roll_button`, assets.image`roll_button_selected`, "", "Roll"),
    make_button(assets.image`roll_x_times_button`, assets.image`roll_x_times_button_selected`, "", "Roll N times"),
    make_button(assets.image`roll_until_button`, assets.image`roll_until_button_selected`, "", "Roll until N points"),
    make_button(assets.image`shop_button`, assets.image`shop_button_selected`, "", "Shop")
    ]
    selected_side_button = 0
    for (let index = 0; index <= side_buttons.length - 1; index++) {
        side_buttons[index].left = 2
        side_buttons[index].y = scene.screenHeight() / 2 - (side_buttons.length - 1) * 10 + index * 20
    }
    update_side_buttons()
}
function prepare_hud () {
    info.setLife(3000)
    spriteutils.setLifeImage(assets.image`life_image`)
    info.setScore(0)
    scene.setBackgroundColor(13)
    make_game_buttons()
}
function role_dice_multiple_times (times: number) {
    rolling_multiple = true
    cancel_multiple_roll = false
    for (let index = 0; index < times; index++) {
        roll_die()
        pause(20)
        if (cancel_multiple_roll) {
            break;
        }
    }
    rolling_multiple = false
}
function make_die () {
    die = []
    for (let index = 0; index < 2; index++) {
        die.push(make_dice())
    }
    place_die()
}
function make_button (image2: Image, selected_image: Image, label: string, hover: string) {
    button = sprites.create(image2, SpriteKind.Button)
    button.z = 20
    button_data = blockObject.create()
    blockObject.setImageProperty(button_data, ImageProp.image, image2)
    blockObject.setImageProperty(button_data, ImageProp.selected, selected_image)
    blockObject.setStringProperty(button_data, StrProp.label, label)
    blockObject.setStringProperty(button_data, StrProp.hover, hover)
    blockObject.storeOnSprite(button_data, button)
    return button
}
function destroy_side_buttons () {
    for (let button of side_buttons) {
        button.destroy()
    }
}
function generate_die_side (number: number) {
    if (number == 1) {
        return assets.image`die_side_1`
    } else if (number == 2) {
        return assets.image`die_side_2`
    } else if (number == 3) {
        return assets.image`die_side_3`
    } else if (number == 4) {
        return assets.image`die_side_4`
    } else if (number == 5) {
        return assets.image`die_side_5`
    } else if (number == 6) {
        return assets.image`die_side_6`
    } else {
        return print_small_num_to_img(assets.image`unlabeled_die_side`.clone(), number, 3, 5)
    }
}
function show_dice (show: boolean) {
    for (let dice of die) {
        dice.setFlag(SpriteFlag.Invisible, !(show))
    }
}
function ask_roll_dice_until () {
    to_roll = game.askForNumber("How much do you want to roll to?", 10)
    if (to_roll > info.score()) {
        make_cancel_rolls_buttons()
        role_dice_multiple_until(to_roll)
        make_game_buttons()
    } else {
        game.showLongText("You already have that many points!", DialogLayout.Bottom)
    }
}
controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    if (selected_side_button < side_buttons.length - 1) {
        selected_side_button += 1
        update_side_buttons()
    }
})
function ask_roll_dice_multiple_times () {
    to_roll = game.askForNumber("How many times do you want to roll?", 4)
    if (to_roll <= info.life()) {
        make_cancel_rolls_buttons()
        role_dice_multiple_times(to_roll)
        make_game_buttons()
    } else {
        game.showLongText("You can't roll over how many rolls you have left!", DialogLayout.Bottom)
    }
}
function role_dice_multiple_until (target: number) {
    rolling_multiple = true
    cancel_multiple_roll = false
    while (info.score() < target && !(cancel_multiple_roll)) {
        roll_die()
        pause(20)
    }
    rolling_multiple = false
}
info.onLifeZero(function () {
    game.over(true)
})
controller.A.onEvent(ControllerButtonEvent.Repeated, function () {
    if (!(rolling_multiple) && !(in_shop)) {
        if (selected_side_button == 0) {
            roll_die()
        }
    }
})
function hide_shop () {
    in_shop = false
    make_game_buttons()
    show_dice(true)
}
function place_die () {
    die_per_row = Math.ceil(Math.sqrt(die.length))
    die_per_col = Math.ceil(die.length / die_per_row)
    row_counter = 0
    orign_left = scene.screenWidth() / 2 - die_per_row * 18 / 2
    curr_left = orign_left
    curr_top = scene.screenHeight() / 2 - die_per_col * 18 / 2
    for (let dice of die) {
        dice.left = curr_left
        dice.top = curr_top
        curr_left += 18
        row_counter += 1
        if (row_counter == die_per_row) {
            row_counter = 0
            curr_left = orign_left
            curr_top += 18
        }
    }
}
function make_shop_buttons () {
    destroy_side_buttons()
    side_buttons = [make_button(assets.image`exit_shop_button`, assets.image`exit_shop_button_selected`, "", "Exit shop")]
    selected_side_button = 0
    side_buttons.push(make_button(assets.image`upgrade_shop_button`, assets.image`upgrade_shop_selected_button`, "", "Upgrade shop"))
    side_buttons.push(make_button(assets.image`reroll_shop_button`, assets.image`reroll_shop_button_selected`, "", "Re-roll shop"))
    for (let index = 0; index <= side_buttons.length - 1; index++) {
        side_buttons[index].left = 2
        side_buttons[index].y = scene.screenHeight() / 2 - (side_buttons.length - 1) * 10 + index * 20
    }
    update_side_buttons()
}
let curr_top = 0
let curr_left = 0
let orign_left = 0
let row_counter = 0
let die_per_col = 0
let die_per_row = 0
let to_roll = 0
let button: Sprite = null
let dice: Sprite = null
let temp_sprite: TextSprite = null
let dice_data: blockObject.BlockObject = null
let die: Sprite[] = []
let selected_side_button = 0
let button_data: blockObject.BlockObject = null
let side_buttons: Sprite[] = []
let selected_side_label: TextSprite = null
let in_shop = false
let cancel_multiple_roll = false
let rolling_multiple = false
rolling_multiple = false
cancel_multiple_roll = false
in_shop = false
stats.turnStats(true)
controller.configureRepeatEventDefaults(1000, 50)
prepare_hud()
make_die()
