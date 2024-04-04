var inputAnswer = document.getElementById('input-answer')
var total_score = document.getElementById('count-point')
var table
var labelQuestion = document.getElementById('label-question')
var table = document.querySelector("#progress-table")
var score_first_question
var score_current_question
var idxQuestion = 0;
var sendButton = document.getElementById('button-form-answer')
var total_questions;
crateTable()
function crateTable() {
    fetch('/getDataTable_carousel')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            total_questions = data.total_questions
            // Создаем 100 строк и добавляем их в таблицу
            for (var i = 1; i <= total_questions; i++) {
                // Создаем новую строку
                var row = document.createElement("tr");

                // Создаем первую ячейку с номером строки
                var cell1 = document.createElement("th");
                cell1.textContent = i;

                // Создаем вторую ячейку с любым текстом
                var cell2 = document.createElement("th");
                cell2.textContent = "";

                // Добавляем ячейки в строку
                row.appendChild(cell1);
                row.appendChild(cell2);

                // Добавляем строку в тело таблицы
                table.appendChild(row);
            }

            table.rows[1].cells[1].innerHTML = data.score_first_question
            labelQuestion.innerHTML = data.questions[0]
            total_score.innerHTML = data.gameProgress.score
            for (var i = 0; i < data.gameProgress.values.length; i++) {
                labelQuestion.innerHTML = data.questions[i + 1]
                if (data.gameProgress.values[i] === 0) {
                    table.rows[i + 1].cells[0].style.backgroundColor = "red"
                    if (i + 1 < total_questions) {
                        table.rows[i + 2].cells[1].innerHTML = parseInt(table.rows[i + 1].cells[1].innerHTML) - data.score_failure
                        if (parseInt(table.rows[i + 2].cells[1].innerHTML) < data.score_first_question) {
                            table.rows[i + 2].cells[1].innerHTML = data.score_first_question
                        }
                    }
                }
                else {
                    table.rows[i + 1].cells[0].style.backgroundColor = "green"
                    if (i + 1 < total_questions) {
                        table.rows[i + 2].cells[1].innerHTML = parseInt(table.rows[i + 1].cells[1].innerHTML) + data.score_success
                    }
                }
            }


            getData(data.gameProgress.values.length)
            document.getElementById("load").style.display = "none"
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}
function getData(idx) {
    score_first_question = parseInt(table.rows[1].cells[1].innerText)
    score_current_question = score_first_question
    idxQuestion = idx
}

function incIdxQuestion() {
    idxQuestion++
}

let flag = false

sendButton.addEventListener('click', async function (event) {
    event.preventDefault(); // Предотвращаем стандартное поведение отправки формы (обновление страницы)    

    if (idxQuestion === total_questions) {
        inputAnswer.value = ''
        console.log('Тест закончен')
        return
    }

    if (flag) {
        return
    }

    flag = true
    console.log('начало' + idxQuestion)

    await fetch('/sendAnswer_Carousel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idxQuestion: idxQuestion, answerUser: inputAnswer.value, pointsValue: score_current_question })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {

            if (data.answer) {
                total_score.innerText = Number(total_score.innerText) + score_current_question
                score_current_question += data.score_success
                table.rows[idxQuestion + 1].cells[0].style.backgroundColor = "green"
            }
            else {
                if (score_current_question - data.score_failure <= score_first_question) {
                    score_current_question = score_first_question
                }
                else {
                    score_current_question -= data.score_failure
                }
                table.rows[idxQuestion + 1].cells[0].style.backgroundColor = "red"
            }
            inputAnswer.value = ''
            if (idxQuestion < total_questions - 1) {
                table.rows[idxQuestion + 2].cells[1].innerHTML = score_current_question
            }
            labelQuestion.innerHTML = data.question
            incIdxQuestion()
            console.log(data)
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });

    console.log('конец' + idxQuestion)
    flag = false
})