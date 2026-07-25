export interface QuestionItem {
  text: string;
  options: string[];
  correctIndex: number;
}

export interface LevelConfig {
  id: string;
  number: number;
  title: string;
  topic: string;
  npcName: string;
  rewardXp: number;
  questions: QuestionItem[];
  dialogues: {
    greeting: string;
    success: string;
    failure: string;
  };
}

export const LEVEL1_CONFIG: LevelConfig = {
  id: 'level_1',
  number: 1,
  title: 'Башня Переменных',
  topic: 'Переменные & Типы данных (int, str, float, bool)',
  npcName: 'Магистр Синтаксиса',
  rewardXp: 150,
  questions: [
    {
      text: 'Что выведет этот код: a = "10"; print(a * 2)?',
      options: ['20', '1010', '102', 'Ошибка TypeError'],
      correctIndex: 1
    },
    {
      text: 'Чему равно значение x после x = 5; x += 3?',
      options: ['5', '3', '8', '15'],
      correctIndex: 2
    },
    {
      text: 'Какой тип вернет выражение type(3.14 == 3) в Python?',
      options: ['float', 'int', 'bool', 'str'],
      correctIndex: 2
    },
    {
      text: 'Как правильно создать переменную user_age со значением 18?',
      options: ['var user_age = 18', 'user_age = 18', 'int user_age := 18', 'user_age : 18'],
      correctIndex: 1
    }
  ],
  dialogues: {
    greeting: 'Приветствую в вершине Башни Переменных! Покажи, повелеваешь ли ты переменными и типами данных!',
    success: 'Потрясающе! Ты заслужил титул Адепт Переменных! Портал Башни открыт!',
    failure: 'Ошибка типов нарушила структуру кода... Попробуй обуздать переменные снова!'
  }
};
