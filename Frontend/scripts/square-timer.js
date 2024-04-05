// Объявляем переменную timerInterval в глобальной области видимости
var timerInterval;

// Функция для обновления таймера
function updateTimer(startDate, endDate) {
    var currentDate = new Date(); // текущая дата и время

    if (currentDate < startDate) {
        var timeDifference = startDate - currentDate;
        document.getElementById('gameover').style.display = 'flex';
        // Переводим разницу в миллисекундах в часы, минуты и секунды
        var hours = Math.floor(timeDifference / (1000 * 60 * 60));
        var minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
        console.log(currentDate)
        console.log(startDate)
        // Обновляем таймер с оставшимся временем до начала игры
        var timerDisplay = hours + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
        document.getElementById('gameover').innerHTML = 'До начала: ' + timerDisplay;
        document.getElementById('timer').innerHTML = '--:--:--'
    } else if (currentDate >= endDate) {
        document.getElementById('gameover').style.display = 'flex';
        clearInterval(timerInterval);
        document.getElementById('gameover').innerHTML = 'Игра окончена!';
    } else {
        document.getElementById('gameover').style.display = 'none';
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
fetch('/getTimer_square')
.then(response => response.json())
.then(data => {
    var startDate = new Date(data.startDate);
    var endDate = new Date(data.endDate);
    // Обновляем таймер сразу после получения данных с сервера
    if(startDate != 'Invalid Date' && endDate != 'Invalid Date'){
        updateTimer(startDate, endDate);
    // Обновляем таймер каждую секунду
    timerInterval = setInterval(function() {
        updateTimer(startDate, endDate);
    }, 1000);
    }
    else{
        document.getElementById('timer').innerHTML = '--:--:--'
        document.getElementById('gameover').innerHTML = 'Игра ещё не началась.';
    }
})
.catch(error => {
    console.error('Ошибка получения данных с сервера:', error);
});