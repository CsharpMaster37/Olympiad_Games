document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.form-table');

    if (!form) {
        console.error('Form element not found');
        return;
    }

    const submitButton = document.querySelector('button[type="button"]');

    if (!submitButton) {
        console.error('Submit button not found');
        return;
    }

    submitButton.addEventListener('click', async function (event) {
        const formData = {
            topics: []
        };
        const rows = form.querySelectorAll('tbody tr');

        for (let i = 0; i < rows.length; i += 5) { // Шагаем по каждой теме (каждые 5 строк)
            const topicRow = rows[i];
            const topicInput = topicRow.querySelector('input[name^="topics"]').value;

            const topicObj = {
                topic: topicInput,
                questions: []
            };

            for (let j = i; j < i + 5; j++) { // Ищем вопросы для текущей темы (следующие 4 строки)
                const row = rows[j];
                const levelInput = row.querySelector('input[name^="questions["][name$="][level]"]').value;
                const questionInput = row.querySelector('input[name^="questions["][name$="][question]"]').value;
                const answerInput = row.querySelector('input[name^="questions["][name$="][answer]"]').value;

                if (!levelInput || !questionInput || !answerInput) {
                    console.error('One or more input elements not found in row');
                    continue;
                }

                const level = parseInt(levelInput);
                const question = questionInput;
                const answer = answerInput.toUpperCase();

                topicObj.questions.push({ level, question, answer });
            }

            formData.topics.push(topicObj);
        }

        try {
            const response = await fetch('/save_square', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.redirected) {
                // Если произошло перенаправление, перезагрузим страницу
                window.location.href = response.url;
            }
        } catch (error) {
            console.error('Error sending data to server:', error);
        }
    });
});
