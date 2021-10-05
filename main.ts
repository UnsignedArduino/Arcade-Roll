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
function prepare_game () {
    info.setLife(2500)
    spriteutils.setLifeImage(assets.image`life_image`)
    info.setScore(0)
    scene.setBackgroundColor(13)
}
controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    if (selected_bottom_button > 0) {
        selected_bottom_button += -1
        update_selected_bottom_buttons()
    }
})
function make_game_buttons () {
    bottom_buttons = []
    selected_bottom_button = 0
    bottom_buttons.push(make_button(assets.image`roll_button`, assets.image`roll_button_selected`, "", "Roll"))
    bottom_buttons.push(make_button(assets.image`roll_x_times_button`, assets.image`roll_x_times_button_selected`, "", "Roll N times"))
    for (let index = 0; index <= bottom_buttons.length - 1; index++) {
        bottom_buttons[index].bottom = scene.screenHeight() - 4
        bottom_buttons[index].x = 70 + index * 20
    }
    update_selected_bottom_buttons()
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
function update_selected_bottom_buttons () {
    for (let index = 0; index <= bottom_buttons.length - 1; index++) {
        button_data = blockObject.getStoredObject(bottom_buttons[index])
        if (selected_bottom_button == index) {
            bottom_buttons[index].setImage(blockObject.getImageProperty(button_data, ImageProp.selected))
            bottom_buttons[index].bottom = scene.screenHeight() - 8
            bottom_buttons[index].sayText(blockObject.getStringProperty(button_data, StrProp.hover))
        } else {
            bottom_buttons[index].setImage(blockObject.getImageProperty(button_data, ImageProp.image))
            bottom_buttons[index].bottom = scene.screenHeight() - 4
            bottom_buttons[index].sayText("")
        }
    }
}
controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    if (selected_bottom_button < bottom_buttons.length - 1) {
        selected_bottom_button += 1
        update_selected_bottom_buttons()
    }
})
let button_data: blockObject.BlockObject = null
let button: Sprite = null
let bottom_buttons: Sprite[] = []
let selected_bottom_button = 0
prepare_game()
make_game_buttons()
