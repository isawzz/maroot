function select_add_items(items, callback, instruction, min = 0, max = Infinity, me, table, ui) {
    // Assign positional indices so A.selected.map(i => A.items[i]) works correctly.
    // Done here rather than in the item-factory functions so the index always
    // reflects this selection's ordering, not any previous one.
    items.forEach((item, i) => item.index = i);

    // Store everything on Z.A as the single selection context.
    // Callbacks, make_card_selectable, select_error, and show_confirm_button
    // all read from here — no extra args needed downstream.
    Object.assign(Z.A, {
        items,
        callback,
        instruction,
        selected: [],   // array of indices into items[]
        min,
        max,
        me,
        table,
        ui,
    });

    show_instruction(instruction);
    items.forEach(item => make_card_selectable(item));
    show_confirm_button(callback);
}
