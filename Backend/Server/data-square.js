const Square = require('../Models/Square');
let _data;
async function getData() {
    try {
        _data = await Square.findOne();
    } catch (error) {
        console.error("Error fetching data:", error);
        process.exit(1); // Exit with non-zero code to indicate failure
    }
}

async function initializeData() {
    await getData();
}

async function getTopics() {
    await initializeData();
    return _data.topics;
}

function getTopicByIndex(index) {
    if (_data && index >= 0 && index < _data.topics.length) {
        return _data.topics[index];
    } else {
        return null;
    }
}

function getQuestionByTopicIndexAndLevel(topicIndex, level) {
    const topicData = _data && _data.topics[topicIndex];
    if (topicData) {
        return topicData.questions.find(q => q.level === level);
    } else {
        return null;
    }
}

function checkAnswerByTopicIndexAndLevel(topicIndex, level, answer) {
    const question = getQuestionByTopicIndexAndLevel(topicIndex, level);
    console.log(question);
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
