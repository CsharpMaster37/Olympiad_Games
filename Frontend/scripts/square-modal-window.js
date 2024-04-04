//Константы
var buttons = document.querySelectorAll('.Question')
var table = document.querySelector('.Square-table');
var rowIndex = 0;
var cellIndex = 0;
let rowsCount = [0, 0, 0, 0, 0, 0]
let cellsCount = [0, 0, 0, 0, 0, 0]
document.addEventListener('DOMContentLoaded', () => {
    getProgress();
});
//Закрытие модального окна
document.getElementById("close-button-modal-window").addEventListener("click",
    function () {
        document.getElementById("modal-window-question").classList.remove("open")
    }
)

function getProgress() {
    fetch('/getProgress_square')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("count-point").innerHTML = data.score
            var i = 0
            data.values.forEach(element => {
                if (element != null) {
                    rowIndex = Math.floor(i / 5) + 1; // Вычисляем индекс строки
                    cellIndex = i % 5 + 1; // Вычисляем индекс столбца
                    if (element > 0)
                        btnGreen(buttons[i], true)
                    else
                        btnRed(buttons[i], true)
                }
                i++
            });
            document.getElementById("load").style.display = "none"
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

//Открытие модального окна
for (let i = 0; i < buttons.length; ++i) {
    buttons[i].addEventListener(
        "click",
        function (event) {
            var button = event.target;
            var cell = button.parentElement; // Получаем ячейку, содержащую кнопку
            var row = cell.parentElement; // Получаем строку, содержащую ячейку
            rowIndex = row.rowIndex; // Индекс строки
            cellIndex = cell.cellIndex; // Индекс ячейки в строке

            fetch('/topics_square')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    document.getElementById("question").textContent = data[rowIndex - 1].questions[cellIndex - 1].question
                })
                .catch(error => {
                    console.error('There has been a problem with your fetch operation:', error);
                });
            document.getElementById("modal-window-question").classList.add("open");
            document.getElementById("send-answer").addEventListener("click", function () {
            });
        }
    );
}

let flag = false
document.getElementById("send-answer").addEventListener("click", async function (event) {
    event.preventDefault(); // Предотвращаем стандартное поведение отправки формы (обновление страницы)
    if (flag) {
        return
    }
    flag = true
    // Получаем значение из input
    var inputValue = document.getElementById("answer-input").value;
    var pointsValue = parseInt(buttons[(rowIndex - 1) * 5 + (cellIndex - 1)].innerHTML[0]) * 10

    // Отправка данных на сервер
    await fetch('/sendAnswer_Square', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rowIndex: rowIndex, cellIndex: cellIndex, inputValue: inputValue, pointsValue: pointsValue })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Обработка ответа от сервера
            var color = data ? "green" : "red";
            var index = (rowIndex - 1) * 5 + (cellIndex - 1);
            // Применяем изменения к кнопке
            if (color == "green") {
                btnGreen(buttons[index], false);
            }
            else {
                btnRed(buttons[index], false);
            }

            document.getElementById("answer-input").value = ""
            console.log(data)
            document.getElementById("modal-window-question").classList.remove("open");
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
    setTimeout(() => flag = false, 600)
});


function btnRed(btn, loadProgress) {
    btn.style.background = "none";
    btn.style.backgroundColor = "red";
    btn.disabled = true;
}

function btnGreen(btn, loadProgress) {
    btn.style.background = "none";
    btn.style.backgroundColor = "green";
    btn.disabled = true;
    if (!loadProgress) {
        var inputValue = document.getElementById("count-point").innerHTML
        inputValue = parseInt(inputValue)
        var PointsValue = parseInt(btn.innerHTML[0])
        inputValue += PointsValue * 10
        document.getElementById("count-point").innerHTML = inputValue
    }
    rowsCount[rowIndex]++
    cellsCount[cellIndex]++
    checkRow(rowsCount[rowIndex], loadProgress)
    checkCells(cellsCount[cellIndex], loadProgress)
}

function AddBonus() {
    var inputValue = document.getElementById("count-point").innerHTML
    var score = 30
    inputValue = parseInt(inputValue)
    inputValue += score
    document.getElementById("count-point").innerHTML = inputValue
    fetch('/addbonus_square', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score: score })
    })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function checkRow(rowCnt, loadProgress) {
    if (rowCnt == 5) {
        table.rows[rowIndex].cells[6].style.backgroundColor = "Green"
        if (!loadProgress)
            AddBonus()
    }
}
function checkCells(cellCnt, loadProgress) {
    if (cellCnt == 5) {
        table.rows[6].cells[cellIndex].style.backgroundColor = "Green"
        if (!loadProgress)
            AddBonus()
    }
}


