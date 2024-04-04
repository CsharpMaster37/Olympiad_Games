// Объявляем переменную timerInterval в глобальной области видимости
var timerInterval;

// Переменная для хранения общего количества часов
var totalHours;

// Функция для обновления таймера
function updateTimer(startDate, endDate) {
    var currentDate = new Date(); // текущая дата и время

    if (currentDate >= endDate) {
        clearInterval(timerInterval);
        document.getElementById('timer').innerHTML = 'Время истекло';
    } else {
        var timeDifference = endDate - currentDate;

        var minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

        // Обновляем только минуты и секунды
        var timerDisplay = totalHours + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
        document.getElementById('timer').innerHTML = timerDisplay;
    }
}

// Получение начальной и конечной дат с сервера
fetch('/getTimer_square')
.then(response => response.json())
.then(data => {
    var startDate = new Date(data.startDate);
    var endDate = new Date(data.endDate);

    // Вычисляем общее количество часов при получении данных с сервера
    var timeDifference = endDate - startDate;
    totalHours = Math.floor(timeDifference / (1000 * 60 * 60));

    // Обновляем таймер сразу после получения данных с сервера
    updateTimer(startDate, endDate);
    // Обновляем таймер каждую секунду
    timerInterval = setInterval(function() {
        updateTimer(startDate, endDate);
    }, 1000);
})
.catch(error => {
    console.error('Ошибка получения данных с сервера:', error);
});