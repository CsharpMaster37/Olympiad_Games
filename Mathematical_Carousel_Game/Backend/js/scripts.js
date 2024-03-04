var dataJson = {
    "score_first_question": 3,
    "score_failure": 3,
    "score_success": 1,
    "total_questions": 10,
    "questions": [
        {
            "question": "Кто написал 'Мастер и Маргарита'?",
            "answer": "Михаил Булгаков"
        },
        {
            "question": "Какое животное является символом России?",
            "answer": "Медведь"
        },
        {
            "question": "Сколько континентов на Земле?",
            "answer": "Семь"
        },
        {
            "question": "Как называется процесс превращения воды в пар?",
            "answer": "Испарение"
        },
        {
            "question": "Как называется главный герой сказки 'Красная шапочка'?",
            "answer": "Красная Шапочка"
        },
        {
            "question": "Сколько восьмерок в пакете обычных карточных колод?",
            "answer": "Четыре"
        },
        {
            "question": "Как называется главная гора в США?",
            "answer": "Денали"
        },
        {
            "question": "Как называется столица Германии?",
            "answer": "Берлин"
        },
        {
            "question": "Сколько дней в феврале в високосном году?",
            "answer": "29"
        },
        {
            "question": "Как называется самый большой океан на Земле?",
            "answer": "Тихий"
        }
    ]
}
var score_first_question = dataJson.score_first_question
var score_current_question = score_first_question
var score_failure = dataJson.score_failure
var score_success = dataJson.score_success
var total_questions = dataJson.total_questions
var questions = dataJson.questions
/* fetch('../../Backend/questions_answer.json')
    .then(response => response.json())
    .then(data => {
        // Обработка данных из файла JSON
        score_first_question = data.score_first_question
        score_failure = data.score_failure
        score_success = data.score_success  
        total_questions = data.total_questions
        questions = data.questions
    })
    .catch(error => {
        console.error('Ошибка загрузки файла JSON:', error);
    }); */

// Получаем элемент тела таблицы
var tbody = document.querySelector("#progress-table");

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
    tbody.appendChild(row);
}

var table = document.querySelector("#progress-table")
table.rows[1].cells[1].innerHTML = score_first_question
var labelQuestion = document.getElementById('label-question')
var inputAnswer = document.getElementById('input-answer')
var total_score = document.getElementById('count-value')
var idxQuestion = 0;
labelQuestion.innerHTML = questions[idxQuestion].question
document.getElementById('button-form-answer').addEventListener('click', function () {
    if (inputAnswer.value == questions[idxQuestion].answer) {
        total_score.innerText = Number(total_score.innerText) + score_current_question
        score_current_question += score_success
    }
    else {
        if (score_current_question - score_failure <= score_first_question) {
            score_current_question = score_first_question
        }
        else {
            score_current_question -= score_failure
        }
    }
    inputAnswer.value = ''
    if (idxQuestion == total_questions - 1) {
        alert("Тест закончен!")
        return
    }
    table.rows[idxQuestion + 2].cells[1].innerHTML = score_current_question
    idxQuestion++;
    labelQuestion.innerHTML = questions[idxQuestion].question
})
