var _data = require('./../Data/Questions_Square.json');

var topics = _data.topics.map(topic => topic.topic);
// Функция для получения темы по индексу
/* function getTopics() {
    return topics
} */

function getTopics() {
    return _data.topics
}

function getTopicByIndex(index) {
    if (index >= 0 && index < topics.length) {
        return topics[index];
    } else {
        return null;
    }
}

function getQuestionByTopicIndexAndLevel(topicIndex, level) {
    const topicData = _data.topics[topicIndex];
    if (topicData) {
        return topicData.questions.find(q => q.level === level);
    } else {
        return null;
    }
}

function checkAnswerByTopicIndexAndLevel(topicIndex, level, answer) {
    const question = getQuestionByTopicIndexAndLevel(topicIndex, level);
    console.log(question)
    if (question) {
        return question.answer === answer;
    } else {
        return false;
    }
}

module.exports = {
    getTopics: getTopics,
    getTopicByIndex: getTopicByIndex,
    getQuestionByTopicIndexAndLevel: getQuestionByTopicIndexAndLevel,
    checkAnswerByTopicIndexAndLevel: checkAnswerByTopicIndexAndLevel
};