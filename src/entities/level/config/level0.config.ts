import type { LevelConfig } from './level1.config';

export const LEVEL0_CONFIG: LevelConfig = {
  id: 'level_0',
  number: 0,
  title: 'Старт & Обучение',
  topic: 'Основы Python (print, комментарии #, строки)',
  npcName: 'Наставник Пико',
  rewardXp: 100,
  questions: [
    {
      text: 'Какая функция используется в Python для вывода текста на экран?',
      options: ['echo()', 'print()', 'console.log()', 'write()'],
      correctIndex: 1
    },
    {
      text: 'Какой символ используется для создания однострочного комментария в Python?',
      options: ['//', '/*', '#', '--'],
      correctIndex: 2
    },
    {
      text: 'Что выведет команда print("Hello, PYCO!")?',
      options: ['"Hello, PYCO!"', 'Hello, PYCO!', 'print(Hello)', 'Ничего не выведет'],
      correctIndex: 1
    },
    {
      text: 'Какими символами выделяются текстовые строки в Python?',
      options: ['Кавычками (" " или \' \')', 'Квадратными скобками [ ]', 'Фигурными скобками { }', 'Угловыми скобками < >'],
      correctIndex: 0
    }
  ],
  dialogues: {
    greeting: 'Приветствую в мире Python! Я Наставник Пико. Давай проверим твои первые шаги!',
    success: 'Отлично справился! Ты заслужил 🥉 Кубок Библиотеки! Путь к уровням открыт!',
    failure: 'Не переживай, даже опытные программисты делают ошибки! Давай попробуем снова.'
  }
};
