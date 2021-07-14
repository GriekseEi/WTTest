// We maken van alle globale waardes een constante; dit maakt de code overzichtelijker en ook makkelijker
// aan te passen in de toekomst als het nodig is
const BOARD_X = 7
const BOARD_Y = 6
const STATE_KEY = "state"

/**
 * Elke mogelijke Player correspondeert ook tot een CSS-klasse met dezelfde naam; Player.ONE heeft als
 * eigenlijke waarde de string "one", en verwijst ook naar de CSS-klasse "one". Deze CSS-klasse zegt ook
 * dat een element geel als achtergrondkleur moet hebben, en voor Player.TWO/"two" is dit rood. 
 */
const Player = {
    ONE: "one",
    TWO: "two",
    NONE: "none"
}

/** @class Alle gegevens over de huidige staat van het spel staan hierin. */
class Model {
    constructor() {
        //Houdt bij voor elke cel in het bord van welke speler er een fiche in zit.
        this.data = Array.from(Array(BOARD_X), () => new Array(BOARD_Y).fill(Player.NONE))

        // Houdt bij voor elke kolom in het bord wat de laagst mogelijke Y-positie daarin is.
        this.counters = new Array(BOARD_X).fill(BOARD_Y - 1)

        // De speler die momenteel aan de beurt is.
        this.currentPlayer = Player.ONE
    }
}

/**
 * Genereer een nieuw spelbord in de DOM en cache elke cel in een array.
 * 
 * @param {HTMLElement} source_div De bron <div> waarin het nieuwe spelbord wordt aangemaakt.
 * @returns {Array} De upgedate bron <div>, en de array van alle gecachte cel DOM-elementen
 */
function generateTable(source_div) {
    // Maak de variables aan waarop we alle toepassingen zullen uitvoeren
    let view = []
    let table = $('<table>') // In JQuery hoeven we alleen de opening tag mee te geven, de closing tag ('</table>') is automatisch gegenereerd

    // Voeg BOARD_Y-keer een nieuwe rij aan de tabel toe. 
    for (i = 0; i < BOARD_Y; i++) {
        let row = $('<tr>')

        // Voeg per rij BOARD_X-keer een nieuwe cel aan de rij toe.
        for (j = 0; j < BOARD_X; j++) {
            // Bereken wat de nieuwe id van deze cel moet zijn. 
            let id = (i * BOARD_X) + j
            // Elke nieuwe cel geven we de CSS-klasse "null", en een id-property zodat we cellen later van elkaar kunnen onderscheiden.
            let cell = $('<td>').addClass(Player.NONE).attr('id', id.toString())

            // Voeg de cel aan de tabelrij toe
            row.append(cell)
            // Voeg de cel aan de array toe zodat we het later meteen kunnen opzoeken met de id van de cel als diens index in de array
            view[id] = cell
        }
        // Voeg de rij met de nieuwe cellen aan de tabel toe.
        table.append(row)
    }
    // Voeg de gemaakte tabel toe aan de bron <div>
    source_div.append(table)

    return [ source_div, view ]
}

/**
 * Voeg een fiche toe aan het bord.
 * 
 * @param {Model} model De counters voor elke kolom staan in het gegeven Model object.
 * @param {Array} view Een array van de DOM-elementen voor elke gleuf in het bord.
 * @param {number} column De X-positie in het bord waarin een nieuwe fiche ingezet wordt.
 */
function insertFiche(model, view, column) {
    // Pak de laagst mogelijke Y-positie voor de gegeven kolom.
    counter = model.counters[column]

    // Als de counter kleiner is dan 0, dan betekent dat dat deze kolom vol zit.
    if (counter >= 0) {
        // Zet de coördinaten om naar de id-nummer van de cel waarin de fiche zal komen. 
        slotID = (counter * BOARD_X) + column

        // Geef aan dat deze cel momenteel een fiche heeft van currentPlayer
        model.data[column][counter] = model.currentPlayer
        // Pas de view van deze cel aan naar de CSS-klasse van currentPlayer
        view[slotID].removeClass(`${Player.ONE} ${Player.TWO} ${Player.NONE}`)
        view[slotID].addClass(model.currentPlayer)
        // Decrementeer de counter voor deze kolom bij één.
        model.counters[column]--
    } else {
        alert("Deze kolom is vol")
    }

}

function checkVictory(model, x, y, counter = 1) {
    for (direction = 0; direction < 9; direction++) {
        if (direction == 4) continue; // Dit is de geklikte positie; deze hoeven we niet te checken

        let row = y + ((direction % 3) - 1)
        let col = x + ((direction / 3) - 1)

        if (row >= 0 && row < BOARD_Y && col >= 0 && col < BOARD_X) {
            if (model.data[col][row] == model.currentPlayer) {
                counter++
                if (counter > 3) {
                    return true
                } else {
                    return checkVictory(model, col, row, counter)
                }
            } else {
                return false
            }
        } else {
            return false
        }
    }
}

/**
 * Werkt het spel bij wanneer een cel wordt geklikt.
 * 
 * @param {HTMLTableCellElement} cell De cel die geklikt is.
 * @param {Array} view Alle cel-elementen.
 * @param {Model} model De gegevens over de huidige staat van het spel.
 */
function onCellClick(cell, view, model) {
    console.log(`Clicked X: ${cell.cellIndex}, Y: ${cell.parentNode.rowIndex}`)
    insertFiche(model, view, cell.cellIndex)
    //checkVictory(data, cell.cellIndex, cell.parentNode.rowIndex)
    // Zet de huidige speler om naar de andere speler
    model.currentPlayer = (model.currentPlayer == Player.ONE ? Player.TWO : Player.ONE)
}

// Dit voeren we allemaal uit nadat de pagina ingeladen is.
$(document).ready(function() {
    let model = new Model()
    let [ $mainTable, $view ] = generateTable($("#mainTable"))

    // Aan elke <td> element in de DOM binden we bij een click event onCellClick()
    $("td").click(function() {
        onCellClick(this, $view, model)
    })

    // Als de clearBtn knop is gedrukt, dan willen we alles resetten
    $("#clearBtn").click(function() {
        model = new Model()
        $view.forEach((cell) => {
            cell.removeClass(`${Player.ONE} ${Player.TWO} ${Player.NONE}`)
            cell.addClass(Player.NONE)
        })
    })

    // Sla de staat van het spel op als JSON in de localStorage.
    $("#saveBtn").click(function() {
        localStorage.setItem(STATE_KEY, JSON.stringify(model))
    })

    // Laad de opgeslagen staat in van localStorage, en werk het spel naar behoren bij.
    $("#loadBtn").click(function() {
        let loadedData = localStorage.getItem(STATE_KEY)

        // Als er niks opgeslagen is, geef een melding terug
        if (loadedData !== null) {
            // Zet de JSON-object om naar een Model-object.
            model = JSON.parse(loadedData)

            // Zet de kleur van elke cel om aan de hand van wat er in de Model staat voor deze XY-positie.
            $view.forEach((cell, index) => {
                cell.removeClass(`${Player.ONE} ${Player.TWO} ${Player.NONE}`)
                cell.addClass(model.data[index % BOARD_X][(index - (index % BOARD_X)) / BOARD_X])
            })
        } else {
            alert("Geen opgeslagen spel gevonden.")
        }
    })
})