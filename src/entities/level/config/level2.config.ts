export interface Question {
    id: string;
    questionText: string;
    codeSnippet?: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
}

export interface LevelConfig {
    id: string;
    title: string;
    description: string;
    questions: Question[];
    dialogues: {
        greeting: string;
        success: string;
        failure: string;
    };
}

export const LEVEL2_CONFIG: LevelConfig = {
    id: 'level_2',
    title: 'Янтарные Каньоны Условий',
    description: 'Освой ветвления коде (if, else, elif), логические операторы и пройди сквозь Врата Условий!',
    questions: [
        {
            id: 'l2_q1',
            questionText: 'Какое сообщение выведется на экран?',
            codeSnippet: 'temp = 30\nif temp > 25:\n    print("Жара")\nelse:\n    print("Холод")',
            options: ['Жара', 'Холод', 'temp > 25', 'Ошибка'],
            correctAnswerIndex: 0,
            explanation: 'Так как temp = 30, условие 30 > 25 истинно (True), выпонится ветка if.'
        },
        {
            id: 'l2_q2',
            questionText: 'Чему равно выражение key_code == 404 при key_code = 404?',
            codeSnippet: 'key_code = 404\nis_error = (key_code == 404)',
            options: ['True', 'False', '404', 'None'],
            correctAnswerIndex: 0,
            explanation: 'Оператор == сравнивает значения. 404 равно 404, поэтому результат True.'
        },
        {
            id: 'l2_q3',
            questionText: 'Какая ветка выполнится для level = 2?',
            codeSnippet: 'level = 2\nif level == 1:\n    print("Башня")\nelif level == 2:\n    print("Каньон")\nelse:\n    print("Замок")',
            options: ['Башня', 'Каньон', 'Замок', 'Никакая'],
            correctAnswerIndex: 1,
            explanation: 'Первое условие level == 1 ложно (False), но ветка elif level == 2 истинна (True).'
        },
        {
            id: 'l2_q4',
            questionText: 'Выполнится ли условие: has_key = True и mana = 100?',
            codeSnippet: 'has_key = True\nmana = 100\nif has_key and mana >= 50:\n    print("Заклинание")',
            options: ['Да, выполнится', 'Нет, не выполнится', 'Вызовет ошибку', 'Выведет 100'],
            correctAnswerIndex: 0,
            explanation: 'Оператор and требует истинности обоих условий. True and True дает True.'
        }
    ],
    dialogues: {
        greeting: 'Приветствую, Путник! Я — Страж Янтарного Каньона. Познай ветвления if/else, чтобы пройти Врата Условий!',
        success: 'Потрясающе! Ты укротил ветвления Python и открыл древние Врата Каньона! Держи Золотой Кубок!',
        failure: 'Ветвление коде запутывает тебя... Подумай над значениями переменных и попробуй снова!'
    }
};
