const Player = {
    ONE: "one",
    TWO: "two",
    NULL: "null"
}

const BOARD_X = 7;
const BOARD_Y = 6;

class Model {
    data = Array.from(Array(BOARD_X), () => new Array(BOARD_Y).fill(Player.NULL));
    counters = new Array(BOARD_X).fill(BOARD_Y)
}

var currentPlayer = Player.ONE;
var $mainTable;
var $view;
var data = new Model()

function generateTable() {
    var table = $('<table>')
    for (i = 0; i < BOARD_Y; i++) {
        var row = $('<tr>');
        for (j = 0; j < BOARD_X; j++) {
            var cell = $('<td>').addClass('null').attr('id', ((i * BOARD_X) + j).toString());
            row.append(cell);
        }
        table.append(row);
    }

    return table;
}

function getSlots() {
    var arr = [];
    for (i = 0; i < (BOARD_X * BOARD_Y); i++) {
        arr[i] = $("#" + i.toString())
    }

    return arr
}

function insertFiche(model, view, column) {
    counter = model.counters[column]
    slotID = (counter * BOARD_X - 1) - (BOARD_Y - column)

    if (counter > 0) {
        model.data[column][counter] = currentPlayer;
        view[slotID].removeClass("one two null")
        view[slotID].addClass(currentPlayer)
        model.counters[column]--;
    } else {
        alert("Deze kolom is vol")
    }

}

function checkVictory(model, x, y, counter = 1) {
    for (direction = 0; direction < 9; direction++) {
        if (direction == 4) continue; // Dit is de geklikte positie; deze hoeven we niet te checken

        var row = y + ((direction % 3) - 1)
        var col = x + ((direction / 3) - 1)

        if (row >= 0 && row < BOARD_Y && col >= 0 && col < BOARD_X) {
            if (model[col][row] == currentPlayer) {
                counter++;
                if (counter > 3) {
                    return true;
                } else {
                    return checkVictory(model, col, row, counter);
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}

function onCellClick(cell, event) {
    console.log("Clicked X: " + cell.cellIndex + ", Y: " + cell.parentNode.rowIndex)
    insertFiche(data, $view, cell.cellIndex)
    //checkVictory(data, cell.cellIndex, cell.parentNode.rowIndex)
    currentPlayer = (currentPlayer == Player.ONE ? Player.TWO : Player.ONE)
}

function clear() {
    currentPlayer = Player.ONE;
    data = new Model()
    $view.forEach((cell) => {
        cell.removeClass("one two null")
        cell.addClass("null")
    })
}

$(document).ready(function() {
    $mainTable = $("#mainTable")
    $mainTable.append(generateTable());

    $view = getSlots();

    $("td").click(function(event) {
        onCellClick(this, event);
    })

    $("#clearBtn").click(function() {
        clear();
    })
})