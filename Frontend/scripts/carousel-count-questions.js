function CountQuestions() {
    var totalQuestions = document.getElementById('total_questions').value;
    var questionsBody = document.getElementById('CarouselQuestionsBody');
    questionsBody.innerHTML = ''; // Clear previous rows
    for (var i = 0; i < totalQuestions; i++) {
        var row = document.createElement('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td><input type="text" id="question_${i + 1}"></td>
            <td><input type="text" id="answer_${i + 1}"></td>
        `;
        questionsBody.appendChild(row);
    }
}