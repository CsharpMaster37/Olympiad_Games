//Константы
var buttons = document.querySelectorAll('.Question')
var table = document.querySelector('.Square-table');
var rowIndex = 0;   
var cellIndex = 0;
let rowsCount = [0, 0, 0, 0, 0, 0]
let cellsCount = [0, 0, 0, 0, 0, 0]
//Закрытие модального окна
document.getElementById("close-button-modal-window").addEventListener("click",
    function(){    
        document.getElementById("modal-window-question").classList.remove("open")
    }
)

//Открытие модального окна
for (let i = 0; i < buttons.length; ++i) {  
    buttons[i].addEventListener(
        "click",
        function (event) {
            document.getElementById("modal-window-question").classList.add("open");
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
                    document.getElementById("question").textContent = data[rowIndex-1].questions[cellIndex-1].question
                })
                .catch(error => {
                    console.error('There has been a problem with your fetch operation:', error);
                });
                
            document.getElementById("send-answer").addEventListener("click", function() {
                // Установка значений rowIndex и cellIndex для скрытых полей
                document.getElementById("rowIndexInput").value = rowIndex;
                document.getElementById("cellIndexInput").value = cellIndex; 
            });
        }
    );
}

document.getElementById("send-answer").addEventListener("click", function(event){
    event.preventDefault(); // Предотвращаем стандартное поведение отправки формы (обновление страницы)

    // Получаем значение из input
    var inputValue = document.getElementById("answer-input").value;

    // Установка значений rowIndex и cellIndex для скрытых полей
    document.getElementById("rowIndexInput").value = rowIndex;
    document.getElementById("cellIndexInput").value = cellIndex; 

    // Отправка данных на сервер
    fetch('/sendAnswer_Square', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rowIndex: rowIndex, cellIndex: cellIndex, inputValue: inputValue })
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
        var index = (rowIndex-1)*5 + (cellIndex-1);       
        // Применяем изменения к кнопке
        if(color == "green") {
            btnGreen(buttons[index]);
        }
        buttons[index].style.background = "none";
        buttons[index].style.backgroundColor = color;
        buttons[index].disabled = true;

        // Закрываем окно
        document.getElementById("modal-window-question").classList.remove("open");
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
});

function btnGreen(btn)
{
    var inputValue = document.getElementById("count-point").innerHTML
            inputValue = parseInt(inputValue)
            var PointsValue = parseInt(btn.innerHTML[0])
            inputValue+=PointsValue   
            document.getElementById("count-point").innerHTML = inputValue
            rowsCount[rowIndex]++
            cellsCount[cellIndex]++
            checkRow(rowsCount[rowIndex])
            checkCells(cellsCount[cellIndex])
}

function AddBonus()
{
    var inputValue = document.getElementById("count-point").innerHTML
    inputValue = parseInt(inputValue)
    inputValue+=3
    document.getElementById("count-point").innerHTML = inputValue
}

function checkRow(rowCnt)
{
    if(rowCnt == 5)
    {
        table.rows[rowIndex].cells[6].style.backgroundColor = "Green"
        AddBonus()
    }
}
function checkCells(cellCnt)
{
    if(cellCnt == 5)
    {
        table.rows[6].cells[cellIndex].style.backgroundColor = "Green"
        AddBonus()
    }
}




