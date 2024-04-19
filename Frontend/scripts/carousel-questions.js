var score_first_question = 0;
var score_failure = 0;
var score_success = 0;
var total_questions = 0;
var questions = [];


function CountQuestions() {
    total_questions = document.getElementById('total_questions').value;
    var questionsBody = document.getElementById('CarouselQuestionsBody');
    questionsBody.innerHTML = '';
    // Добавляем строки с существующими данными из массива questions
    for (var i = 1; i <= Math.min(total_questions, questions.length); i++) {
        var row = document.createElement('tr');
        row.innerHTML = `
            <td>${i}</td>
            <td><input type="text" id="question_${i}" value="${questions[i - 1].question}"></td>
            <td><input type="text" id="answer_${i}" value="${questions[i - 1].answer}"></td>
        `;
        questionsBody.appendChild(row);
    }

    // Добавляем пустые строки, если необходимо
    for (var i = questions.length + 1; i <= total_questions; i++) {
        var row = document.createElement('tr');
        row.innerHTML = `
            <td>${i}</td>
            <td><input type="text" id="question_${i}" value=""></td>
            <td><input type="text" id="answer_${i}" value=""></td>
        `;
        questionsBody.appendChild(row);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await fetch('/get_question_carousel')
        .then(response => response.json())
        .then(data => {
            score_first_question = data.score_first_question
            score_failure = data.score_failure
            score_success = data.score_success
            total_questions = data.total_questions
            questions = data.questions
        })
        .catch(error => console.error('Ошибка при выполнении запроса:', error));
    var score_first_question_input = document.getElementById("score_first_question")
    var score_failure_input = document.getElementById("score_failure")
    var score_success_input = document.getElementById("score_success")
    var total_questions_input = document.getElementById("total_questions")
    score_first_question_input.value = score_first_question;
    score_failure_input.value = score_failure;
    score_success_input.value = score_success;
    total_questions_input.value = total_questions;
    CountQuestions()

    const submitButton = document.querySelector('button[type="button"]');
    if (!submitButton) {
        console.error('Submit button not found');
        return;
    }
    // Обработчик отправки формы
    submitButton.addEventListener('click', async function (event) {

        // Создаем объект, содержащий данные
        var data = {
            score_first_question: score_first_question_input.value,
            score_failure: score_failure_input.value,
            score_success: score_success_input.value,
            total_questions: total_questions_input.value,
            questions: []
        };

        // Получаем значения вопросов и ответов
        var questionInputs = document.querySelectorAll('[id^=question_]');
        var answerInputs = document.querySelectorAll('[id^=answer_]');
        for (var i = 0; i < questionInputs.length; i++) {
            var question = questionInputs[i].value;
            var answer = answerInputs[i].value.toUpperCase();
            data.questions.push({ question: question, answer: answer });
        }

        // Отправляем POST-запрос на сервер
        try {
            const response = await fetch('/save_question_carousel', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.redirected) {
                // Если произошло перенаправление, перезагрузим страницу
                window.location.href = response.url;
            }
        }
        catch (error) {
            console.error('Error:', error);
        }
    });
});