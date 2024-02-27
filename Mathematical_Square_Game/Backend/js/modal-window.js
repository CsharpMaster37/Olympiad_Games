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
            
        }
    );
}

document.getElementById("send-answer").addEventListener("click",
    function(){    
        //Временный рандом для тестов
        var randomNum = Math.random();
        var color = randomNum < 0.2 ? "red" : "green";
        var index = (rowIndex-1)*5+(cellIndex-1)
        //
        if(color == "green")
        {
            btnGreen(buttons[index])
        }
        buttons[index].style.background = "none"
        buttons[index].style.backgroundColor = color
        buttons[index].disabled = true

        //Закроем окно
        document.getElementById("modal-window-question").classList.remove("open")
    }
);

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




