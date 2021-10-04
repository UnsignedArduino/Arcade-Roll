namespace SpriteKind {
    export const Button = SpriteKind.create()
}
namespace StrProp {
    export const label = StrProp.create()
    export const hover = StrProp.create()
}
namespace ImageProp {
    export const image = ImageProp.create()
    export const selected = ImageProp.create()
}
function update_selected_side_buttons () {
    for (let index = 0; index <= side_buttons.length - 1; index++) {
        button_data = blockObject.getStoredObject(side_buttons[index])
        if (selected_side_button == index) {
            side_buttons[index].setImage(blockObject.getImageProperty(button_data, ImageProp.selected))
            side_buttons[index].left = 8
            side_buttons[index].sayText(blockObject.getStringProperty(button_data, StrProp.hover))
        } else {
            side_buttons[index].setImage(blockObject.getImageProperty(button_data, ImageProp.image))
            side_buttons[index].left = 2
            side_buttons[index].sayText("")
        }
    }
}
function prepare_game () {
    info.setLife(2500)
    spriteutils.setLifeImage(assets.image`life_image`)
    info.setScore(0)
    scene.setBackgroundColor(13)
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
    update_selected_side_buttons()
}
function make_button (image2: Image, selected_image: Image, label: string, hover: string) {
    button = sprites.create(image2, SpriteKind.Button)
    button_data = blockObject.create()
    blockObject.setImageProperty(button_data, ImageProp.image, image2)
    blockObject.setImageProperty(button_data, ImageProp.selected, selected_image)
    blockObject.setStringProperty(button_data, StrProp.label, label)
    blockObject.setStringProperty(button_data, StrProp.hover, hover)
    blockObject.storeOnSprite(button_data, button)
    return button
}
let button: Sprite = null
let selected_side_button = 0
let button_data: blockObject.BlockObject = null
let side_buttons: Sprite[] = []
prepare_game()
make_game_buttons()
