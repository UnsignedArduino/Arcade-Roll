namespace SpriteKind {
    export const Button = SpriteKind.create()
    export const Dice = SpriteKind.create()
    export const DiceFace = SpriteKind.create()
}
namespace NumProp {
    export const selected = NumProp.create()
    export const upgrade_type = NumProp.create()
    export const upgrade_variant = NumProp.create()
    export const upgrade_cost = NumProp.create()
    export const die_index = NumProp.create()
    export const side_index = NumProp.create()
}
namespace NumArrayProp {
    export const values = NumArrayProp.create()
}
namespace BoolProp {
    export const upgrade_bought = BoolProp.create()
    export const need_dice_picked = BoolProp.create()
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
        if (selected_side_button == index && !(on_grid_buttons)) {
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
    if (!(picking_die)) {
        if (in_shop && on_grid_buttons) {
            if (selected_grid_button >= 4) {
                selected_grid_button = Math.max(selected_grid_button - 4, 0)
            }
        } else {
            if (selected_side_button > 0) {
                selected_side_button += -1
            }
        }
        update_side_buttons()
        if (in_shop) {
            update_grid_buttons()
        }
    }
})
function roll_die () {
    raw_score = 0
    raw_multiplier = 100
    for (let dice of die) {
        dice_data = blockObject.getStoredObject(dice)
        blockObject.setNumberProperty(dice_data, NumProp.selected, randint(0, blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values).length - 1))
        if (blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[blockObject.getNumberProperty(dice_data, NumProp.selected)] == -777) {
            bonus_777_count += 1
        } else if (blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[blockObject.getNumberProperty(dice_data, NumProp.selected)] < 0) {
            raw_multiplier += Math.abs(blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[blockObject.getNumberProperty(dice_data, NumProp.selected)])
        } else {
            raw_score += blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[blockObject.getNumberProperty(dice_data, NumProp.selected)]
        }
        dice.setImage(generate_die_side(blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[blockObject.getNumberProperty(dice_data, NumProp.selected)]))
        blockObject.storeOnSprite(dice_data, dice)
    }
    if (bonus_777_count >= 77) {
        bonus_777_count += -77
        raw_multiplier += 777
    }
    last_score = Math.round(raw_score * ((raw_multiplier + global_multiplier) / 100))
    info.changeScoreBy(last_score)
    info.changeLifeBy(-1)
    recent_scores.push(last_score)
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
    if (!(picking_die)) {
        if (rolling_multiple) {
            cancel_rolling()
        } else if (in_shop) {
            if (on_grid_buttons) {
                if (info.score() >= blockObject.getNumberProperty(shop_upgrades[selected_grid_button], NumProp.upgrade_cost) && !(blockObject.getBooleanProperty(shop_upgrades[selected_grid_button], BoolProp.upgrade_bought))) {
                    timer.background(function () {
                        previous_selected = selected_grid_button
                        if (does_upgrade_type_need_die(blockObject.getNumberProperty(shop_upgrades[selected_grid_button], NumProp.upgrade_type))) {
                            while (true) {
                                ret = apply_upgrade(pick_a_die(), [shop_upgrades[selected_grid_button]])
                                if (ret == 0) {
                                    info.changeScoreBy(-1 * blockObject.getNumberProperty(shop_upgrades[previous_selected], NumProp.upgrade_cost))
                                    blockObject.setBooleanProperty(shop_upgrades[previous_selected], BoolProp.upgrade_bought, true)
                                    for (let index2 = 0; index2 < 3; index2++) {
                                        grid_buttons[previous_selected].startEffect(effects.confetti, 1000)
                                    }
                                } else if (ret == 2) {
                                    scene.cameraShake(4, 200)
                                    continue;
                                }
                                break;
                            }
                        } else {
                            apply_upgrade([], [shop_upgrades[selected_grid_button]])
                            info.changeScoreBy(-1 * blockObject.getNumberProperty(shop_upgrades[selected_grid_button], NumProp.upgrade_cost))
                            blockObject.setBooleanProperty(shop_upgrades[selected_grid_button], BoolProp.upgrade_bought, true)
                            for (let index2 = 0; index2 < 3; index2++) {
                                grid_buttons[selected_grid_button].startEffect(effects.confetti, 1000)
                            }
                        }
                        destroy_grid_buttons()
                        make_shop_buttons()
                        selected_grid_button = previous_selected
                        update_grid_buttons()
                    })
                } else {
                    scene.cameraShake(4, 200)
                }
            } else {
                if (selected_side_button == 0) {
                    hide_shop()
                } else if (selected_side_button == 1) {
                    generate_shop_upgrades()
                    make_shop_buttons()
                    update_grid_buttons()
                    selected_side_button = 1
                    update_side_buttons()
                }
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
    }
})
function show_shop () {
    in_shop = true
    make_shop_buttons()
    show_dice(false)
}
controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    if (!(picking_die)) {
        if (in_shop) {
            if (on_grid_buttons) {
                if (selected_grid_button % 4 == 0) {
                    on_grid_buttons = false
                } else {
                    selected_grid_button = Math.max(selected_grid_button - 1, 0)
                }
            }
            update_side_buttons()
            update_grid_buttons()
        }
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
function does_upgrade_type_need_die (t: number) {
    return [
    1,
    2,
    3,
    5
    ].indexOf(t) != -1
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
    for (let index2 = 0; index2 < times; index2++) {
        roll_die()
        pause(20)
        if (cancel_multiple_roll) {
            break;
        }
    }
    rolling_multiple = false
}
function place_grid_buttons () {
    die_per_row = Math.ceil(Math.sqrt(grid_buttons.length))
    die_per_col = Math.ceil(grid_buttons.length / die_per_row)
    row_counter = 0
    orign_left = scene.screenWidth() / 2 - die_per_row * 18 / 2
    curr_left = orign_left
    curr_top = scene.screenHeight() / 2 - die_per_col * 18 / 2
    for (let dice of grid_buttons) {
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
function create_all_face_die () {
    most_top = die[0].top
    most_left = die[0].left
    most_bottom = 0
    most_right = 0
    index = 0
    for (let dice of die) {
        dice_data = blockObject.getStoredObject(dice)
        if (true) {
            dice_face = sprites.create(generate_die_side(blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[0]), SpriteKind.DiceFace)
            dice_face.top = (dice.top - most_top) / 18 * (4.5 * 18) + 0 * 18
            dice_face.left = (dice.left - most_left) / 18 * (3.5 * 18) + 1 * 18
            if (true) {
                blockObject.storeOnSprite(blockObject.create(), dice_face)
                blockObject.setNumberProperty(blockObject.getStoredObject(dice_face), NumProp.die_index, index)
                blockObject.setNumberProperty(blockObject.getStoredObject(dice_face), NumProp.side_index, 0)
            }
        }
        if (true) {
            dice_face = sprites.create(generate_die_side(blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[3]), SpriteKind.DiceFace)
            dice_face.top = (dice.top - most_top) / 18 * (4.5 * 18) + 1 * 18
            dice_face.left = (dice.left - most_left) / 18 * (3.5 * 18) + 0 * 18
            if (true) {
                blockObject.storeOnSprite(blockObject.create(), dice_face)
                blockObject.setNumberProperty(blockObject.getStoredObject(dice_face), NumProp.die_index, index)
                blockObject.setNumberProperty(blockObject.getStoredObject(dice_face), NumProp.side_index, 3)
            }
        }
        if (true) {
            dice_face = sprites.create(generate_die_side(blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[1]), SpriteKind.DiceFace)
            dice_face.top = (dice.top - most_top) / 18 * (4.5 * 18) + 1 * 18
            dice_face.left = (dice.left - most_left) / 18 * (3.5 * 18) + 1 * 18
            if (true) {
                blockObject.storeOnSprite(blockObject.create(), dice_face)
                blockObject.setNumberProperty(blockObject.getStoredObject(dice_face), NumProp.die_index, index)
                blockObject.setNumberProperty(blockObject.getStoredObject(dice_face), NumProp.side_index, 1)
            }
        }
        if (true) {
            dice_face = sprites.create(generate_die_side(blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[2]), SpriteKind.DiceFace)
            dice_face.top = (dice.top - most_top) / 18 * (4.5 * 18) + 1 * 18
            dice_face.left = (dice.left - most_left) / 18 * (3.5 * 18) + 2 * 18
            most_right = Math.max(most_right, dice_face.right)
            if (true) {
                blockObject.storeOnSprite(blockObject.create(), dice_face)
                blockObject.setNumberProperty(blockObject.getStoredObject(dice_face), NumProp.die_index, index)
                blockObject.setNumberProperty(blockObject.getStoredObject(dice_face), NumProp.side_index, 2)
            }
        }
        if (true) {
            dice_face = sprites.create(generate_die_side(blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[5]), SpriteKind.DiceFace)
            dice_face.top = (dice.top - most_top) / 18 * (4.5 * 18) + 2 * 18
            dice_face.left = (dice.left - most_left) / 18 * (3.5 * 18) + 1 * 18
            if (true) {
                blockObject.storeOnSprite(blockObject.create(), dice_face)
                blockObject.setNumberProperty(blockObject.getStoredObject(dice_face), NumProp.die_index, index)
                blockObject.setNumberProperty(blockObject.getStoredObject(dice_face), NumProp.side_index, 5)
            }
        }
        if (true) {
            dice_face = sprites.create(generate_die_side(blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[4]), SpriteKind.DiceFace)
            dice_face.top = (dice.top - most_top) / 18 * (4.5 * 18) + 3 * 18
            dice_face.left = (dice.left - most_left) / 18 * (3.5 * 18) + 1 * 18
            most_bottom = Math.max(most_bottom, dice_face.bottom)
            if (true) {
                blockObject.storeOnSprite(blockObject.create(), dice_face)
                blockObject.setNumberProperty(blockObject.getStoredObject(dice_face), NumProp.die_index, index)
                blockObject.setNumberProperty(blockObject.getStoredObject(dice_face), NumProp.side_index, 4)
            }
        }
        index += 1
    }
}
function make_die () {
    die = []
    for (let index2 = 0; index2 < 2; index2++) {
        die.push(make_dice())
    }
    place_die()
}
function make_button (image2: Image, selected_image: Image, label: string, hover: string) {
    button = sprites.create(image2, SpriteKind.Button)
    button.z = 1
    button_data = blockObject.create()
    blockObject.setImageProperty(button_data, ImageProp.image, image2)
    blockObject.setImageProperty(button_data, ImageProp.selected, selected_image)
    blockObject.setStringProperty(button_data, StrProp.label, label)
    blockObject.setStringProperty(button_data, StrProp.hover, hover)
    blockObject.storeOnSprite(button_data, button)
    return button
}
function pick_a_die () {
    picking_die = true
    destroy_side_buttons()
    destroy_grid_buttons()
    create_all_face_die()
    instructions_label = textsprite.create("A to upgrade, B to cancel", 0, 15)
    instructions_label.left = 2
    instructions_label.bottom = scene.screenHeight() - 2
    instructions_label.z = 10
    instructions_label.setFlag(SpriteFlag.Ghost, true)
    instructions_label.setFlag(SpriteFlag.RelativeToCamera, true)
    cursor_image = sprites.create(assets.image`cursor_image`, SpriteKind.Player)
    cursor_image.z = 2
    if (!(cursor)) {
        cursor = sprites.create(assets.image`cursor`, SpriteKind.Player)
        cursor.setPosition(most_right / 2, most_bottom / 2)
    } else {
        cursor.setFlag(SpriteFlag.Invisible, false)
    }
    scene.cameraFollowSprite(cursor)
    cursor_image.setPosition(cursor.x, cursor.y)
    while (controller.A.isPressed()) {
        pause(0)
    }
    controller.moveSprite(cursor)
    while (true) {
        cursor.x = Math.constrain(cursor.x, 0, most_right)
        cursor.y = Math.constrain(cursor.y, 0, most_bottom)
        cursor_image.setPosition(cursor.x, cursor.y)
        if (controller.A.isPressed()) {
            picked_die = [][0]
            for (let face_die of sprites.allOfKind(SpriteKind.DiceFace)) {
                if (cursor.overlapsWith(face_die)) {
                    picked_die = [blockObject.getNumberProperty(blockObject.getStoredObject(face_die), NumProp.die_index), blockObject.getNumberProperty(blockObject.getStoredObject(face_die), NumProp.side_index)]
                    break;
                }
            }
            if (picked_die) {
                break;
            }
        } else if (controller.B.isPressed()) {
            picked_die = [-1, -1]
            break;
        }
        pause(0)
    }
    while (controller.A.isPressed()) {
        pause(0)
    }
    picking_die = false
    instructions_label.destroy()
    cursor.setFlag(SpriteFlag.Invisible, true)
    cursor_image.destroy()
    sprites.destroyAllSpritesOfKind(SpriteKind.DiceFace)
    scene.cameraFollowSprite(null)
    scene.centerCameraAt(scene.screenWidth() / 2, scene.screenHeight() / 2)
    show_shop()
    make_shop_upgrade_buttons()
    return picked_die
}
function update_grid_buttons () {
    for (let index = 0; index <= grid_buttons.length - 1; index++) {
        button_data = blockObject.getStoredObject(grid_buttons[index])
        if (selected_grid_button == index && on_grid_buttons) {
            if (blockObject.getBooleanProperty(button_data, BoolProp.upgrade_bought)) {
                grid_buttons[index].setImage(assets.image`upgrade_already_bought_button_hover`)
                grid_buttons[index].sayText("Already bought!")
            } else {
                grid_buttons[index].setImage(blockObject.getImageProperty(button_data, ImageProp.selected))
                grid_buttons[index].sayText(blockObject.getStringProperty(button_data, StrProp.hover))
            }
        } else {
            if (blockObject.getBooleanProperty(button_data, BoolProp.upgrade_bought)) {
                grid_buttons[index].setImage(assets.image`upgrade_already_bought_button`)
                grid_buttons[index].sayText("Already bought!")
            } else {
                grid_buttons[index].setImage(blockObject.getImageProperty(button_data, ImageProp.image))
                grid_buttons[index].sayText("")
            }
        }
    }
}
controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    if (!(picking_die)) {
        if (in_shop) {
            if (on_grid_buttons) {
                if (selected_grid_button % 4 == 3) {
                	
                } else {
                    selected_grid_button = Math.min(selected_grid_button + 1, grid_buttons.length - 1)
                }
            } else {
                on_grid_buttons = true
                selected_side_button = 0
            }
            update_side_buttons()
            update_grid_buttons()
        }
    }
})
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
    } else if (number == 7) {
        return assets.image`die_side_7`
    } else if (number == 8) {
        return assets.image`die_side_8`
    } else if (number == 9) {
        return assets.image`die_side_9`
    } else if (number == 10) {
        return assets.image`die_side_10`
    } else if (number == 11) {
        return assets.image`die_side_11`
    } else if (number == 12) {
        return assets.image`die_side_12`
    } else if (number == 13) {
        return assets.image`die_side_13`
    } else if (number == 14) {
        return assets.image`die_side_14`
    } else if (number == 15) {
        return assets.image`die_side_15`
    } else if (number == 16) {
        return assets.image`die_side_16`
    } else if (number == -777) {
        return assets.image`die_side_bonus_777`
    } else if (number < 0) {
        return print_small_num_to_img(assets.image`unlabeled_global_boost_side`.clone(), Math.abs(number), 3, 8)
    } else {
        return print_small_num_to_img(assets.image`unlabeled_die_side`.clone(), number, 3, 5)
    }
}
function make_shop_upgrade_buttons () {
    destroy_grid_buttons()
    grid_buttons = []
    selected_grid_button = 0
    for (let upgrade of shop_upgrades) {
        if (blockObject.getBooleanProperty(upgrade, BoolProp.upgrade_bought)) {
            grid_buttons.push(make_button(assets.image`upgrade_already_bought_button`, assets.image`upgrade_already_bought_button_hover`, "", "Upgrade already bought!"))
        } else {
            if (blockObject.getNumberProperty(upgrade, NumProp.upgrade_type) == 1) {
                grid_buttons.push(make_button(assets.image`increment_die_upgrade_button`, assets.image`increment_die_upgrade_button_hover`, "", "Increment a side of a die by " + blockObject.getNumberProperty(upgrade, NumProp.upgrade_variant) + " for $" + blockObject.getNumberProperty(upgrade, NumProp.upgrade_cost)))
            } else if (blockObject.getNumberProperty(upgrade, NumProp.upgrade_type) == 2) {
                grid_buttons.push(make_button(assets.image`multiply_die_upgrade_button`, assets.image`multiply_die_upgrade_button_hover`, "", "Multiply a side of a die by " + blockObject.getNumberProperty(upgrade, NumProp.upgrade_variant) + " for $" + blockObject.getNumberProperty(upgrade, NumProp.upgrade_cost)))
            } else if (blockObject.getNumberProperty(upgrade, NumProp.upgrade_type) == 3) {
                grid_buttons.push(make_button(assets.image`global_percent_boost_button`, assets.image`global_percent_boost_button_hover`, "", "Give all die a global +" + blockObject.getNumberProperty(upgrade, NumProp.upgrade_variant) + "% boost when face landed on for $" + blockObject.getNumberProperty(upgrade, NumProp.upgrade_cost)))
            } else if (blockObject.getNumberProperty(upgrade, NumProp.upgrade_type) == 4) {
                grid_buttons.push(make_button(assets.image`global_percentage_boost_upgrade_button`, assets.image`global_percentage_boost_upgrade_button_hover`, "", "Give all die a global +" + blockObject.getNumberProperty(upgrade, NumProp.upgrade_variant) + "% boost for $" + blockObject.getNumberProperty(upgrade, NumProp.upgrade_cost)))
            } else if (blockObject.getNumberProperty(upgrade, NumProp.upgrade_type) == 5) {
                grid_buttons.push(make_button(assets.image`die_side_777_bonus_upgrade_button`, assets.image`die_side_bonus_777_upgrade_button_hover`, "", "Get a +777% multiplier every 77 times this face is rolled for $" + blockObject.getNumberProperty(upgrade, NumProp.upgrade_cost)))
            } else {
                if (blockObject.getNumberProperty(upgrade, NumProp.upgrade_variant) == 1) {
                    grid_buttons.push(make_button(assets.image`add_die_upgrade_button`, assets.image`add_die_upgrade_button_hover`, "", "Add 1 die for $" + blockObject.getNumberProperty(upgrade, NumProp.upgrade_cost)))
                } else {
                    grid_buttons.push(make_button(assets.image`add_die_upgrade_button`, assets.image`add_die_upgrade_button_hover`, "", "Add " + blockObject.getNumberProperty(upgrade, NumProp.upgrade_variant) + " dice for $" + blockObject.getNumberProperty(upgrade, NumProp.upgrade_cost)))
                }
            }
        }
    }
    place_grid_buttons()
    update_grid_buttons()
}
function show_dice (show: boolean) {
    for (let dice of die) {
        dice.setFlag(SpriteFlag.Invisible, !(show))
    }
}
function ask_roll_dice_until () {
    to_roll = game.askForNumber("How much do you want to roll to?", 10)
    if (to_roll == to_roll) {
        if (to_roll > info.score()) {
            make_cancel_rolls_buttons()
            role_dice_multiple_until(to_roll)
            make_game_buttons()
        } else {
            game.showLongText("You already have that many points!", DialogLayout.Bottom)
        }
    }
}
function destroy_grid_buttons () {
    for (let button of grid_buttons) {
        button.destroy()
    }
}
controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    if (!(picking_die)) {
        if (in_shop && on_grid_buttons) {
            if (selected_grid_button < 8) {
                selected_grid_button = Math.min(selected_grid_button + 4, grid_buttons.length - 1)
            }
        } else {
            if (selected_side_button < side_buttons.length - 1) {
                selected_side_button += 1
            }
        }
        update_side_buttons()
        if (in_shop) {
            update_grid_buttons()
        }
    }
})
function ask_roll_dice_multiple_times () {
    to_roll = game.askForNumber("How many times do you want to roll?", 4)
    if (to_roll == to_roll) {
        if (to_roll <= info.life()) {
            make_cancel_rolls_buttons()
            role_dice_multiple_times(to_roll)
            make_game_buttons()
        } else {
            game.showLongText("You can't roll over how many rolls you have left!", DialogLayout.Bottom)
        }
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
    if (!(picking_die)) {
        if (!(rolling_multiple) && !(in_shop)) {
            if (selected_side_button == 0) {
                roll_die()
            }
        }
    }
})
function hide_shop () {
    in_shop = false
    make_game_buttons()
    show_dice(true)
    destroy_grid_buttons()
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
// Types of upgrades:
// 1: Increment a die's side (+1 to +10)
//     cost: (200 + 10%) + ((increment * 5%) + (increment * 10))
// 2: Multiply a die's sides (2x to 5x)
//     cost: (500 + 20%) + ((multiply * 10%) + (multiply * 20))
// 3: Global percentage boost on face (+10% to +100)
//     cost: (1000 + 50%) + ((percentage * 10%) + (percentage * 5))
// 4: Global percentage boost (+1% to 10%)
//     cost: (1000 + 10%) + ((percentage * 5%) + (percentage * 10)
// 5: +777% every 77 times face landed on
//     cost (100 + 5%)
// 0: Buy more dice (+1 to +10)
//     cost: (100 + 10%) * dice
function generate_shop_upgrades () {
    shop_upgrades = []
    for (let index2 = 0; index2 < 12; index2++) {
        randint2 = randint(0, 5)
        upgrade_data = blockObject.create()
        blockObject.setNumberProperty(upgrade_data, NumProp.upgrade_type, randint2)
        blockObject.setBooleanProperty(upgrade_data, BoolProp.upgrade_bought, false)
        if (randint2 == 1) {
            blockObject.setNumberProperty(upgrade_data, NumProp.upgrade_variant, randint(1, 10))
            blockObject.setNumberProperty(upgrade_data, NumProp.upgrade_cost, Math.round(200 + info.score() * 0.1 + (blockObject.getNumberProperty(upgrade_data, NumProp.upgrade_variant) * (info.score() * 0.05) + blockObject.getNumberProperty(upgrade_data, NumProp.upgrade_variant) * 10)))
            blockObject.setBooleanProperty(upgrade_data, BoolProp.need_dice_picked, true)
        } else if (randint2 == 2) {
            blockObject.setNumberProperty(upgrade_data, NumProp.upgrade_variant, randint(2, 5))
            blockObject.setNumberProperty(upgrade_data, NumProp.upgrade_cost, Math.round(500 + info.score() * 0.2 + (blockObject.getNumberProperty(upgrade_data, NumProp.upgrade_variant) * (info.score() * 0.1) + blockObject.getNumberProperty(upgrade_data, NumProp.upgrade_variant) * 20)))
            blockObject.setBooleanProperty(upgrade_data, BoolProp.need_dice_picked, true)
        } else if (randint2 == 3) {
            blockObject.setNumberProperty(upgrade_data, NumProp.upgrade_variant, randint(10, 99))
            blockObject.setNumberProperty(upgrade_data, NumProp.upgrade_cost, Math.round(1000 + info.score() * 0.5 + (blockObject.getNumberProperty(upgrade_data, NumProp.upgrade_variant) * (info.score() * 0.1) + blockObject.getNumberProperty(upgrade_data, NumProp.upgrade_variant) * 5)))
            blockObject.setBooleanProperty(upgrade_data, BoolProp.need_dice_picked, true)
        } else if (randint2 == 4) {
            blockObject.setNumberProperty(upgrade_data, NumProp.upgrade_variant, randint(1, 10))
            blockObject.setNumberProperty(upgrade_data, NumProp.upgrade_cost, Math.round(1000 + info.score() * 0.1 + (blockObject.getNumberProperty(upgrade_data, NumProp.upgrade_variant) * (info.score() * 0.05) + blockObject.getNumberProperty(upgrade_data, NumProp.upgrade_variant) * 10)))
            blockObject.setBooleanProperty(upgrade_data, BoolProp.need_dice_picked, false)
        } else if (randint2 == 5) {
            blockObject.setBooleanProperty(upgrade_data, BoolProp.need_dice_picked, true)
            blockObject.setNumberProperty(upgrade_data, NumProp.upgrade_cost, Math.round(1000 + info.score() * 0.05))
        } else {
            blockObject.setNumberProperty(upgrade_data, NumProp.upgrade_variant, randint(1, 5))
            blockObject.setNumberProperty(upgrade_data, NumProp.upgrade_cost, Math.round((100 + info.score() * 0.1) * blockObject.getNumberProperty(upgrade_data, NumProp.upgrade_variant)))
            blockObject.setBooleanProperty(upgrade_data, BoolProp.need_dice_picked, false)
        }
        shop_upgrades.push(upgrade_data)
    }
}
function make_shop_buttons () {
    destroy_side_buttons()
    side_buttons = [make_button(assets.image`exit_shop_button`, assets.image`exit_shop_button_selected`, "", "Exit shop")]
    selected_side_button = 0
    side_buttons.push(make_button(assets.image`reroll_shop_button`, assets.image`reroll_shop_button_selected`, "", "Re-roll shop"))
    for (let index = 0; index <= side_buttons.length - 1; index++) {
        side_buttons[index].left = 2
        side_buttons[index].y = scene.screenHeight() / 2 - (side_buttons.length - 1) * 10 + index * 20
    }
    update_side_buttons()
    make_shop_upgrade_buttons()
}
function apply_upgrade (die_select: any[], upgrade_in_list: any[]) {
    if (does_upgrade_type_need_die(blockObject.getNumberProperty(upgrade_in_list[0], NumProp.upgrade_type))) {
        if (die_select[0] == -1) {
            return 1
        }
        dice_data = blockObject.getStoredObject(die[parseFloat(die_select[0])])
        previous_value = blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[parseFloat(die_select[1])]
        if (blockObject.getNumberProperty(upgrade_in_list[0], NumProp.upgrade_type) == 1) {
            if (previous_value < 0) {
                return 2
            }
            blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[parseFloat(die_select[1])] = blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[parseFloat(die_select[1])] + blockObject.getNumberProperty(upgrade_in_list[0], NumProp.upgrade_variant)
        } else if (blockObject.getNumberProperty(upgrade_in_list[0], NumProp.upgrade_type) == 2) {
            if (previous_value < 0) {
                return 2
            }
            blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[parseFloat(die_select[1])] = blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[parseFloat(die_select[1])] * blockObject.getNumberProperty(upgrade_in_list[0], NumProp.upgrade_variant)
        } else if (blockObject.getNumberProperty(upgrade_in_list[0], NumProp.upgrade_type) == 3) {
            if (previous_value < 0) {
                blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[parseFloat(die_select[1])] = blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[parseFloat(die_select[1])] - blockObject.getNumberProperty(upgrade_in_list[0], NumProp.upgrade_variant)
            } else {
                blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[parseFloat(die_select[1])] = blockObject.getNumberProperty(upgrade_in_list[0], NumProp.upgrade_variant) * -1
            }
        } else if (blockObject.getNumberProperty(upgrade_in_list[0], NumProp.upgrade_type) == 5) {
            blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[parseFloat(die_select[1])] = -777
            if (blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[parseFloat(die_select[1])] == -777) {
            	
            } else {
                blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[parseFloat(die_select[1])] = Math.constrain(blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[parseFloat(die_select[1])], -99, 99)
            }
            if (blockObject.getNumberArrayProperty(dice_data, NumArrayProp.values)[parseFloat(die_select[1])] == previous_value) {
                return 2
            }
        }
    } else {
        if (blockObject.getNumberProperty(upgrade_in_list[0], NumProp.upgrade_type) == 0) {
            for (let index2 = 0; index2 < blockObject.getNumberProperty(upgrade_in_list[0], NumProp.upgrade_variant); index2++) {
                die.push(make_dice())
            }
            place_die()
            show_dice(false)
        } else if (blockObject.getNumberProperty(upgrade_in_list[0], NumProp.upgrade_type) == 4) {
            global_multiplier += blockObject.getNumberProperty(upgrade_in_list[0], NumProp.upgrade_variant)
        }
    }
    return 0
}
let global_multiplier_label: TextSprite = null
let recent_score: TextSprite = null
let previous_value = 0
let upgrade_data: blockObject.BlockObject = null
let randint2 = 0
let to_roll = 0
let picked_die: number[] = []
let cursor: Sprite = null
let cursor_image: Sprite = null
let instructions_label: TextSprite = null
let button: Sprite = null
let dice_face: Sprite = null
let index = 0
let most_right = 0
let most_bottom = 0
let most_left = 0
let most_top = 0
let curr_top = 0
let curr_left = 0
let orign_left = 0
let row_counter = 0
let die_per_col = 0
let die_per_row = 0
let dice: Sprite = null
let grid_buttons: Sprite[] = []
let ret = 0
let previous_selected = 0
let shop_upgrades: blockObject.BlockObject[] = []
let temp_sprite: TextSprite = null
let last_score = 0
let dice_data: blockObject.BlockObject = null
let die: Sprite[] = []
let raw_multiplier = 0
let raw_score = 0
let selected_grid_button = 0
let selected_side_button = 0
let button_data: blockObject.BlockObject = null
let side_buttons: Sprite[] = []
let selected_side_label: TextSprite = null
let picking_die = false
let on_grid_buttons = false
let in_shop = false
let cancel_multiple_roll = false
let rolling_multiple = false
let recent_scores: number[] = []
let bonus_777_count = 0
let global_multiplier = 0
global_multiplier = 0
bonus_777_count = 0
recent_scores = []
rolling_multiple = false
cancel_multiple_roll = false
in_shop = false
on_grid_buttons = false
picking_die = false
stats.turnStats(true)
controller.configureRepeatEventDefaults(500, 50)
prepare_hud()
make_die()
generate_shop_upgrades()
info.setScore(5000)
game.onUpdate(function () {
    while (recent_scores.length > 0) {
        recent_score = textsprite.create("+" + recent_scores.shift(), 0, 15)
        recent_score.setFlag(SpriteFlag.AutoDestroy, true)
        recent_score.setFlag(SpriteFlag.Ghost, true)
        recent_score.z = 2
        recent_score.top = 16
        recent_score.right = scene.screenWidth()
        recent_score.vy = -200
    }
})
game.onUpdate(function () {
    if (spriteutils.isDestroyed(global_multiplier_label)) {
        global_multiplier_label = textsprite.create("", 1, 3)
        global_multiplier_label.setIcon(assets.image`global_multiplier_icon`)
        global_multiplier_label.setBorder(1, 3, 1)
        global_multiplier_label.setFlag(SpriteFlag.Ghost, true)
        global_multiplier_label.setFlag(SpriteFlag.RelativeToCamera, true)
        global_multiplier_label.z = 1
    }
    global_multiplier_label.setFlag(SpriteFlag.Invisible, picking_die || global_multiplier == 0)
    global_multiplier_label.setText("+" + global_multiplier + "%")
    global_multiplier_label.left = -1
    global_multiplier_label.bottom = scene.screenHeight() + 1
})
