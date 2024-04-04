// Объявляем переменную timerInterval в глобальной области видимости
var timerInterval;

// Функция для обновления таймера
function updateTimer(startDate, endDate) {
    var currentDate = new Date(); // текущая дата и время

    if (currentDate >= endDate) {
        clearInterval(timerInterval);
        document.getElementById('timer').innerHTML = 'Время истекло';
    } else {
        var timeDifference = endDate - currentDate;

        // Переводим разницу в миллисекундах в часы, минуты и секунды
        var hours = Math.floor(timeDifference / (1000 * 60 * 60));
        var minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

        // Обновляем таймер с оставшимся временем
        var timerDisplay = hours + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
        document.getElementById('timer').innerHTML = timerDisplay;
    }
}

// Получение начальной и конечной дат с сервера
fetch('/getTimer_carousel')
.then(response => response.json())
.then(data => {
    var startDate = new Date(data.startDate);
    var endDate = new Date(data.endDate);

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
