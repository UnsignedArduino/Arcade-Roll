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
function make_game_buttons () {
    side_buttons = []
    selected_side_button = 0
    side_buttons.push(make_button(assets.image`roll_button`, assets.image`roll_button_selected`, "", "Roll"))
    side_buttons.push(make_button(assets.image`roll_x_times_button`, assets.image`roll_x_times_button_selected`, "", "Roll N times"))
    for (let index = 0; index <= side_buttons.length - 1; index++) {
        side_buttons[index].left = 2
        side_buttons[index].y = 50 + index * 20
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
    } else {
        return assets.image`die_side_6`
    }
}
controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    if (selected_side_button < side_buttons.length - 1) {
        selected_side_button += 1
        update_side_buttons()
    }
})
function place_die () {
    die_per_row = Math.ceil(Math.sqrt(die.length))
    row_counter = 0
    original_x = scene.screenWidth() / 2 - die_per_row * 20 / 4
    curr_x = original_x
    curr_y = scene.screenHeight() / 2 - Math.ceil(die.length / die_per_row) * 20 / 4
    for (let dice of die) {
        dice.setPosition(curr_x, curr_y)
        curr_x += 20
        row_counter += 1
        if (row_counter == die_per_row) {
            row_counter = 0
            curr_x = original_x
            curr_y += 20
        }
    }
}
let curr_y = 0
let curr_x = 0
let original_x = 0
let row_counter = 0
let die_per_row = 0
let button: Sprite = null
let die: Sprite[] = []
let dice_data: blockObject.BlockObject = null
let dice: Sprite = null
let selected_side_button = 0
let button_data: blockObject.BlockObject = null
let side_buttons: Sprite[] = []
let selected_side_label: TextSprite = null
prepare_hud()
make_die()
